import databaseService from '../services/DatabaseService/DatabaseService';
import config, { getConfigErrors } from './database';
import { logger } from '../utils/logger';

let isInitializing = false;
let isInitialized = false;

/**
 * Initialize database connection
 */
export default async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (isInitializing) {
    let attempts = 0;
    while (isInitializing && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    if (isInitialized) {
      return;
    }
    throw new Error('Database initialization timeout');
  }

  isInitializing = true;

  try {
    // Validate configuration
    const configErrors = getConfigErrors();
    if (configErrors.length > 0) {
      configErrors.forEach(error => logger.error(error));
      throw new Error('Invalid database configuration');
    }

    // Initialize database connection pool
    databaseService.initialize(config.database.url);
    
    // Ensure tables exist
    await databaseService.ensureTablesExist();
    
    isInitialized = true;
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}