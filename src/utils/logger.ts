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
    if (data) {
      console.log(`[${this.context}] ${message}`, data);
    } else {
      console.log(`[${this.context}] ${message}`);
    }
  }

  warn(message: string, data?: LogData): void {
    if (data) {
      console.warn(`[${this.context}] ${message}`, data);
    } else {
      console.warn(`[${this.context}] ${message}`);
    }
  }

  error(message: string, data?: LogData): void {
    if (data) {
      console.error(`[${this.context}] ${message}`, data);
    } else {
      console.error(`[${this.context}] ${message}`);
    }
  }

  debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.debug(`[${this.context}] ${message}`, data);
      } else {
        console.debug(`[${this.context}] ${message}`);
      }
    }
  }
}

export function createLogger(context: string): Logger {
  return new ThumbnailLogger(context);
}
