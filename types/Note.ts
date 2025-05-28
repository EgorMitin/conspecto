export type NoteHistoryItem = {
  date: number;
  quality: number;
};

export interface Note {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  content: string;
  tags?: string[];
  isPublic: boolean;
  status: 'active' | 'archived' | 'draft';
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: string;
  lastReview: string;
  history: Array<NoteHistoryItem>;
  createdAt?: Date;
  updatedAt?: Date;
}