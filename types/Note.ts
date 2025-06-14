export type NoteHistoryItem = {
  date: number;
  quality: number;
};

export interface Note {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  content: string;
  contentPlainText: string;
  tags?: string[];
  isPublic: boolean;
  iconId: string;
  bannerUrl?: string;
  status: 'active' | 'archived' | 'draft';
  metadata?: Record<string, any>;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date;
  history: Array<NoteHistoryItem>;
  createdAt: Date;
  updatedAt: Date;
}