import { AiReviewDifficulty, AiReviewMode, AiReviewQuestion, AiReviewQuestionType } from '@/types/AiReviewSession';

export interface AIProvider {
  name: string;
  generateQuestions(params: QuestionGenerationParams): Promise<AiReviewQuestion[]>;
  evaluateAnswer(params: AnswerEvaluationParams): Promise<AnswerEvaluation>;
  summarizeContent(content: string): Promise<string>;
  extractKeyTakeaways?(content: string): Promise<string[]>;
}

export interface QuestionGenerationParams {
  noteContent: string;
  difficulty: AiReviewDifficulty;
  questionCount: number;
  mode: AiReviewMode;
  questionTypes?: AiReviewQuestionType[];
  context?: {
    userId?: string;
    previousSessions?: string[];
  };
}

export interface AnswerEvaluationParams {
  question: string;
  userAnswer: string;
  questionType: AiReviewQuestionType;
  context: {
    noteContent?: string;
    difficulty?: AiReviewDifficulty;
  };
}

export interface AnswerEvaluation {
  evaluation: 'correct' | 'incorrect' | 'partial';
  message: string;
  score?: number; // 0-100 for partial credit
  suggestions?: string[];
  correctAnswer?: string;
}

export type AIProviderName = 'openai' | 'anthropic' | 'google' | 'custom';

export interface AIServiceConfig {
  provider: AIProviderName;
  apiKey: string;
  model: string;
  retryAttempts?: number;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface QuestionTypeConfig {
  type: AiReviewQuestionType;
  name: string;
  description: string;
  difficulty: AiReviewDifficulty[];
  promptTemplate: string;
  maxQuestions?: number;
  weight?: number;
}

export interface ServiceSuccess<T> {
  success: true;
  data: T;
  metadata: {
    executionTime: number;
    provider: string;
    model: string;
    tokensUsed?: number;
  };
}

export interface ServiceError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    executionTime: number;
    provider: string;
    model: string;
    tokensUsed?: number;
  };
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

export interface BatchQuestionGeneration {
  sessions: Array<{
    sessionId: string;
    params: QuestionGenerationParams;
  }>;
}

export interface BatchAnswerEvaluation {
  evaluations: Array<{
    questionId: string;
    params: AnswerEvaluationParams;
  }>;
}
