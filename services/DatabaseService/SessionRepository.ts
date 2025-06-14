import { BaseRepository } from './BaseRepository';
import { Session } from '@/types/Sessions';
import type { CreateSessionInput, UpdateSessionInput } from './types';
import { logger } from '@/utils/logger';

export class SessionRepository extends BaseRepository {
  /**
   * Create a new session
   */
  public async createSession(sessionData: CreateSessionInput): Promise<Session> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO sessions (session_id, user_id, expires_at, data, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING session_id as "sessionId", user_id as "userId", expires_at as "expiresAt",
                    data, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          sessionData.sessionId,
          sessionData.userId,
          sessionData.expiresAt,
          JSON.stringify(sessionData.data || {}),
          now,
          now
        ]
      );

      return rows[0];
    });
  }

  /**
   * Get a session by session ID
   */
  public async getSessionById(sessionId: string): Promise<Session | null> {
    const { rows } = await this.executeQuery(
      `SELECT session_id as "sessionId", user_id as "userId", expires_at as "expiresAt",
              data, created_at as "createdAt", updated_at as "updatedAt"
        FROM sessions
        WHERE session_id = $1 AND expires_at > NOW()`,
      [sessionId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update a session
   */
  public async updateSession(sessionId: string, updates: UpdateSessionInput): Promise<Session | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getSessionById(sessionId);
    }

    const finalSetClause = `${setClause}, updated_at = $${nextParamIndex}`;
    const finalValues = [...values, new Date(), sessionId];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE sessions
        SET ${finalSetClause}
        WHERE session_id = $${nextParamIndex + 1}
        RETURNING session_id as "sessionId", user_id as "userId", expires_at as "expiresAt",
                  data, created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Delete a session by session ID
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM sessions WHERE session_id = $1`,
        [sessionId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Delete all sessions for a user
   */
  public async deleteUserSessions(userId: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM sessions WHERE user_id = $1`,
        [userId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM sessions WHERE expires_at <= NOW()`
      );

      const deletedCount = result.rowCount || 0;

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired sessions`);
      }

      return deletedCount;
    });
  }

  /**
   * Extend session expiration
   */
  public async extendSession(sessionId: string, newExpiresAt: Date): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `UPDATE sessions
          SET expires_at = $1, updated_at = $2
          WHERE session_id = $3 AND expires_at > NOW()`,
        [newExpiresAt, new Date(), sessionId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }
}
