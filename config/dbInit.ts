import databaseService from '../services/DatabaseService';
import config, { getConfigErrors } from './database';
import { logger } from '../utils/logger';

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  // Validate configuration
  const configErrors = getConfigErrors();
  if (configErrors.length > 0) {
    configErrors.forEach(error => logger.error(error));
    throw new Error('Invalid database configuration');
  }
  
  try {
    // Initialize database connection pool
    databaseService.initialize(config.database.url);
    
    // Ensure tables exist
    await databaseService.ensureTablesExist();
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}

export default initializeDatabase;