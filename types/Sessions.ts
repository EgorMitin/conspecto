/**
 * Session type
 */
export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};