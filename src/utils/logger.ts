/**
 * Logger Utility
 * 
 * Centralized logging functionality for the thumbnail service.
 */

export interface LogData {
  [key: string]: any;
}

export interface Logger {
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  debug(message: string, data?: LogData): void;
}

export class ThumbnailLogger implements Logger {
  constructor(private context: string) {}

  info(message: string, data?: LogData): void {
    console.log(`[${this.context}] ${message}`, data?.data || '');
  }

  warn(message: string, data?: LogData): void {
    console.warn(`[${this.context}] ${message}`, data?.data || '');
  }

  error(message: string, data?: LogData): void {
    console.error(`[${this.context}] ${message}`, data?.data || '');
  }

  debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.context}] ${message}`, data?.data || '');
    }
  }
}

export function createLogger(context: string): Logger {
  return new ThumbnailLogger(context);
}
