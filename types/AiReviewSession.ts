export type AiReviewMode = 'mono_test' | 'separate_questions';
export type AiReviewQuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer';

export interface AiReviewQuestion {
  id: string;
  question_type: string;
  question: string;
  answer?: string;
  status: 'skipped' | 'answered' | 'evaluating' | 'generated';
  evaluation?: 'correct' | 'incorrect' | 'not_answered';
  aiMessage?: string;
}

export interface AiReviewSession {
  id?: string;
  userId: string;
  noteId: string;
  status: 'pending' | 'ready_for_review' | 'in_progress' | 'evaluating_answers' | 'completed' | 'failed';
  mode?: AiReviewMode;
  difficulty?: 'easy' | 'medium' | 'hard';
  summary?: string;
  keyTakeaways?: string[];
  generatedQuestions?: AiReviewQuestion[];
  result?: {
    totalQuestions: number;
    correctAnswers: number;
    skippedAnswers: number;
  };
  modelVersion?: string;
  errorMessage?: string;
  requestedAt?: Date;
  questionsGeneratedAt?: Date;
  sessionStartedAt?: Date;
  completedAt?: Date;
};