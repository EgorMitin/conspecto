/**
 * Database configuration
 */
interface DatabaseConfig {
  url: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  database: DatabaseConfig;
  isDevelopment: boolean;
}

/**
 * Environment configuration
 */
const config: AppConfig = {
  database: {
    url: process.env.POSTGRES_URL || '',
  },
  isDevelopment: process.env.NODE_ENV !== 'production',
};

/**
 * Get config validation errors, if any
 */
export const getConfigErrors = (): string[] => {
  const errors: string[] = [];
  
  if (!config.database.url) {
    errors.push('POSTGRES_URL environment variable is required');
  }
  
  return errors;
};

export default config;