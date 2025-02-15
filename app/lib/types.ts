export interface Note {
  id: string;
  title: string;
  userId: string;
  isArchived: boolean;
  parentNote?: string | null;
  content: string;
  coverImage?: string | null;
  icon?: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions: string[];
}

export interface Question {
  id: string;
  noteId: string;
  userId: string;
  question: string;
  answer: string;
  createdAt: string;
  lastInterval: number;
  nextDueDate: string;
  reviewHistory: string[];
}

export type CreateQuestionData = Omit<Question, "id" | "createdAt" | "lastInterval" | "nextDueDate" | "reviewHistory">;

export type CreateNoteData = Omit<Note, "id" | "createdAt" | "updatedAt">;

export interface UserSession {
  uid: string;
  email: string;
  nickname: string;
  notes: string[];
}

export type EditorContentType = {
  type: 'doc',
  content: Array<any>
}
