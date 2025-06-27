import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';

import type { Question } from '@/types/Question';
import type { Note } from '@/types/Note';
import type { User, UserData } from '@/types/User';
import type { AiReviewSession } from '@/types/AiReviewSession';
import type { Folder } from '@/types/Folder';

import { Session } from '@/types/Sessions';
import { Customer, Subscription } from '@/types/Subscription';
import config from '@/config/database';

/**
 * Type for creating a new user
 */
type CreateUserInput = Omit<UserData, 'id' | 'createdAt' | 'updatedAt' | 'hashedPassword' | 'salt'> & {
  email: string;
  hashedPassword?: string;
  salt?: string;
};

/**
 * Type for updating an existing user
 */
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for updating a note
 */
type UpdateNoteInput = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for updating an AI Review Session
 */
type UpdateAiReviewSessionInput = Partial<AiReviewSession>;

/**
 * Type for updating a session
 */
type UpdateSessionInput = Partial<{
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
};


/**
 * Database Service - Singleton pattern implementation
 * Handles all database interactions
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  private static lastConnectionString: string | null = null;
  private isInitializingTables = false;
  private tablesInitialized = false;

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
    DatabaseService.lastConnectionString = connectionString;

    if (this.pool) {
      logger.warn('Database service is being re-initialized. An existing pool was present.');
    }

    try {
      this.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
      });

      logger.info('Database service initialized');
    } catch (error) {
      logger.error('Failed to initialize database connection', error);
      this.pool = null;
      throw error;
    }
  }

  /**
   * Get a client from the pool.
   * Attempts to initialize the pool if not already initialized and a connection string is available.
   */
  private async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      let connectionStringToUse = DatabaseService.lastConnectionString;

      if (!connectionStringToUse && config.database.url) {
        logger.info('No lastConnectionString found, attempting to use process.env.POSTGRES_URL');
        connectionStringToUse = config.database.url;
      }

      if (connectionStringToUse) {
        logger.info('Database pool not initialized in getClient. Attempting to initialize.');
        try {
          this.initialize(connectionStringToUse);
        } catch (initError) {
          logger.error('On-demand initialization attempt within getClient failed.', initError);
          throw initError;
        }

        if (!this.pool) {
          throw new Error('Database pool remains uninitialized after on-demand initialization attempt.');
        }
      } else {
        throw new Error('Database pool is not initialized, and no connection string is available (checked lastConnectionString and process.env.POSTGRES_URL).');
      }
    }

    return await this.pool.connect();
  }

  /**
   * Create database tables if they don't exist
   */
  public async ensureTablesExist(): Promise<void> {
    const client = await this.getClient();
    if (this.tablesInitialized) {
      return;
    }

    if (this.isInitializingTables) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (this.tablesInitialized) {
        return;
      }
      throw new Error('Database tables are being initialized by another process');
    }

    this.isInitializingTables = true;

    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE,
          hashed_password VARCHAR(255),
          salt VARCHAR(255),
          profile_photo_url TEXT,
          preferences JSONB, -- For various user settings
          user_tags TEXT[],
          -- For email verification
          is_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          token_expires_at TIMESTAMP WITH TIME ZONE,
          billing_address JSONB, -- e.g., { street: '', city: '', state: '', zip: '' }
          payment_method JSONB, -- e.g., { type: 'card', last4: '1234', exp_month: 12, exp_year: 2025 }
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS user_oauth_accounts (
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider VARCHAR(50) NOT NULL, -- e.g., 'google', 'github', 'apple'
          provider_account_id VARCHAR(255) NOT NULL, -- Unique ID from the provider
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_provider_type_id UNIQUE (provider, provider_account_id)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(255) PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50),
          metadata JSONB,
          price INTEGER,
          quantity INTEGER,
          cancel_at_period_end BOOLEAN,
          created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          current_period_end TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          ended_at TIMESTAMP WITH TIME ZONE,
          cancel_at TIMESTAMP WITH TIME ZONE,
          canceled_at TIMESTAMP WITH TIME ZONE,
          trial_start TIMESTAMP WITH TIME ZONE,
          trial_end TIMESTAMP WITH TIME ZONE
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY NOT NULL,
          stripe_customer_id VARCHAR(255) NOT NULL UNIQUE
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS folders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          icon_id VARCHAR(50),
          in_trash BOOLEAN DEFAULT FALSE,
          logo TEXT,
          banner_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_user_folder_name UNIQUE (user_id, name)
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          content_plain_text TEXT, -- For FTS
          tags TEXT[], -- Tags specific to this note
          is_public BOOLEAN DEFAULT FALSE,
          icon_id VARCHAR(50),
          banner_url TEXT,
          status VARCHAR(50) DEFAULT 'active', -- e.g., 'active', 'archived'
          metadata JSONB, -- Additional metadata for the note
          -- SRS fields for the note itself
          repetition INTEGER DEFAULT 0,
          interval INTEGER DEFAULT 0, -- Initial interval (e.g., 1 day)
          ease_factor FLOAT DEFAULT 2.5,
          next_review TIMESTAMP WITH TIME ZONE,
          last_review TIMESTAMP WITH TIME ZONE,
          history JSONB, -- Array of SRS review history: [{reviewed_at, outcome, new_interval, new_ease_factor}]
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_next_review ON notes(next_review);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN (tags);`);
      // For Full-Text Search
      await client.query(`
        ALTER TABLE notes ADD COLUMN IF NOT EXISTS tsv tsvector
          GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || COALESCE(content_plain_text, ''))) STORED;
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_tsv ON notes USING GIN (tsv);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id VARCHAR(255) PRIMARY KEY,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          user_id VARCHAR(255),
          question TEXT NOT NULL,
          answer TEXT,
          time_stamp BIGINT NOT NULL,
          -- SRS fields
          repetition INTEGER DEFAULT 0,
          interval INTEGER DEFAULT 0,
          ease_factor FLOAT DEFAULT 2.5,
          next_review TIMESTAMP WITH TIME ZONE,
          last_review TIMESTAMP WITH TIME ZONE,
          history JSONB NOT NULL, -- Array of SRS review history: [{date, quality}]
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS ai_review_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'ready_for_review', 'in_progress', 'evaluating_answers', 'completed'
          mode VARCHAR(50), -- 'mono_test', 'separate_questions'
          difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
          summary TEXT,
          key_takeaways TEXT[],
          generated_questions JSONB,
          -- Example structure for each question in generated_questions array:
          -- {
          --   "question_id": "uuid",
          --   "question_text": "...",
          --   "question_type": "...",
          --   "user_answer": "...",
          --   "status": "generated", -- 'generated', 'skipped', 'answered', 'evaluating'
          --   "ai_message": "...",
          --   "is_correct": null -- boolean
          -- }
          result JSONB, -- e.g., {"total_questions": 10, "correct_answers": 7, "skipped_answers": 1}
          model_version VARCHAR(100),
          error_message TEXT,
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          questions_generated_at TIMESTAMP WITH TIME ZONE,
          session_started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          CONSTRAINT fk_ai_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_ai_session_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_review_sessions_user_id ON ai_review_sessions(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_review_sessions_note_id ON ai_review_sessions(note_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_review_sessions_status ON ai_review_sessions(status);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(255) PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);`);

      await client.query('COMMIT');
      this.tablesInitialized = true;
      logger.debug('Database tables initialized');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create database tables', error);
      throw error;
    } finally {
      this.isInitializingTables = false;
      client.release();
    }
  }

  /**
   * Create a new note
   */
  public async createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const now = new Date();

      const { rows } = await client.query(
        `INSERT INTO notes (user_id, folder_id, title, content, tags, is_public, status,
                          repetition, interval, ease_factor, next_review, last_review, history,
                          content_plain_text, icon_id, banner_url, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id, user_id as "userId", folder_id as "folderId", title, content,
                  tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                  repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                  last_review as "lastReview", history, content_plain_text as "plainTextContent",
                  metadata, created_at as "createdAt", updated_at as "updatedAt"`,
        [note.userId, note.folderId, note.title, note.content, note.tags, note.isPublic, note.status,
        note.repetition, note.interval, note.easeFactor, note.nextReview, note.lastReview, JSON.stringify(note.history || []),
        note.plainTextContent, note.iconId, note.bannerUrl, JSON.stringify(note.metadata || {}),
          now, now]
      );

      await client.query('COMMIT');
      return rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create note', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a note with partial data
   */
  public async updateNote(id: string, updates: UpdateNoteInput): Promise<Note | null> {
    const client = await this.getClient();
    logger.info('updating the note')
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        userId: 'user_id',
        folderId: 'folder_id',
        title: 'title',
        content: 'content',
        plainTextContent: 'content_plain_text',
        tags: 'tags',
        isPublic: 'is_public',
        status: 'status',
        iconId: 'icon_id',
        bannerUrl: 'banner_url',
        repetition: 'repetition',
        interval: 'interval',
        easeFactor: 'ease_factor',
        nextReview: 'next_review',
        lastReview: 'last_review',
        history: 'history',
        metadata: 'metadata'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);
          if (key === 'history' || key === 'metadata') {
            values.push(JSON.stringify(value || (key === 'history' ? [] : {})));
          } else {
            values.push(value);
          }
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return this.getNoteById(id);
      }

      setClauses.push(`updated_at = $${valueCount++}`);
      values.push(new Date());
      values.push(id); // For the WHERE clause

      const queryText = `
        UPDATE notes
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, user_id as "userId", folder_id as "folderId", title, content,
                  tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                  repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                  last_review as "lastReview", history, content_plain_text as "plainTextContent",
                  metadata, created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, values);

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update note with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a note by ID
   */
  public async getNoteById(id: string): Promise<Note | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
                tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                last_review as "lastReview", history, content_plain_text as "plainTextContent",
                metadata, created_at as "createdAt", updated_at as "updatedAt"
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
   * Get note ID and title by search string
   */
  public async searchNote(searchString: string): Promise<{ id: string, title: string }[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, title
         FROM notes
         WHERE tsv @@ websearch_to_tsquery('english', $1)`,
        [searchString]
      );
      return rows;
    } catch (error) {
      logger.error(`failed to search notes with string ${searchString}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all notes for a user
   */
  public async getNotesByUserId(userId: string): Promise<Note[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
                tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                last_review as "lastReview", history, content_plain_text as "plainTextContent",
                metadata, created_at as "createdAt", updated_at as "updatedAt"
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
   * Delete a note by ID
   */
  public async deleteNote(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM notes WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete note with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new question in the database
   */
  public async createQuestion(question: Question): Promise<Question> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

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

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create question', error);
      throw error;
    } finally {
      client.release();
    }
  }
  /**
   * Update an existing question in the database
   */
  public async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        noteId: 'note_id',
        userId: 'user_id',
        question: 'question',
        answer: 'answer',
        timeStamp: 'time_stamp',
        repetition: 'repetition',
        interval: 'interval',
        easeFactor: 'ease_factor',
        nextReview: 'next_review',
        lastReview: 'last_review',
        history: 'history'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);
          if (key === 'history') {
            values.push(JSON.stringify(value || []));
          } else {
            values.push(value);
          }
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      values.push(id); // For the WHERE clause

      const queryText = `
        UPDATE questions
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp", repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history, created_at as "createdAt"`;

      const { rows } = await client.query(queryText, values);

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update question with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all questions for a note
   */
  public async getQuestionsByNoteId(noteId: string): Promise<(Question & { noteTitle: string })[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
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
    } catch (error) {
      logger.error(`Failed to get questions for note ${noteId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all questions created by a user
   */
  public async getQuestionsByUserId(userId: string): Promise<Question[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, note_id as "noteId", user_id as "userId", question, answer, time_stamp as "timeStamp",
                repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                last_review as "lastReview", history, created_at as "createdAt"
        FROM questions
        WHERE user_id = $1
        ORDER BY time_stamp DESC`,
        [userId]
      );

      return rows;
    } catch (error) {
      logger.error(`Failed to get questions for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all questions related to notes in a folder
   */
  public async getQuestionsByFolderId(folderId: string): Promise<(Question & { folderName: string, noteTitle: string })[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
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
    } catch (error) {
      logger.error(`Failed to get questions for folder ${folderId}`, error);
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
   * Create a new user
   */
  public async createUser(userData: CreateUserInput): Promise<User> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO users (email, username, hashed_password, salt, profile_photo_url, preferences, user_tags, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, email, username, profile_photo_url as "profilePhotoUrl",
              preferences, user_tags as "userTags",
              created_at as "createdAt", updated_at as "updatedAt"`,
        [
          userData.email,
          userData.username,
          userData.hashedPassword,
          userData.salt,
          userData.profilePhotoUrl,
          userData.preferences || {},
          userData.userTags,
          now,
          now
        ]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create user', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get active subscription for a user
   */
  public async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", status, metadata, price, quantity,
                cancel_at_period_end as "cancelAtPeriodEnd", created,
                current_period_start as "currentPeriodStart",
                current_period_end as "currentPeriodEnd",
                ended_at as "endedAt", cancel_at as "cancelAt",
                canceled_at as "canceledAt", trial_start as "trialStart",
                trial_end as "trialEnd"
        FROM subscriptions
        WHERE user_id = $1 AND status = 'active'
        ORDER BY created DESC
        LIMIT 1`,
        [userId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get active subscription for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a user by ID
   */
  public async getUserById(id: string): Promise<User | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, email, username, profile_photo_url as "profilePhotoUrl",
                preferences, user_tags as "userTags",
                created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) return null;

      const subscription = await this.getUserActiveSubscription(id);
      return { ...rows[0], subscriptionPlan: subscription };
    } catch (error) {
      logger.error(`Failed to get user with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a user by email
   * Include hashed_password and salt for authentication purposes server-side
   */
  public async getUserByEmail(email: string): Promise<(UserData & { hashedPassword: string, salt: string }) | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, email, username, hashed_password as "hashedPassword", salt,
                profile_photo_url as "profilePhotoUrl",
                preferences, user_tags as "userTags", is_verified as "isVerified",
                created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE email = $1`,
        [email]
      );
      if (rows.length === 0) return null;

      const subscription = await this.getUserActiveSubscription(rows[0].id);
      return { ...rows[0], subscriptionPlan: subscription };
    } catch (error) {
      logger.error(`Failed to get user with email ${email}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a user
   * Password updates are handled separately with salt and hashing.
   * Payment method updates are also handled separately.
   */
  public async updateUser(id: string, updates: UpdateUserInput): Promise<User | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        username: 'username',
        profilePhotoUrl: 'profile_photo_url',
        preferences: 'preferences',
        userTags: 'user_tags',
        email: 'email'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);
          values.push(value);
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return this.getUserById(id);
      }

      setClauses.push(`updated_at = $${valueCount++}`);
      values.push(new Date());
      values.push(id); // For the WHERE clause

      const queryText = `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, email, username, profile_photo_url as "profilePhotoUrl",
                  preferences, user_tags as "userTags",
                  created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, values);

      const subscription = await this.getUserActiveSubscription(id);

      await client.query('COMMIT');
      return rows.length > 0 ? { ...rows[0], subscriptionPlan: subscription } : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update user with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Updates a user's hashed password and salt.
   * This method expects the new password to be already hashed and a new salt to be provided.
   */
  public async updateUserAuthCredentials(userId: string, newHashedPassword: string, newSalt: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const now = new Date();

      const result = await client.query(
        `UPDATE users
         SET hashed_password = $1, salt = $2, updated_at = $3
         WHERE id = $4`,
        [newHashedPassword, newSalt, now, userId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update auth credentials for user ID ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Updates a user's payment method and billing address.
   */
  public async updateUserPaymentData(
    userId: string,
    newPaymentMethod: Record<string, any>,
    newBillingAddress: Record<string, any>
  ): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const now = new Date();

      const result = await client.query(
        `UPDATE users
          SET payment_method = $1, billing_address = $2, updated_at = $3
          WHERE id = $4`,
        [JSON.stringify(newPaymentMethod), JSON.stringify(newBillingAddress), now, userId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update payment data for user ID ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a user's payment data by id
   * Include billing address and payment method for payment purposes server-side
   */
  public async getUserPaymentDataById(id: string): Promise<(UserData & { billingAddress: Record<string, any>, paymentMethod: Record<string, any> }) | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, email, username, billing_address as "billingAddress", payment_method as "paymentMethod",
                profile_photo_url as "profilePhotoUrl",
                preferences, user_tags as "userTags", is_verified as "isVerified",
                created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE id = $1`,
        [id]
      );
      if (rows.length === 0) return null;

      const subscription = await this.getUserActiveSubscription(id);
      return rows.length > 0 ? { ...rows[0], subscriptionPlan: subscription } : null;
    } catch (error) {
      logger.error(`Failed to get payment data for user with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a user by ID
   */
  public async deleteUser(id: string): Promise<boolean> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM users WHERE id = $1`,
        [id]
      );
      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete user with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new AI review session
   */
  public async createAiReviewSession(session: Omit<AiReviewSession, 'id'>): Promise<AiReviewSession> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const now = new Date();
      session.requestedAt = session.requestedAt || now;

      const { rows } = await client.query(
        `INSERT INTO ai_review_sessions (
          user_id, note_id, status, mode, difficulty, summary, key_takeaways,
          generated_questions, result, model_version, error_message,
          requested_at, questions_generated_at, session_started_at, completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, user_id as "userId", note_id as "noteId", status, mode, difficulty,
                  summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                  result, model_version as "modelVersion", error_message as "errorMessage",
                  requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                  session_started_at as "sessionStartedAt", completed_at as "completedAt"`,
        [
          session.userId,
          session.noteId,
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

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create AI review session', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get an AI review session by ID
   */
  public async getAiReviewSessionById(id: string): Promise<AiReviewSession | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", note_id as "noteId", status, mode, difficulty,
                summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                result, model_version as "modelVersion", error_message as "errorMessage",
                requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                session_started_at as "sessionStartedAt", completed_at as "completedAt"
        FROM ai_review_sessions
        WHERE id = $1`,
        [id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get AI review session with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all AI review sessions for a user
   */
  public async getAiReviewSessionsByUserId(userId: string): Promise<AiReviewSession[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", note_id as "noteId", status, mode, difficulty,
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
    } catch (error) {
      logger.error(`Failed to get AI review sessions for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all AI review sessions for a note
   */
  public async getAiReviewSessionsByNoteId(noteId: string): Promise<AiReviewSession[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", note_id as "noteId", status, mode, difficulty,
                summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                result, model_version as "modelVersion", error_message as "errorMessage",
                requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                session_started_at as "sessionStartedAt", completed_at as "completedAt"
        FROM ai_review_sessions
        WHERE note_id = $1
        ORDER BY requested_at DESC`,
        [noteId]
      );

      return rows;
    } catch (error) {
      logger.error(`Failed to get AI review sessions for note ${noteId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an AI review session
   */
  public async updateAiReviewSession(id: string, updates: UpdateAiReviewSessionInput): Promise<AiReviewSession | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        userId: 'user_id',
        noteId: 'note_id',
        status: 'status',
        mode: 'mode',
        difficulty: 'difficulty',
        summary: 'summary',
        keyTakeaways: 'key_takeaways',
        generatedQuestions: 'generated_questions',
        result: 'result',
        modelVersion: 'model_version',
        errorMessage: 'error_message',
        questionsGeneratedAt: 'questions_generated_at',
        sessionStartedAt: 'session_started_at',
        completedAt: 'completed_at'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);

          if (key === 'generatedQuestions' || key === 'result') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return this.getAiReviewSessionById(id);
      }

      values.push(id); // For the WHERE clause

      const queryText = `
      UPDATE ai_review_sessions
      SET ${setClauses.join(', ')}
      WHERE id = $${valueCount}
      RETURNING id, user_id as "userId", note_id as "noteId", status, mode, difficulty,
                summary, key_takeaways as "keyTakeaways", generated_questions as "generatedQuestions",
                result, model_version as "modelVersion", error_message as "errorMessage",
                requested_at as "requestedAt", questions_generated_at as "questionsGeneratedAt",
                session_started_at as "sessionStartedAt", completed_at as "completedAt"`;

      const { rows } = await client.query(queryText, values);

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update AI review session with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update AI review session status
   */
  public async updateAiReviewSessionStatus(
    id: string,
    status: AiReviewSession['status'],
    timestamps?: Pick<AiReviewSession, 'questionsGeneratedAt' | 'sessionStartedAt' | 'completedAt'>
  ): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      let queryText = `UPDATE ai_review_sessions SET status = $1`;
      const queryParams: Array<AiReviewSession['status'] | Date | string> = [status];
      let paramCount = 2;

      // Add timestamp updates if provided
      if (timestamps) {
        const fieldMap: Record<keyof Pick<AiReviewSession, 'questionsGeneratedAt' | 'sessionStartedAt' | 'completedAt'>, string> = {
          questionsGeneratedAt: 'questions_generated_at',
          sessionStartedAt: 'session_started_at',
          completedAt: 'completed_at'
        };

        for (const [key, value] of Object.entries(timestamps) as [keyof typeof timestamps, Date][]) {
          if (value && fieldMap[key]) {
            queryText += `, ${fieldMap[key]} = $${paramCount++}`;
            queryParams.push(value);
          }
        }
      }

      queryText += ` WHERE id = $${paramCount}`;
      queryParams.push(id);

      const result = await client.query(queryText, queryParams);

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update status for AI review session with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an AI review session
   */
  public async deleteAiReviewSession(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM ai_review_sessions WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete AI review session with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new folder
   */
  public async createFolder(folder: Folder): Promise<Folder> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO folders (id, user_id, name, icon_id, in_trash, logo, banner_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                  logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"`,
        [folder.id, folder.userId, folder.name, folder.iconId, folder.inTrash, folder.logo, folder.bannerUrl,
        folder.createdAt || now, now]
      );

      await client.query('COMMIT');
      return { ...rows[0], notes: [] };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create folder', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a folder by ID
   */
  public async getFolderById(id: string): Promise<Folder | null> {
    const client = await this.getClient();
    try {
      const { rows: folderRows } = await client.query(
        `SELECT id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"
        FROM folders
        WHERE id = $1`,
        [id]
      );

      if (folderRows.length === 0) return null;
      const folder = folderRows[0];

      const { rows: noteRows } = await client.query(
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
    } catch (error) {
      logger.error(`Failed to get folder with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all folders for a user
   */
  public async getFoldersByUserId(userId: string): Promise<Folder[]> {
    const client = await this.getClient();
    try {
      const { rows: folderRows } = await client.query(
        `SELECT id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"
        FROM folders
        WHERE user_id = $1
        ORDER BY name ASC`,
        [userId]
      );

      if (folderRows.length === 0) return [];

      const folderIds = folderRows.map(folder => folder.id);
      const { rows: noteRows } = await client.query(
        `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
                 tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                 repetition, interval, ease_factor as "easeFactor", next_review as "nextReview", last_review as "lastReview", history,
                 content_plain_text as "plainTextContent", metadata, created_at as "createdAt", updated_at as "updatedAt"
        FROM notes
        WHERE folder_id = ANY($1)
        ORDER BY updated_at DESC`,
        [folderIds]
      );

      const notesByFolderId = Object.groupBy(noteRows, note => note.folderId);

      return folderRows.map(folder => ({
        ...folder,
        notes: notesByFolderId[folder.id] || []
      }));
    } catch (error) {
      logger.error(`Failed to get folders for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a folder
   */
  public async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        name: 'name',
        iconId: 'icon_id',
        inTrash: 'in_trash',
        logo: 'logo',
        bannerUrl: 'banner_url'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);
          values.push(value);
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return this.getFolderById(id);
      }

      setClauses.push(`updated_at = $${valueCount++}`);
      values.push(new Date());
      values.push(id); // For the WHERE clause

      const queryText = `
        UPDATE folders
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, user_id as "userId", name, icon_id as "iconId", in_trash as "inTrash",
                  logo, banner_url as "bannerUrl", created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, values);

      if (rows.length === 0) {
        await client.query('ROLLBACK');
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

      await client.query('COMMIT');
      return { ...updatedFolder, notes: noteRows };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update folder with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a folder by ID
   */
  public async deleteFolder(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM folders WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete folder with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if a folder name already exists for a user
   */
  public async folderNameExists(userId: string, name: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT COUNT(*) as count
        FROM folders
        WHERE user_id = $1 AND name = $2`,
        [userId, name]
      );

      return parseInt(rows[0].count, 10) > 0;
    } catch (error) {
      logger.error(`Failed to check if folder name exists for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get notes in a folder
   */
  public async getNotesByFolderId(folderId: string): Promise<Note[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", folder_id as "folderId", title, content,
                tags, is_public as "isPublic", status, icon_id as "iconId", banner_url as "bannerUrl",
                repetition, interval, ease_factor as "easeFactor", next_review as "nextReview",
                last_review as "lastReview", history, content_plain_text as "plainTextContent",
                metadata, created_at as "createdAt", updated_at as "updatedAt"
        FROM notes
        WHERE folder_id = $1
        ORDER BY updated_at DESC`,
        [folderId]
      );

      return rows;
    } catch (error) {
      logger.error(`Failed to get notes for folder ${folderId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Move notes to a different folder
   */
  public async moveNotesToFolder(noteIds: string[], folderId: string | null): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const now = new Date();
      const result = await client.query(
        `UPDATE notes
        SET folder_id = $1, updated_at = $2
        WHERE id = ANY($3)`,
        [folderId, now, noteIds]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to move notes to folder ${folderId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new session
   */
  public async createSession(sessionData: CreateSessionInput): Promise<Session> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

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

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create session', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a session by session ID
   */
  public async getSessionById(sessionId: string): Promise<Session | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT session_id as "sessionId", user_id as "userId", expires_at as "expiresAt",
                data, created_at as "createdAt", updated_at as "updatedAt"
          FROM sessions
          WHERE session_id = $1 AND expires_at > NOW()`,
        [sessionId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get session with ID ${sessionId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a session
   */
  public async updateSession(sessionId: string, updates: UpdateSessionInput): Promise<Session | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        expiresAt: 'expires_at',
        data: 'data'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);
          if (key === 'data') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return this.getSessionById(sessionId);
      }

      setClauses.push(`updated_at = $${valueCount++}`);
      values.push(new Date());
      values.push(sessionId); // For the WHERE clause

      const queryText = `
        UPDATE sessions
        SET ${setClauses.join(', ')}
        WHERE session_id = $${valueCount}
        RETURNING session_id as "sessionId", user_id as "userId", expires_at as "expiresAt",
                  data, created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, values);

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to update session with ID ${sessionId}`, error);
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Delete a session by session ID
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM sessions WHERE session_id = $1`,
        [sessionId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete session with ID ${sessionId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete all sessions for a user
   */
  public async deleteUserSessions(userId: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM sessions WHERE user_id = $1`,
        [userId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete sessions for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM sessions WHERE expires_at <= NOW()`
      );

      await client.query('COMMIT');
      const deletedCount = result.rowCount || 0;

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired sessions`);
      }

      return deletedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to cleanup expired sessions', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Extend session expiration
   */
  public async extendSession(sessionId: string, newExpiresAt: Date): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE sessions
          SET expires_at = $1, updated_at = $2
          WHERE session_id = $3 AND expires_at > NOW()`,
        [newExpiresAt, new Date(), sessionId]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to extend session with ID ${sessionId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async createUserOAuthAccount(userId: string, provider: string, providerAccountId: string) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const existingQuery = `
        SELECT user_id as "userId", provider, provider_account_id as "providerAccountId", 
              created_at as "createdAt", updated_at as "updatedAt"
        FROM user_oauth_accounts
        WHERE user_id = $1 AND provider = $2 AND provider_account_id = $3
      `;

      const { rows: existingAccounts } = await client.query(existingQuery, [userId, provider, providerAccountId]);

      if (existingAccounts.length > 0) {
        await client.query('COMMIT');
        return;
      }

      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO user_oauth_accounts (user_id, provider, provider_account_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id as "userId", provider, provider_account_id as "providerAccountId", created_at as "createdAt", updated_at as "updatedAt"`,
        [userId, provider, providerAccountId, now, now]
      );

      await client.query('COMMIT');
      return;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create user OAuth account', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create verification token for user
   */
  public async createVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE users 
        SET verification_token = $1, token_expires_at = $2
        WHERE id = $3`,
        [token, expiresAt, userId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to create verification token for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify a user with token
   */
  public async verifyUser(token: string): Promise<string | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE users 
        SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL
        WHERE verification_token = $1 AND token_expires_at > NOW()
        RETURNING id`,
        [token]
      );

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to verify user with token`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async createSubscription(subscription: Subscription): Promise<Subscription> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO subscriptions (
          id, user_id, status, metadata, price, quantity, cancel_at_period_end,
          created, current_period_start, current_period_end, ended_at,
          cancel_at, canceled_at, trial_start, trial_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, user_id as "userId", status, metadata, price, quantity,
                  cancel_at_period_end as "cancelAtPeriodEnd", created,
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  ended_at as "endedAt", cancel_at as "cancelAt",
                  canceled_at as "canceledAt", trial_start as "trialStart",
                  trial_end as "trialEnd"`,
        [
          subscription.id,
          subscription.userId,
          subscription.status,
          JSON.stringify(subscription.metadata || {}),
          subscription.price,
          subscription.quantity,
          subscription.cancelAtPeriodEnd,
          subscription.created || new Date().toISOString(),
          subscription.currentPeriodStart || new Date().toISOString(),
          subscription.currentPeriodEnd || new Date().toISOString(),
          subscription.endedAt,
          subscription.cancelAt,
          subscription.canceledAt,
          subscription.trialStart,
          subscription.trialEnd
        ]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create subscription', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get subscription by ID
   */
  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", status, metadata, price, quantity,
                cancel_at_period_end as "cancelAtPeriodEnd", created,
                current_period_start as "currentPeriodStart",
                current_period_end as "currentPeriodEnd",
                ended_at as "endedAt", cancel_at as "cancelAt",
                canceled_at as "canceledAt", trial_start as "trialStart",
                trial_end as "trialEnd"
        FROM subscriptions
        WHERE id = $1`,
        [id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get subscription with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get subscriptions for a user
   */
  public async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, user_id as "userId", status, metadata, price, quantity,
                cancel_at_period_end as "cancelAtPeriodEnd", created,
                current_period_start as "currentPeriodStart",
                current_period_end as "currentPeriodEnd",
                ended_at as "endedAt", cancel_at as "cancelAt",
                canceled_at as "canceledAt", trial_start as "trialStart",
                trial_end as "trialEnd"
        FROM subscriptions
        WHERE user_id = $1
        ORDER BY created DESC`,
        [userId]
      );

      return rows;
    } catch (error) {
      logger.error(`Failed to get subscriptions for user ${userId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a subscription
   */
  public async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const fieldMap: Record<string, string> = {
        status: 'status',
        metadata: 'metadata',
        price: 'price',
        quantity: 'quantity',
        cancelAtPeriodEnd: 'cancel_at_period_end',
        currentPeriodStart: 'current_period_start',
        currentPeriodEnd: 'current_period_end',
        endedAt: 'ended_at',
        cancelAt: 'cancel_at',
        canceledAt: 'canceled_at',
        trialStart: 'trial_start',
        trialEnd: 'trial_end'
      };

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && fieldMap[key]) {
          setClauses.push(`${fieldMap[key]} = $${valueCount++}`);

          if (key === 'metadata') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }
      if (setClauses.length === 0) {
        await client.query('ROLLBACK');
        return await this.getSubscriptionById(id);
      }

      values.push(id); // For the WHERE clause

      const queryText = `
        UPDATE subscriptions
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, user_id as "userId", status, metadata, price, quantity,
                  cancel_at_period_end as "cancelAtPeriodEnd", created,
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  ended_at as "endedAt", cancel_at as "cancelAt",
                  canceled_at as "canceledAt", trial_start as "trialStart",
                  trial_end as "trialEnd"`;

      const { rows } = await client.query(queryText, values);

      await client.query('COMMIT');
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to update subscription with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a subscription
   */
  public async deleteSubscription(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM subscriptions WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete subscription with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a new customer
   */
  public async createCustomer(customer: Customer): Promise<Customer> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO customers (id, stripe_customer_id)
        VALUES ($1, $2)
        RETURNING id, stripe_customer_id as "stripeCustomerId"`,
        [customer.id, customer.stripeCustomerId]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create customer', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get customer by ID
   */
  public async getCustomerById(id: string): Promise<Customer | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, stripe_customer_id as "stripeCustomerId"
        FROM customers
        WHERE id = $1`,
        [id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get customer with ID ${id}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get customer by Stripe customer ID
   */
  public async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    const client = await this.getClient();
    try {
      const { rows } = await client.query(
        `SELECT id, stripe_customer_id as "stripeCustomerId"
        FROM customers
        WHERE stripe_customer_id = $1`,
        [stripeCustomerId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Failed to get customer with Stripe ID ${stripeCustomerId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a customer
   */
  public async deleteCustomer(id: string): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM customers WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to delete customer with ID ${id}`, error);
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