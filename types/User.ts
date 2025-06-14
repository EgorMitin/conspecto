import { Subscription } from "./Subscription";

/**
 * Interface for user data (full database record)
 */
export interface UserData {
  id: string;
  email: string;
  username: string;
  hashedPassword: string; // Should not be sent to client directly
  salt: string; // Should not be sent to client directly
  profilePhotoUrl?: string | null;
  subscriptionPlan: Subscription | null;
  preferences?: Record<string, any>; // JSONB
  userTags?: string[] | null;
  isVerified: boolean;
  verificationToken?: string; // For email verification
  tokenExpiresAt?: Date; // For email verification
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface for user application data (client-safe)
 */
export interface User extends Omit<UserData, 'hashedPassword' | 'salt'> {}