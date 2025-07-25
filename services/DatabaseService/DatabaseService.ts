import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';
import config from '@/config/database';

// Import repositories
import { UserRepository } from './UserRepository';
import { NoteRepository } from './NoteRepository';
import { QuestionRepository } from './QuestionRepository';
import { FolderRepository } from './FolderRepository';
import { AiReviewSessionRepository } from './AiReviewSessionRepository';
import { SessionRepository } from './SessionRepository';
import { SubscriptionRepository } from './SubscriptionRepository';

// Import types
import type { Question } from '@/types/Question';
import type { Note } from '@/types/Note';
import type { User, UserData } from '@/types/User';
import type { AiReviewSession } from '@/types/AiReviewSession';
import type { Folder } from '@/types/Folder';
import { Session } from '@/types/Sessions';
import { Customer, Subscription } from '@/types/Subscription';
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateNoteInput,
  UpdateAiReviewSessionInput,
  UpdateSessionInput,
  CreateSessionInput
} from './types';

/**
 * Database Service - Singleton pattern implementation with Repository Pattern
 * Handles all database interactions through specialized repositories
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  private static lastConnectionString: string | null = null;
  private isInitializingTables = false;
  private tablesInitialized = false;

  // Repository instances
  private userRepository: UserRepository | null = null;
  private noteRepository: NoteRepository | null = null;
  private questionRepository: QuestionRepository | null = null;
  private folderRepository: FolderRepository | null = null;
  private aiReviewSessionRepository: AiReviewSessionRepository | null = null;
  private sessionRepository: SessionRepository | null = null;
  private subscriptionRepository: SubscriptionRepository | null = null;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      this.instance.initialize(config.database.url || process.env.POSTGRES_URL || '');
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection pool and repositories
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
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
      });

      // Initialize repositories with the pool
      this.initializeRepositories();

      logger.info('Database service initialized');
    } catch (error) {
      logger.error('Failed to initialize database connection', error);
      this.pool = null;
      throw error;
    }
  }

  /**
   * Initialize all repositories with the shared pool
   */
  private initializeRepositories(): void {
    if (!this.pool) {
      throw new Error('Pool must be initialized before repositories');
    }

    this.userRepository = new UserRepository(this.pool);
    this.noteRepository = new NoteRepository(this.pool);
    this.questionRepository = new QuestionRepository(this.pool);
    this.folderRepository = new FolderRepository(this.pool);
    this.aiReviewSessionRepository = new AiReviewSessionRepository(this.pool);
    this.sessionRepository = new SessionRepository(this.pool);
    this.subscriptionRepository = new SubscriptionRepository(this.pool);
  }

  /**
   * Get a client from the pool (for table initialization and other direct DB operations)
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

    return await this.pool!.connect();
  }

  /**
   * Ensure repositories are initialized
   */
  private ensureRepositoriesInitialized(): void {
    if (!this.userRepository || !this.noteRepository || !this.questionRepository || 
        !this.folderRepository || !this.aiReviewSessionRepository || 
        !this.sessionRepository || !this.subscriptionRepository) {
      if (!this.pool) {
        throw new Error('Database pool is not initialized');
      }
      this.initializeRepositories();
    }
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
          preferences JSONB,
          user_tags TEXT[],
          is_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          token_expires_at TIMESTAMP WITH TIME ZONE,
          billing_address JSONB,
          payment_method JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS user_oauth_accounts (
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider VARCHAR(50) NOT NULL,
          provider_account_id VARCHAR(255) NOT NULL,
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
          content_plain_text TEXT,
          tags TEXT[],
          is_public BOOLEAN DEFAULT FALSE,
          icon_id VARCHAR(50),
          banner_url TEXT,
          status VARCHAR(50) DEFAULT 'active',
          metadata JSONB,
          repetition INTEGER DEFAULT 0,
          interval INTEGER DEFAULT 0,
          ease_factor FLOAT DEFAULT 2.5,
          next_review TIMESTAMP WITH TIME ZONE,
          last_review TIMESTAMP WITH TIME ZONE,
          history JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_next_review ON notes(next_review);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN (tags);`);
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
          repetition INTEGER DEFAULT 0,
          interval INTEGER DEFAULT 0,
          ease_factor FLOAT DEFAULT 2.5,
          next_review TIMESTAMP WITH TIME ZONE,
          last_review TIMESTAMP WITH TIME ZONE,
          history JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS ai_review_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          mode VARCHAR(50),
          difficulty VARCHAR(50),
          summary TEXT,
          key_takeaways TEXT[],
          generated_questions JSONB,
          result JSONB,
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

  // ===== USER METHODS (delegated to UserRepository) =====
  public async createUser(userData: CreateUserInput): Promise<User> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.createUser(userData);
  }

  public async getUserById(id: string): Promise<User | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.getUserById(id);
  }

  public async getUserByEmail(email: string): Promise<(UserData & { hashedPassword: string, salt: string }) | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.getUserByEmail(email);
  }

  public async updateUser(id: string, updates: UpdateUserInput): Promise<User | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.updateUser(id, updates);
  }

  public async updateUserAuthCredentials(userId: string, newHashedPassword: string, newSalt: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.updateUserAuthCredentials(userId, newHashedPassword, newSalt);
  }

  public async updateUserPaymentData(userId: string, newPaymentMethod: Record<string, any>, newBillingAddress: Record<string, any>): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.updateUserPaymentData(userId, newPaymentMethod, newBillingAddress);
  }

  public async getUserPaymentDataById(id: string): Promise<(UserData & { billingAddress: Record<string, any>, paymentMethod: Record<string, any> }) | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.getUserPaymentDataById(id);
  }

  public async deleteUser(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.deleteUser(id);
  }

  public async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.getUserActiveSubscription(userId);
  }

  public async createUserOAuthAccount(userId: string, provider: string, providerAccountId: string): Promise<void> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.createUserOAuthAccount(userId, provider, providerAccountId);
  }

  public async createVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.createVerificationToken(userId, token, expiresAt);
  }

  public async verifyUser(token: string): Promise<string | null> {
    this.ensureRepositoriesInitialized();
    return this.userRepository!.verifyUser(token);
  }

  // ===== NOTE METHODS (delegated to NoteRepository) =====
  public async createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.createNote(note);
  }

  public async updateNote(id: string, updates: UpdateNoteInput): Promise<Note | null> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.updateNote(id, updates);
  }

  public async getNoteById(id: string): Promise<Note | null> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.getNoteById(id);
  }

  public async searchNote(searchString: string): Promise<{ id: string, title: string }[]> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.searchNote(searchString);
  }

  public async getNotesByUserId(userId: string): Promise<Note[]> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.getNotesByUserId(userId);
  }

  public async getNotesByFolderId(folderId: string): Promise<Note[]> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.getNotesByFolderId(folderId);
  }

  public async moveNotesToFolder(noteIds: string[], folderId: string | null): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.moveNotesToFolder(noteIds, folderId);
  }

  public async deleteNote(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.noteRepository!.deleteNote(id);
  }

  // ===== QUESTION METHODS (delegated to QuestionRepository) =====
  public async createQuestion(question: Question): Promise<Question> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.createQuestion(question);
  }

  public async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.updateQuestion(id, updates);
  }

  public async getQuestionsByNoteId(noteId: string): Promise<(Question & { noteTitle: string })[]> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.getQuestionsByNoteId(noteId);
  }

  public async getQuestionsByUserId(userId: string): Promise<Question[]> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.getQuestionsByUserId(userId);
  }

  public async getQuestionsByFolderId(folderId: string): Promise<(Question & { folderName: string, noteTitle: string })[]> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.getQuestionsByFolderId(folderId);
  }

  public async deleteQuestion(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.questionRepository!.deleteQuestion(id);
  }

  // ===== FOLDER METHODS (delegated to FolderRepository) =====
  public async createFolder(folder: Folder): Promise<Folder> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.createFolder(folder);
  }

  public async getFolderById(id: string): Promise<Folder | null> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.getFolderById(id);
  }

  public async getFoldersByUserId(userId: string): Promise<Folder[]> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.getFoldersByUserId(userId);
  }

  public async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.updateFolder(id, updates);
  }

  public async deleteFolder(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.deleteFolder(id);
  }

  public async folderNameExists(userId: string, name: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.folderRepository!.folderNameExists(userId, name);
  }

  // ===== AI REVIEW SESSION METHODS (delegated to AiReviewSessionRepository) =====
  public async createAiReviewSession(session: Omit<AiReviewSession, 'id'>): Promise<AiReviewSession> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.createAiReviewSession(session);
  }

  public async getAiReviewSessionById(id: string): Promise<AiReviewSession | null> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.getAiReviewSessionById(id);
  }

  public async getAiReviewSessionsByUserId(userId: string): Promise<AiReviewSession[]> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.getAiReviewSessionsByUserId(userId);
  }

  public async getAiReviewSessionsByNoteId(noteId: string): Promise<AiReviewSession[]> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.getAiReviewSessionsByNoteId(noteId);
  }

  public async updateAiReviewSession(id: string, updates: UpdateAiReviewSessionInput): Promise<AiReviewSession | null> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.updateAiReviewSession(id, updates);
  }

  public async updateAiReviewSessionStatus(id: string, status: AiReviewSession['status'], timestamps?: Pick<AiReviewSession, 'questionsGeneratedAt' | 'sessionStartedAt' | 'completedAt'>): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.updateAiReviewSessionStatus(id, status, timestamps);
  }

  public async deleteAiReviewSession(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.aiReviewSessionRepository!.deleteAiReviewSession(id);
  }

  // ===== SESSION METHODS (delegated to SessionRepository) =====
  public async createSession(sessionData: CreateSessionInput): Promise<Session> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.createSession(sessionData);
  }

  public async getSessionById(sessionId: string): Promise<Session | null> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.getSessionById(sessionId);
  }

  public async updateSession(sessionId: string, updates: UpdateSessionInput): Promise<Session | null> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.updateSession(sessionId, updates);
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.deleteSession(sessionId);
  }

  public async deleteUserSessions(userId: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.deleteUserSessions(userId);
  }

  public async cleanupExpiredSessions(): Promise<number> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.cleanupExpiredSessions();
  }

  public async extendSession(sessionId: string, newExpiresAt: Date): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.sessionRepository!.extendSession(sessionId, newExpiresAt);
  }

  // ===== SUBSCRIPTION METHODS (delegated to SubscriptionRepository) =====
  public async createSubscription(subscription: Subscription): Promise<Subscription> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.createSubscription(subscription);
  }

  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.getSubscriptionById(id);
  }

  public async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.getSubscriptionsByUserId(userId);
  }

  public async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.updateSubscription(id, updates);
  }

  public async deleteSubscription(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.deleteSubscription(id);
  }

  public async createCustomer(customer: Customer): Promise<Customer> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.createCustomer(customer);
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.getCustomerById(id);
  }

  public async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.getCustomerByStripeId(stripeCustomerId);
  }

  public async deleteCustomer(id: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    return this.subscriptionRepository!.deleteCustomer(id);
  }

  /**
   * Clean up resources when shutting down
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.userRepository = null;
      this.noteRepository = null;
      this.questionRepository = null;
      this.folderRepository = null;
      this.aiReviewSessionRepository = null;
      this.sessionRepository = null;
      this.subscriptionRepository = null;
      logger.info('Database connection closed');
    }
  }
}

// Export a singleton instance
export default DatabaseService.getInstance();