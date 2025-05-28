export type QuestionHistoryItem = {
  date: number;
  quality: number;
};

export type Question = {
  id: string;
  noteId?: string;
  userId: string;
  question: string;
  answer: string;
  timeStamp: number;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date;
  history: Array<QuestionHistoryItem>;
};

export type Questions = Array<Question>;