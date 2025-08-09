// Debug Logger Service - Simplified for 2025 rebuild
// Consolidates error handling and debugging functionality

import { Request, Response, NextFunction } from 'express';

export class DebugLogger {
  private static instance: DebugLogger;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    if (!this.isEnabled && level !== 'error') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // API call logging (for compatibility)
  apiCall(req: any, res: any, duration: number, error?: Error) {
    const method = req.method;
    const url = req.path;
    if (error) {
      this.error(`API Call Failed: ${method} ${url}`, { duration, error: error.message });
    } else {
      this.info(`API Call: ${method} ${url}`, { duration, status: res.statusCode });
    }
  }

  // Get recent logs (for compatibility)
  getRecentLogs(limit: number = 50, level?: string) {
    return [];
  }

  // Get error summary (for compatibility)
  getErrorSummary() {
    return { errors: [], count: 0 };
  }

  // Get performance metrics (for compatibility)
  getPerformanceMetrics() {
    return { avgResponseTime: 0, requests: 0 };
  }
}

// Error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = DebugLogger.getInstance();
  
  logger.error(`Error in ${req.method} ${req.path}`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    query: req.query,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An error occurred processing your request',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const debugLogger = DebugLogger.getInstance();