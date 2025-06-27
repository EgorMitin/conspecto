import { ReviewHistoryItem } from "./AiReviewSession";

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
  status: 'active' | 'archived';
  metadata?: Record<string, any>;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date;
  history: Array<ReviewHistoryItem>;
  createdAt: Date;
  updatedAt: Date;
}