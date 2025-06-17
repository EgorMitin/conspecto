import { BaseRepository } from './BaseRepository';
import type { Question } from '@/types/Question';

export class QuestionRepository extends BaseRepository {
  /**
   * Create a new question in the database
   */
  public async createQuestion(question: Question): Promise<Question> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO questions (id, note_id, user_id, question, answer, time_stamp, repetition, interval, ease_factor, next_review, last_review, history)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history, created_at as "createdAt"`,
        [
          question.id,
          question.noteId,
          question.userId,
          question.question,
          question.answer,
          question.timeStamp,
          question.repetition,
          question.interval,
          question.easeFactor,
          question.nextReview,
          question.lastReview,
          JSON.stringify(question.history || [])
        ]
      );

      return rows[0];
    });
  }

  /**
   * Update an existing question in the database
   */
  public async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return null;
    }

    const finalValues = [...values, id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE questions
        SET ${setClause}
        WHERE id = $${nextParamIndex}
        RETURNING id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history, created_at as "createdAt"`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Get all questions for a note
   */
  public async getQuestionsByNoteId(noteId: string): Promise<(Question & { noteTitle: string })[]> {
    const { rows } = await this.executeQuery(
      `SELECT q.id, q.note_id as "noteId", q.user_id as "userId", q.question, q.answer,
              q.time_stamp as "timeStamp", q.repetition, q.interval, q.ease_factor as "easeFactor",
              q.next_review as "nextReview", q.last_review as "lastReview", q.history,
              q.created_at as "createdAt", n.title as "noteTitle"
      FROM questions q
      JOIN notes n ON q.note_id = n.id
      WHERE q.note_id = $1
      ORDER BY q.time_stamp ASC`,
      [noteId]
    );

    return rows;
  }

  /**
   * Get all questions created by a user
   */
  public async getQuestionsByUserId(userId: string): Promise<Question[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp",
              repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
              last_review as "lastReview", history, created_at as "createdAt"
      FROM questions
      WHERE user_id = $1
      ORDER BY time_stamp DESC`,
      [userId]
    );

    return rows;
  }

  /**
   * Get all questions related to notes in a folder
   */
  public async getQuestionsByFolderId(folderId: string): Promise<(Question & { folderName: string, noteTitle: string })[]> {
    const { rows } = await this.executeQuery(
      `SELECT q.id, q.note_id as "noteId", q.user_id as "userId", q.question, q.answer,
              q.time_stamp as "timeStamp", q.repetition, q.interval, q.ease_factor as "easeFactor",
              q.next_review as "nextReview", q.last_review as "lastReview", q.history,
              q.created_at as "createdAt", f.name as "folderName", n.title as "noteTitle"
      FROM questions q
      JOIN notes n ON q.note_id = n.id
      JOIN folders f ON n.folder_id = f.id
      WHERE n.folder_id = $1
      ORDER BY q.time_stamp DESC`,
      [folderId]
    );

    return rows;
  }

  /**
   * Delete a question by ID
   */
  public async deleteQuestion(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM questions WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }
}