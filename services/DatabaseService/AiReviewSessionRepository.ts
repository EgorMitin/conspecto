import { BaseRepository } from './BaseRepository';
import type { AiReviewSession } from '@/types/AiReviewSession';
import type { UpdateAiReviewSessionInput } from './types';


export class AiReviewSessionRepository extends BaseRepository {
  /**
   * Create a new AI review session
   */
  public async createAiReviewSession(session: Omit<AiReviewSession, 'id'>): Promise<AiReviewSession> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      session.requestedAt = session.requestedAt || now;

      const { rows } = await client.query(
        `INSERT INTO ai_review_sessions (
          user_id, source_id, source_type, status, mode, difficulty, summary, key_takeaways,
          generated_questions, result, model_version, error_message,
          requested_at, questions_generated_at, session_started_at, completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, user_id as "userId", source_id as "sourceId", source_type as "sourceType", status, mode, difficulty,
                  summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                  result, model_version as "modelVersion", error_message as "errorMessage",
                  requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                  session_started_at as "sessionStartedAt", completed_at as "completedAt"`,
        [
          session.userId,
          session.sourceId,
          session.sourceType,
          session.status,
          session.mode,
          session.difficulty,
          session.summary,
          session.keyTakeaways,
          JSON.stringify(session.generatedQuestions || []),
          JSON.stringify(session.result || {}),
          session.modelVersion,
          session.errorMessage,
          session.requestedAt,
          session.questionsGeneratedAt,
          session.sessionStartedAt,
          session.completedAt
        ]
      );

      return rows[0];
    });
  }

  /**
   * Get an AI review session by ID
   */
  public async getAiReviewSessionById(id: string): Promise<AiReviewSession | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", source_id as "sourceId", source_type as "sourceType", status, mode, difficulty,
              summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
              result, model_version as "modelVersion", error_message as "errorMessage",
              requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
              session_started_at as "sessionStartedAt", completed_at as "completedAt"
      FROM ai_review_sessions
      WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all AI review sessions for a user
   */
  public async getAiReviewSessionsByUserId(userId: string): Promise<AiReviewSession[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", source_id as "sourceId", source_type as "sourceType", status, mode, difficulty,
              summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
              result, model_version as "modelVersion", error_message as "errorMessage",
              requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
              session_started_at as "sessionStartedAt", completed_at as "completedAt"
      FROM ai_review_sessions
      WHERE user_id = $1
      ORDER BY requested_at DESC`,
      [userId]
    );

    return rows;
  }

  /**
   * Get all AI review sessions for a note
   */
  public async getAiReviewSessionsByNoteId(noteId: string): Promise<AiReviewSession[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", source_id as "sourceId", source_type as "sourceType", status, mode, difficulty,
              summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
              result, model_version as "modelVersion", error_message as "errorMessage",
              requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
              session_started_at as "sessionStartedAt", completed_at as "completedAt"
      FROM ai_review_sessions
      WHERE source_id = $1
      ORDER BY requested_at DESC`,
      [noteId]
    );

    return rows;
  }

  /**
   * Update an AI review session
   */
  public async updateAiReviewSession(id: string, updates: UpdateAiReviewSessionInput): Promise<AiReviewSession | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getAiReviewSessionById(id);
    }

    const finalValues = [...values, id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
      UPDATE ai_review_sessions
      SET ${setClause}
      WHERE id = $${nextParamIndex}
      RETURNING id, user_id as "userId", source_id as "sourceId", source_type as "sourceType", status, mode, difficulty,
                summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                result, model_version as "modelVersion", error_message as "errorMessage",
                requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                session_started_at as "sessionStartedAt", completed_at as "completedAt"`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Update AI review session status
   */
  public async updateAiReviewSessionStatus(
    id: string,
    status: AiReviewSession['status'],
    timestamps?: Pick<AiReviewSession, 'questionsGeneratedAt' | 'sessionStartedAt' | 'completedAt'>
  ): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      let queryText = `UPDATE ai_review_sessions SET status = $1`;
      const queryParams: Array<AiReviewSession['status'] | Date | string> = [status];
      let paramCount = 2;

      // Add timestamp updates if provided
      if (timestamps) {
        if (timestamps.questionsGeneratedAt) {
          queryText += `, questions_generated_at = $${paramCount++}`;
          queryParams.push(timestamps.questionsGeneratedAt);
        }
        if (timestamps.sessionStartedAt) {
          queryText += `, session_started_at = $${paramCount++}`;
          queryParams.push(timestamps.sessionStartedAt);
        }
        if (timestamps.completedAt) {
          queryText += `, completed_at = $${paramCount++}`;
          queryParams.push(timestamps.completedAt);
        }
      }

      queryText += ` WHERE id = $${paramCount}`;
      queryParams.push(id);

      const result = await client.query(queryText, queryParams);
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Delete an AI review session
   */
  public async deleteAiReviewSession(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM ai_review_sessions WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }
}