'use server';

import { initializeAIService } from '@/services/AIService';
import { AiReviewDifficulty, AiReviewMode, AiReviewQuestionType } from '@/types/AiReviewSession';
import { logger } from '@/utils/logger';


/**
 * Server action to generate questions for an AI review session
 */
export async function generateQuestionsForSession(
  sessionId: string,
  sourceId: string,
  difficulty: AiReviewDifficulty,
  questionCount: number,
  mode: AiReviewMode,
  questionTypes?: AiReviewQuestionType[]
) {
  try {
    const aiService = initializeAIService();

    const noteContent = await aiService.getNoteContent(sessionId, sourceId);
    
    const result = await aiService.generateQuestionsForSession(
      sessionId,
      {
        noteContent,
        difficulty,
        questionCount,
        mode,
        questionTypes,
        context: {}
      }
    );

    if (!result.success) {
      return {
        data: null,
        error: result.error?.message || 'Failed to generate questions'
      };
    }

    return {
      data: result.data,
      error: null
    };

  } catch (error) {
    logger.error('Generate questions server action failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate questions'
    };
  }
}

/**
 * Server action to evaluate a single answer
 */
export async function evaluateAnswer(
  sessionId: string,
  questionId: string,
  question: string,
  userAnswer: string,
  questionType: AiReviewQuestionType
) {
  try {
    const aiService = initializeAIService();
    
    const result = await aiService.evaluateAnswer(
      sessionId,
      questionId,
      {
        question,
        userAnswer,
        questionType,
        context: {
        }
      }
    );

    if (!result.success) {
      return {
        data: null,
        error: result.error?.message || 'Failed to evaluate answer'
      };
    }

    return {
      data: result.data,
      error: null
    };

  } catch (error) {
    logger.error('Evaluate answer server action failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to evaluate answer'
    };
  }
}

/**
 * Server action to generate content insights (summary and key takeaways)
 */
export async function generateContentInsights(sourceId: string) {
  try {
    const aiService = initializeAIService();
    
    const result = await aiService.generateContentInsights(sourceId);

    if (!result.success) {
      return {
        data: null,
        error: result.error?.message || 'Failed to generate content insights'
      };
    }

    return {
      data: result.data,
      error: null
    };

  } catch (error) {
    logger.error('Generate content insights server action failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate content insights'
    };
  }
}

/**
 * Server action to get AI provider information
 */
export async function getAIProviderInfo() {
  try {
    const aiService = initializeAIService();
    const info = aiService.getProviderInfo();
    
    return {
      data: info,
      error: null
    };

  } catch (error) {
    logger.error('Get AI provider info failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get provider info'
    };
  }
}

/**
 * Server action for batch question generation
 */
export async function batchGenerateQuestions(
  sessions: Array<{
    sessionId: string;
    sourceId: string;
    difficulty: AiReviewDifficulty;
    questionCount: number;
    mode: AiReviewMode;
    questionTypes?: AiReviewQuestionType[];
  }>
) {
  try {
    const aiService = initializeAIService();
    
    const batchData = {
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        params: {
          difficulty: session.difficulty,
          questionCount: session.questionCount,
          mode: session.mode,
          questionTypes: session.questionTypes,
          noteContent: '', // Will be fetched by the service
          context: {
            sourceId: session.sourceId,
          }
        }
      }))
    };

    const result = await aiService.batchGenerateQuestions(batchData);

    if (!result.success) {
      return {
        data: null,
        error: result.error?.message || 'Failed to batch generate questions'
      };
    }

    return {
      data: result.data,
      error: null
    };

  } catch (error) {
    logger.error('Batch generate questions server action failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to batch generate questions'
    };
  }
}
