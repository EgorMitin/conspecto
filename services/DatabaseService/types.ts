import type { Question } from '@/types/Question';
import type { Note } from '@/types/Note';
import type { User, UserData } from '@/types/User';
import type { AiReviewSession } from '@/types/AiReviewSession';
import type { Folder } from '@/types/Folder';
import { Session } from '@/types/Sessions';
import { Customer, Subscription } from '@/types/Subscription';

/**
 * Type for creating a new user
 */
export type CreateUserInput = Omit<UserData, 'id' | 'createdAt' | 'updatedAt' | 'hashedPassword' | 'salt'> & {
  email: string;
  hashedPassword?: string;
  salt?: string;
};

/**
 * Type for updating an existing user
 */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for updating a note
 */
export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for updating an AI Review Session
 */
export type UpdateAiReviewSessionInput = Partial<AiReviewSession>;

/**
 * Type for updating a session
 */
export type UpdateSessionInput = Partial<{
  expiresAt: Date;
  data: Record<string, any>;
}>;

/**
 * Type for creating a new session
 */
export interface CreateSessionInput {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  data?: Record<string, any>;
}
