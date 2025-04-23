import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

/**
 * Interface for editor content data
 */
export interface EditorContent {
  id?: string;
  title: string;
  content: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface for comment data
 */
export interface CommentData {
  id: string;
  noteId: string;
  threadId?: string;
  content: string;
  author: string;
  quote?: string;
  timeStamp: number;
  deleted?: boolean;
  type: 'comment' | 'thread';
}

/**
 * Database Service - Singleton pattern implementation
 * Handles all database interactions with PostgreSQL
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection pool
   */
  public initialize(connectionString: string): void {
    try {
      this.pool = new Pool({
        connectionString,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
      });

      // Test connection
      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
      });

      logger.info('Database service initialized');
    } catch (error) {
      logger.error('Failed to initialize database connection', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  private async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return await this.pool.connect();
  }

  /**
   * Create database tables if they don't exist
   */
  public async ensureTablesExist(): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      // Create notes table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          user_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create comments table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id VARCHAR(255) PRIMARY KEY,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          thread_id VARCHAR(255),
          content TEXT NOT NULL,
          author VARCHAR(255) NOT NULL,
          quote TEXT,
          time_stamp BIGINT NOT NULL,
          deleted BOOLEAN DEFAULT FALSE,
          type VARCHAR(20) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);
      
      await client.query('COMMIT');
      logger.info('Database tables initialized');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create database tables', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Save editor content to database
   */
  public async saveNote(note: EditorContent): Promise<EditorContent> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      const now = new Date();
      
      if (note.id) {
        // Update existing note
        const { rows } = await client.query(
          `UPDATE notes 
           SET title = $1, content = $2, user_id = $3, updated_at = $4
           WHERE id = $5
           RETURNING id, title, content, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
          [note.title, note.content, note.userId, now, note.id]
        );
        
        await client.query('COMMIT');
        return rows[0];
      } else {
        // Create new note
        const { rows } = await client.query(
          `INSERT INTO notes (title, content, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, title, content, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
          [note.title, note.content, note.userId, now, now]
        );
        
        await client.query('COMMIT');
        return rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save note', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a note by ID
   */
  public async getNoteById(id: string): Promise<EditorContent | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, title, content, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt" 
         FROM notes 
         WHERE id = $1`,
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get note with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all notes for a user
   */
  public async getNotesByUserId(userId: string): Promise<EditorContent[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, title, content, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt" 
         FROM notes 
         WHERE user_id = $1
         ORDER BY updated_at DESC`,
        [userId]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Failed to get notes for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Save a comment to the database
   */
  public async saveComment(comment: CommentData): Promise<CommentData> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      // Check if the comment already exists
      const existingComment = await client.query(
        `SELECT id FROM comments WHERE id = $1`,
        [comment.id]
      );
      
      if (existingComment.rows.length > 0) {
        // Update existing comment
        const { rows } = await client.query(
          `UPDATE comments 
           SET content = $1, deleted = $2
           WHERE id = $3
           RETURNING id, note_id as "noteId", thread_id as "threadId", content, author, quote, time_stamp as "timeStamp", deleted, type`,
          [comment.content, comment.deleted || false, comment.id]
        );
        
        await client.query('COMMIT');
        return rows[0];
      } else {
        // Create new comment
        const { rows } = await client.query(
          `INSERT INTO comments (id, note_id, thread_id, content, author, quote, time_stamp, deleted, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, note_id as "noteId", thread_id as "threadId", content, author, quote, time_stamp as "timeStamp", deleted, type`,
          [
            comment.id, 
            comment.noteId, 
            comment.threadId || null, 
            comment.content, 
            comment.author, 
            comment.quote || null, 
            comment.timeStamp, 
            comment.deleted || false, 
            comment.type
          ]
        );
        
        await client.query('COMMIT');
        return rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save comment', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all comments for a note
   */
  public async getCommentsByNoteId(noteId: string): Promise<CommentData[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, note_id as "noteId", thread_id as "threadId", content, author, quote, time_stamp as "timeStamp", deleted, type
         FROM comments 
         WHERE note_id = $1
         ORDER BY time_stamp ASC`,
        [noteId]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Failed to get comments for note ${noteId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a comment
   */
  public async deleteComment(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      // Mark comment as deleted instead of actually deleting it
      const result = await client.query(
        `UPDATE comments SET deleted = true WHERE id = $1`,
        [id]
      );
      
      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete comment with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up resources when shutting down
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database connection closed');
    }
  }
}

// Export a singleton instance
export default DatabaseService.getInstance();