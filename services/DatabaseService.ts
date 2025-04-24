import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';
import { Question } from '@/types/Question';

/**
 * Interface for editor content data
 */
export interface EditorContent {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Database Service - Singleton pattern implementation
 * Handles all database interactions
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  
  private constructor() {
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
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

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
      
      // Create questions table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id VARCHAR(255) PRIMARY KEY,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          user_id VARCHAR(255),
          question TEXT NOT NULL,
          answer TEXT,
          time_stamp BIGINT NOT NULL,
          repetition INTEGER DEFAULT 0,
          interval INTEGER DEFAULT 0,
          ease_factor FLOAT DEFAULT 2.5,
          next_review TIMESTAMP WITH TIME ZONE,
          last_review TIMESTAMP WITH TIME ZONE,
          history JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);
      
      await client.query('COMMIT');
      logger.debug('Database tables initialized');
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
   * Save a question to the database
   */
  public async saveQuestion(question: Question): Promise<Question> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      // Check if the question already exists
      const existingQuestion = await client.query(
        `SELECT id FROM questions WHERE id = $1`,
        [question.id]
      );
      
      if (existingQuestion.rows.length > 0) {
        // Update existing question
        const { rows } = await client.query(
          `UPDATE questions
           SET question = $1
           WHERE id = $2
           RETURNING id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history`,
          [question.question, question.id]
        );
        
        await client.query('COMMIT');
        return rows[0];
      } else {
        // Create new question
        const { rows } = await client.query(
          `INSERT INTO questions (id, note_id, user_id, question, answer, time_stamp, repetition, interval, ease_factor, next_review, last_review, history)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history`,
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
            question.history
          ]
        );
        
        await client.query('COMMIT');
        return rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save question', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all questions for a note
   */
  public async getQuestionsByNoteId(noteId: string): Promise<Question[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history
         FROM questions
         WHERE note_id = $1
         ORDER BY time_stamp ASC`,
        [noteId]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Failed to get questions for note ${noteId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a question by ID
   */
  public async deleteQuestion(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `DELETE FROM questions WHERE id = $1`,
        [id]
      );
      
      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete question with ID ${id}`, error);
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