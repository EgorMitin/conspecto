export type QuestionHistoryItem = {
  date: number;
  quality: 1 | 2 | 3 | 4;
};

export type Question = {
  id: string;
  noteId: string;
  userId: string;
  question: string;
  answer: string;
  timeStamp: number;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date;
  history: QuestionHistoryItem[];
};

export type Questions = Array<Question>;