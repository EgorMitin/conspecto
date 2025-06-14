export { AIService, getAIService, initializeAIService } from './AIService';

export type {
  AIProvider,
  QuestionGenerationParams,
  AnswerEvaluationParams,
  AnswerEvaluation,
  AIServiceConfig,
  ServiceResult,
  QuestionTypeConfig,
  BatchQuestionGeneration,
  BatchAnswerEvaluation,
} from './types';

export {
  QUESTION_TYPE_CONFIGS,
  DIFFICULTY_DESCRIPTIONS,
  getQuestionTypesByDifficulty,
  selectRandomQuestionTypes,
} from './config';

export { OpenAIProvider } from './providers/OpenAIProvider';