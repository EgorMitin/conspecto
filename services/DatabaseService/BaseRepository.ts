import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '@/utils/logger';
import config from '@/config/database';

export abstract class BaseRepository {
  protected pool: Pool;

  constructor(pool: Pool) {
    if (!pool) {
      // This case should ideally be handled by the main DatabaseService
      // ensuring a pool is always provided.
      // For robustness, we could throw or try to initialize a default pool,
      // but the design expects an injected pool.
      logger.error('BaseRepository instantiated without a Pool.');
      throw new Error('Pool instance is required for BaseRepository.');
    }
    this.pool = pool;
  }

  public initialize(connectionString: string): void {
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

    } catch (error) {
      logger.error('Failed to initialize database connection', error);
      throw error;
    }
  }

  /**
   * Gets a client from the pool.
   * The caller is responsible for releasing the client if not using executeInTransaction or executeQuery.
   */
  protected async getClient(): Promise<PoolClient> {
    if (!this.pool) {

      const connectionStringToUse = config.database.url;

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
   * Executes a series of database operations within a single transaction.
   * Handles client acquisition, BEGIN, COMMIT, ROLLBACK, and client release.
   * @param operation A callback function that receives a PoolClient and performs DB operations.
   * @returns The result of the operation.
   */
  protected async executeInTransaction<T>(
    operation: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed and rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Executes a single query.
   * Handles client acquisition and release.
   * Suitable for non-transactional read operations or simple writes where a transaction is not critical.
   * @param queryText The SQL query string.
   * @param values Optional array of query parameters.
   * @returns The QueryResult from pg.
   */
  protected async executeQuery<R extends Record<string, any> = any, I extends any[] = any[]>(
    queryText: string,
    values?: I
  ): Promise<QueryResult<R>> {
    const client = await this.getClient();
    try {
      return await client.query<R>(queryText, values);
    } catch (error) {
      const queryPreview = queryText.length > 100 ? queryText.substring(0, 100) + '...' : queryText;
      let logMessage = `Query failed: ${queryPreview}`;

      if (error instanceof Error) {
        logMessage += `. Message: ${error.message}`;
        logger.error(logMessage, error);
      } else {
        logMessage += `. Encountered: ${String(error)}`;
        logger.error(logMessage, { capturedErrorValue: error });
      }
      throw error;
    } finally {
      client.release();
    }
  }

  protected camelToSnakeCase(str: string): string {
    // Handles simple camelCase like 'userId' -> 'user_id'
    // and preserves already snake_cased or single words like 'name' -> 'name'
    // For example, 'profilePhotoUrl' becomes 'profile_photo_url'.
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }

  protected prepareDbValue(value: any): any {
    if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      return JSON.stringify(value);
    }
    return value;
  }

  /**
   * Helper to build SET clauses for UPDATE statements dynamically.
   * It iterates over the keys of the 'updates' object, converts camelCase keys
   * to snake_case for column names, and prepares them for an SQL SET clause.
   *
   * IMPORTANT: The 'updates' object should ONLY contain keys that are valid
   * and intended for update. The TypeScript types of the 'updates' object at the
   * call site (e.g., using specific UpdateInput types like UpdateNoteInput)
   * are crucial for ensuring only appropriate fields are processed.
   *
   * @param updates An object containing field-value pairs for update (keys in camelCase).
   * @param startingParamIndex The starting index for query parameters (e.g., $1).
   * @returns An object containing the SET clause string, the array of values, and the next parameter index.
   */
  protected buildUpdateSetClause(
    updates: Record<string, any>, // Ideally, this would be further constrained by generics if possible in subclasses
    startingParamIndex: number = 1
  ): { setClause: string; values: any[]; nextParamIndex: number } {
    const setClauses: string[] = [];
    const values: any[] = [];
    let currentParamIndex = startingParamIndex;

    for (const camelCaseKey in updates) {
      if (updates.hasOwnProperty(camelCaseKey) && updates[camelCaseKey] !== undefined) {
        const columnName = this.camelToSnakeCase(camelCaseKey);
        setClauses.push(`${columnName} = $${currentParamIndex++}`);
        values.push(this.prepareDbValue(updates[camelCaseKey]));
      }
    }
    return {
      setClause: setClauses.join(', '),
      values,
      nextParamIndex: currentParamIndex,
    };
  }
}