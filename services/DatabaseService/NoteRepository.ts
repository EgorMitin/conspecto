import { BaseRepository } from './BaseRepository';
import type { Note } from '@/types/Note';
import type { UpdateNoteInput } from './types';

export class NoteRepository extends BaseRepository {
  /**
   * Create a new note
   */
  public async createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();

      const { rows } = await client.query(
        `INSERT INTO notes (user_id, folder_id, title, content, tags, is_public, status,
                          repetition, interval, ease_factor, next_review, last_review, history,
                          content_plain_text, icon_id, banner_url, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id, user_id as "userId", folder_id as "folderId", title, content,
                  tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                  repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                  last_review as "lastReview", history, content_plain_text as "contentPlainText",
                  metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [note.userId, note.folderId, note.title, note.content, note.tags, note.isPublic, note.status,
        note.repetition, note.interval, note.easeFactor, note.nextReview, note.lastReview, JSON.stringify(note.history || []),
        note.contentPlainText, note.iconId, note.bannerUrl, JSON.stringify(note.metadata || {}),
          now, now]
      );

      return rows[0];
    });
  }

  /**
   * Update a note with partial data
   */
  public async updateNote(id: string, updates: UpdateNoteInput): Promise<Note | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getNoteById(id);
    }

    const finalSetClause = `${setClause}, updated_at = $${nextParamIndex}`;
    const finalValues = [...values, new Date(), id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE notes
        SET ${finalSetClause}
        WHERE id = $${nextParamIndex + 1}
        RETURNING id, user_id as "userId", folder_id as "folderId", title, content,
                  tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                  repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                  last_review as "lastReview", history, content_plain_text as "contentPlainText",
                  metadata, created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Get a note by ID
   */
  public async getNoteById(id: string): Promise<Note | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
              tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
              repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
              last_review as "lastReview", history, content_plain_text as "contentPlainText",                  metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM notes
       WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get note ID and title by search string
   */
  public async searchNote(searchString: string): Promise<{ id: string, title: string }[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, title
       FROM notes
       WHERE tsv @@ websearch_to_tsquery('english', $1)`,
      [searchString]
    );
    return rows;
  }

  /**
   * Get all notes for a user
   */
  public async getNotesByUserId(userId: string): Promise<Note[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
              tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
              repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
              last_review as "lastReview", history, content_plain_text as "contentPlainText",
              metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM notes
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    return rows;
  }

  /**
   * Get notes in a folder
   */
  public async getNotesByFolderId(folderId: string): Promise<Note[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
              tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
              repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
              last_review as "lastReview", history, content_plain_text as "contentPlainText",
              metadata, created_at as "createdAt", updated_at as "updatedAt"
      FROM notes
      WHERE folder_id = $1
      ORDER BY updated_at DESC`,
      [folderId]
    );

    return rows;
  }

  /**
   * Move notes to a different folder
   */
  public async moveNotesToFolder(noteIds: string[], folderId: string | null): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const result = await client.query(
        `UPDATE notes
        SET folder_id = $1, updated_at = $2
        WHERE id = ANY($3)`,
        [folderId, now, noteIds]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Delete a note by ID
   */
  public async deleteNote(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM notes WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }
}