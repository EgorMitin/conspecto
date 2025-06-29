import { logger } from '@/utils/logger';
import DatabaseService from '../DatabaseService/DatabaseService';
import { AiReviewSession, AiReviewQuestionEvaluation, AiReviewSourceType } from '@/types/AiReviewSession';
import {
  AIProvider,
  QuestionGenerationParams,
  AnswerEvaluationParams,
  ServiceResult,
  AIServiceConfig,
  BatchQuestionGeneration,
  AIProviderName
} from './types';
import { getProvider } from './providers/providerRegistry';
import './providers/GoogleProvider';

/**
 * Main AI Service class that orchestrates AI operations for the review system
 * Provides a unified interface for question generation, answer evaluation, content insights and summarization
 * Supports multiple AI providers and configurations
 * Implements singleton pattern to ensure a single instance is used throughout the application
 */
export class AIService {
  private static instance: AIService;
  private provider: AIProvider;
  private config: AIServiceConfig;

  private constructor(config: AIServiceConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  /**
   * Get singleton instance of AIService
   */
  public static getInstance(config?: AIServiceConfig): AIService {
    if (!AIService.instance) {
      if (!config) {
        throw new Error('AIService configuration required for first initialization');
      }
      AIService.instance = new AIService(config);
    }
    return AIService.instance;
  }

  /**
   * Initialize with environment configuration
   */
  public static initializeFromEnv(): AIService {
    const config: AIServiceConfig = {
      provider: process.env.AI_PROVIDER as AIProviderName || 'openai',
      apiKey: process.env.AI_API_KEY!,
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
      timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
    };

    if (!config.apiKey) {
      throw new Error('AI API key not found in environment variables');
    }

    return AIService.getInstance(config);
  }

  /**
   * Generate questions for an AI review session
   */
  async generateQuestionsForSession(
    sessionId: string,
    params: QuestionGenerationParams
  ): Promise<ServiceResult<AiReviewSession>> {
    const startTime = Date.now();

    try {
      const questions = await this.provider.generateQuestions({
        ...params,
        noteContent: params.noteContent,
        context: {
          userId: params.context?.userId,
        }
      });

      const updatedSession = await DatabaseService.updateAiReviewSession(sessionId, {
        status: 'ready_for_review',
        generatedQuestions: questions,
        questionsGeneratedAt: new Date(),
      });

      if (!updatedSession) {
        return {
          success: false,
          error: {
            code: 'SESSION_UPDATE_FAILED',
            message: 'Failed to update session with generated questions',
          }
        };
      }

      return {
        success: true,
        data: updatedSession,
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };

    } catch (error) {
      logger.error('Question generation failed:', error);

      await DatabaseService.updateAiReviewSession(sessionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }).catch(dbError => {
        logger.error('Failed to update session status after error:', dbError);
      });

      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Question generation failed',
          details: error,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };
    }
  }

  /**
   * Get note context for note or folder
   */
  async getNoteContent(sourceType: string, sourceId: string): Promise<string> {
    if (sourceType === 'note') {
      const note = await DatabaseService.getNoteById(sourceId);
      if (!note) {
        throw new Error('Note not found for context retrieval');
      }
      return note.contentPlainText;
    } else if (sourceType === 'folder') {
      const notes = await DatabaseService.getNotesByFolderId(sourceId);
      if (!notes || notes.length === 0) {
        throw new Error('No notes found for folder context retrieval');
      }
      return notes.map(note => note.contentPlainText).join('\n\n');
    } else {
      const notes = await DatabaseService.getNotesByUserId(sourceId);
      if (!notes || notes.length === 0) {
        throw new Error('No notes found for user context retrieval');
      }
      return notes.map(note => note.contentPlainText).join('\n\n');
    }
  }

  /**
   * Evaluate a single answer
   */
  async evaluateAnswer(
    sessionId: string,
    questionId: string,
    params: AnswerEvaluationParams
  ): Promise<ServiceResult<{ evaluation: AiReviewQuestionEvaluation; message: string; score?: number, suggestions?: string[], correctAnswer?: string }>> {
    const startTime = Date.now();

    try {
      const session = await DatabaseService.getAiReviewSessionById(sessionId);
      if (!session) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'AI review session not found',
          }
        };
      }

      const question = session.generatedQuestions?.find(q => q.id === questionId);
      if (!question) {
        return {
          success: false,
          error: {
            code: 'QUESTION_NOT_FOUND',
            message: 'Question not found in session',
          }
        };
      }

      let noteContent: string;
      if (params.context?.noteContent === undefined) {
        try {
          noteContent = await this.getNoteContent(session.sourceType, session.sourceId);
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'NOTE_NOT_FOUND',
              message: 'Note not found in database',
            }
          };
        }
      } else {
        noteContent = params.context?.noteContent;
      }

      const evaluation = await this.provider.evaluateAnswer({
        ...params,
        context: {
          ...params.context,
          noteContent: noteContent || params.context?.noteContent,
          difficulty: session.difficulty!,
        }
      });

      const updatedQuestions = session.generatedQuestions?.map(q =>
        q.id === questionId
          ? {
            ...q,
            status: 'evaluated' as const,
            evaluation: evaluation.evaluation as AiReviewQuestionEvaluation,
            score: evaluation.score,
            suggestions: evaluation.suggestions,
            correctAnswer: evaluation.correctAnswer,
            aiMessage: evaluation.message,
            answer: params.userAnswer,
          }
          : q
      ) || [];

      await DatabaseService.updateAiReviewSession(sessionId, {
        generatedQuestions: updatedQuestions,
      });

      return {
        success: true,
        data: {
          evaluation: evaluation.evaluation as AiReviewQuestionEvaluation,
          message: evaluation.message,
          score: evaluation.score,
          suggestions: evaluation.suggestions,
          correctAnswer: evaluation.correctAnswer,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };

    } catch (error) {
      logger.error('Answer evaluation failed:', error);

      return {
        success: false,
        error: {
          code: 'EVALUATION_FAILED',
          message: error instanceof Error ? error.message : 'Answer evaluation failed',
          details: error,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };
    }
  }

  /**
   * Generate content summary and key takeaways
   */
  async generateContentInsights(
    sourceId: string,
    sourceType: AiReviewSourceType,
  ): Promise<ServiceResult<{ summary: string; keyTakeaways: string[] }>> {
    const startTime = Date.now();

    try {
      let noteContent: string;
      try {
        noteContent = await this.getNoteContent(sourceType, sourceId);
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'NOTE_NOT_FOUND',
            message: 'Note not found in database',
          }
        };
      }

      const [summary, keyTakeaways] = await Promise.all([
        this.provider.summarizeContent?.(noteContent) || Promise.resolve(''),
        this.provider.extractKeyTakeaways?.(noteContent) || Promise.resolve([]),
      ]);

      return {
        success: true,
        data: { summary, keyTakeaways },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };

    } catch (error) {
      logger.error('Content insights generation failed:', error);

      return {
        success: false,
        error: {
          code: 'INSIGHTS_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Content insights generation failed',
          details: error,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };
    }
  }

  /**
   * Batch process multiple question generations
   */
  async batchGenerateQuestions(
    batch: BatchQuestionGeneration
  ): Promise<ServiceResult<Array<{ sessionId: string; success: boolean; error?: string }>>> {
    const startTime = Date.now();
    const results: Array<{ sessionId: string; success: boolean; error?: string }> = [];

    try {
      const concurrencyLimit = 3;
      const chunks = this.chunkArray(batch.sessions, concurrencyLimit);

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (session) => {
          try {
            const result = await this.generateQuestionsForSession(
              session.sessionId,
              session.params
            );

            return {
              sessionId: session.sessionId,
              success: result.success,
              error: !result.success ? result.error?.message : "",
            };
          } catch (error) {
            return {
              sessionId: session.sessionId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }

      return {
        success: true,
        data: results,
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };

    } catch (error) {
      logger.error('Batch question generation failed:', error);

      return {
        success: false,
        error: {
          code: 'BATCH_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Batch generation failed',
          details: error,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          provider: this.provider.name,
          model: this.config.model,
        }
      };
    }
  }

  /**
   * Change AI provider
   */
  switchProvider(config: AIServiceConfig): void {
    this.config = config;
    this.provider = this.createProvider(config);
    logger.info(`Switched AI provider to: ${this.provider.name}`);
  }

  /**
   * Get current provider information
   */
  getProviderInfo(): { name: string; model?: string; config: Partial<AIServiceConfig> } {
    return {
      name: this.provider.name,
      model: this.config.model,
      config: {
        provider: this.config.provider,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      }
    };
  }

  private createProvider(config: AIServiceConfig): AIProvider {
    const provider = getProvider(config.provider);
    if (!provider) {
      throw new Error(`AI provider '${config.provider}' is not registered`);
    }
    return provider;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export function getAIService(): AIService {
  return AIService.getInstance();
}

export function initializeAIService(): AIService {
  return AIService.initializeFromEnv();
}
