import { ReviewHistoryItem } from "./AiReviewSession";
import { Note } from "./Note";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  iconId: string;
  inTrash: boolean;
  logo?: string | null;
  bannerUrl?: string;
  notes: Note[];
  metadata?: Record<string, any>;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReview: Date;
  lastReview: Date;
  history: Array<ReviewHistoryItem>;
  createdAt?: Date;
  updatedAt: Date;
}