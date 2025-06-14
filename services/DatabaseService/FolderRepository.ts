import { BaseRepository } from './BaseRepository';
import type { Folder } from '@/types/Folder';
import { logger } from '@/utils/logger';

export class FolderRepository extends BaseRepository {
  /**
   * Create a new folder
   */
  public async createFolder(folder: Folder): Promise<Folder> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO folders (id, user_id, name, icon_id, in_trash, logo, banner_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                  logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"`,
        [folder.id, folder.userId, folder.name, folder.iconId, folder.inTrash, folder.logo, folder.bannerUrl,
        folder.createdAt || now, now]
      );

      return { ...rows[0], notes: [] };
    });
  }

  /**
   * Get a folder by ID
   */
  public async getFolderById(id: string): Promise<Folder | null> {
    const { rows: folderRows } = await this.executeQuery(
      `SELECT id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
              logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"
      FROM folders
      WHERE id = $1`,
      [id]
    );

    if (folderRows.length === 0) return null;
    const folder = folderRows[0];

    const { rows: noteRows } = await this.executeQuery(
      `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
               tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
               repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history,
               created_at as "createdAt", updated_at as "updatedAt"
      FROM notes
      WHERE folder_id = $1
      ORDER BY updated_at DESC`,
      [id]
    );

    return { ...folder, notes: noteRows };
  }

  /**
   * Get all folders for a user
   */
  public async getFoldersByUserId(userId: string): Promise<Folder[]> {
    const { rows: folderRows } = await this.executeQuery(
      `SELECT id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
              logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"
      FROM folders
      WHERE user_id = $1
      ORDER BY name ASC`,
      [userId]
    );

    if (folderRows.length === 0) return [];

    const folderIds = folderRows.map(folder => folder.id);
    const { rows: noteRows } = await this.executeQuery(
      `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
               tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
               repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history,
               content_plain_text as "contentPlainText", metadata, created_at as "createdAt", updated_at as "updatedAt"
      FROM notes
      WHERE folder_id = ANY($1)
      ORDER BY updated_at DESC`,
      [folderIds]
    );

    // Group notes by folder ID
    const notesByFolderId: Record<string, any[]> = {};
    noteRows.forEach(note => {
      if (!notesByFolderId[note.folderId]) {
        notesByFolderId[note.folderId] = [];
      }
      notesByFolderId[note.folderId].push(note);
    });

    return folderRows.map(folder => ({
      ...folder,
      notes: notesByFolderId[folder.id] || []
    }));
  }

  /**
   * Update a folder
   */
  public async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getFolderById(id);
    }

    const finalSetClause = `${setClause}, updated_at = $${nextParamIndex}`;
    const finalValues = [...values, new Date(), id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE folders
        SET ${finalSetClause}
        WHERE id = $${nextParamIndex + 1}
        RETURNING id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                  logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, finalValues);

      if (rows.length === 0) {
        return null;
      }

      const updatedFolder = rows[0];

      const { rows: noteRows } = await client.query(
        `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
                 tags, is_public as "isPublic", status,
                 repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history,
                 created_at as "createdAt", updated_at as "updatedAt"
        FROM notes
        WHERE folder_id = $1
        ORDER BY updated_at DESC`,
        [id]
      );

      return { ...updatedFolder, notes: noteRows };
    });
  }

  /**
   * Delete a folder by ID
   */
  public async deleteFolder(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM folders WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Check if a folder name already exists for a user
   */
  public async folderNameExists(userId: string, name: string): Promise<boolean> {
    const { rows } = await this.executeQuery(
      `SELECT COUNT(*) as count
      FROM folders
      WHERE user_id = $1 AND name = $2`,
      [userId, name]
    );

    return parseInt(rows[0].count, 10) > 0;
  }
}