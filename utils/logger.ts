/**
 * A versatile logging utility that supports multiple output destinations and log levels.
 * 
 * Features:
 * - Multiple logging destinations (console, file, HTTP endpoint)
 * - Four log levels (debug, info, warn, error)
 * - Customizable timestamp format
 * - Environment variable support for log levels
 * - Automatic log directory creation
 * - Async logging operations
 * 
 * @example
 * ```typescript
 * const logger = new Logger({
 *   logLevel: 'debug',
 *   logTo: ['console', 'file'],
 *   filePath: './logs/app.log'
 * });
 * 
 * await logger.info('Application started');
 * await logger.error('An error occurred', errorObject);
 * ```
 * 
 * @class Logger
 * @property {LoggerOptions} defaultOptions - Default configuration for the logger
 * @property {boolean} defaultOptions.timestamp - Whether to include timestamps in logs (default: true)
 * @property {LogLevel} defaultOptions.logLevel - Minimum log level to output (default: 'info')
 * @property {LogDestination | LogDestination[]} defaultOptions.logTo - Where to send logs (default: 'console')
 * @property {string} defaultOptions.filePath - Path for file logging (default: './logs/app.log')
 * @property {string} defaultOptions.httpEndpoint - URL for HTTP logging endpoint
 */

import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogDestination = 'console' | 'file' | 'http';

interface LoggerOptions {
  timestamp?: boolean;
  logLevel?: LogLevel;
  logTo?: LogDestination | LogDestination[];
  filePath?: string;
  httpEndpoint?: string;
}

class Logger {
  private defaultOptions: LoggerOptions = {
    timestamp: true,
    logLevel: 'info',
    logTo: 'console',
    filePath: path.join(process.cwd(), 'logs', 'app.log')
  };

  constructor(options?: LoggerOptions) {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options
    }

    this.checkLogDirectory();
  }

  private checkLogDirectory() {
    if (this.defaultOptions.filePath) {
      const dir = path.dirname(this.defaultOptions.filePath);
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch (error) {
          throw new Error(`Failed to create log directory: ${dir}`);
        }
      }
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, options: LoggerOptions): string {
    const parts = [];
    
    if (options.timestamp) {
      parts.push(`[${this.getTimestamp()}]`);
    }
    
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  private async logToFile(message: string): Promise<void> {
    const filePath = this.defaultOptions.filePath!;
    await fs.promises.appendFile(filePath, message + '\n');
  }

  private async logToHttp(message: string, level: LogLevel): Promise<void> {
    const endpoint = this.defaultOptions.httpEndpoint;
    if (!endpoint) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          level,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to send log to HTTP endpoint:', error);
    }
  }

  private async log(level: LogLevel, message: string, options: LoggerOptions, ...args: unknown[]): Promise<void> {
    const formattedMessage = this.formatMessage(level, message, options);
    const destinations = Array.isArray(options.logTo) ? options.logTo : [options.logTo || 'console'];

    for (const destination of destinations) {
      switch (destination) {
        case 'console':
          switch (level) {
            case 'debug':
              console.debug(formattedMessage, ...args);
              break;
            case 'info':
              console.info(formattedMessage, ...args);
              break;
            case 'warn':
              console.warn(formattedMessage, ...args);
              break;
            case 'error':
              console.error(formattedMessage, ...args);
              break;
          }
          break;
        case 'file':
          await this.logToFile(formattedMessage);
          break;
        case 'http':
          await this.logToHttp(formattedMessage, level);
          break;
      }
    }
  }

  private shouldLog(messageLevel: LogLevel, configLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(messageLevel) >= levels.indexOf(configLevel);
  }

  public async debug(message: string, ...args: unknown[]): Promise<void> {
    const options = {
      ...this.defaultOptions,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || this.defaultOptions.logLevel
    };
    
    if (this.shouldLog('debug', options.logLevel!)) {
      await this.log('debug', message, options, ...args);
    }
  }

  public async info(message: string, ...args: unknown[]): Promise<void> {
    const options = {
      ...this.defaultOptions,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || this.defaultOptions.logLevel
    };
    
    if (this.shouldLog('info', options.logLevel!)) {
      await this.log('info', message, options, ...args);
    }
  }

  public async warn(message: string, ...args: unknown[]): Promise<void> {
    const options = {
      ...this.defaultOptions,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || this.defaultOptions.logLevel
    };
    
    if (this.shouldLog('warn', options.logLevel!)) {
      await this.log('warn', message, options, ...args);
    }
  }

  public async error(message: string, ...args: unknown[]): Promise<void> {
    const options = {
      ...this.defaultOptions,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || this.defaultOptions.logLevel
    };
    
    await this.log('error', message, options, ...args);
  }
}

export const logger = new Logger({
  logLevel: 'debug',
  logTo: ['console'],
  filePath: './logs/dev.txt'
});