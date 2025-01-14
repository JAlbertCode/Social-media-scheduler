import { prisma } from '@/lib/prisma';
import winston from 'winston';
import { Sentry } from '@sentry/node';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogCategory = 'system' | 'user' | 'api' | 'task' | 'security';

interface LogEntry {
  level: LogLevel;
  message: string;
  category: LogCategory;
  metadata?: Record<string, any>;
  userId?: string;
  error?: Error;
}

export class Logger {
  private logger: winston.Logger;
  private static instance: Logger;

  private constructor() {
    // Initialize Winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Console logging for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File logging for production
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });

    // Initialize Sentry for error tracking
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
      });
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log an error with full context
   */
  async error(entry: Omit<LogEntry, 'level'>): Promise<void> {
    const { message, category, metadata, userId, error } = entry;

    // Log to Winston
    this.logger.error(message, {
      category,
      metadata,
      userId,
      error: error?.stack
    });

    // Log to Sentry if available
    if (process.env.SENTRY_DSN && error) {
      Sentry.withScope(scope => {
        scope.setExtra('category', category);
        scope.setExtra('metadata', metadata);
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(error);
      });
    }

    // Store in database
    await this.storeLog({
      level: 'error',
      message,
      category,
      metadata,
      userId,
      error
    });
  }

  /**
   * Log a warning
   */
  async warn(entry: Omit<LogEntry, 'level'>): Promise<void> {
    const { message, category, metadata, userId } = entry;

    this.logger.warn(message, {
      category,
      metadata,
      userId
    });

    await this.storeLog({
      level: 'warn',
      message,
      category,
      metadata,
      userId
    });
  }

  /**
   * Log an info message
   */
  async info(entry: Omit<LogEntry, 'level'>): Promise<void> {
    const { message, category, metadata, userId } = entry;

    this.logger.info(message, {
      category,
      metadata,
      userId
    });

    await this.storeLog({
      level: 'info',
      message,
      category,
      metadata,
      userId
    });
  }

  /**
   * Log a debug message
   */
  debug(entry: Omit<LogEntry, 'level'>): void {
    const { message, category, metadata, userId } = entry;

    this.logger.debug(message, {
      category,
      metadata,
      userId
    });
  }

  /**
   * Store log entry in database
   */
  private async storeLog(entry: LogEntry): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          level: entry.level,
          message: entry.message,
          category: entry.category,
          metadata: entry.metadata,
          userId: entry.userId,
          errorStack: entry.error?.stack,
          timestamp: new Date()
        }
      });
    } catch (error) {
      // If we can't store the log, at least log to console
      console.error('Failed to store log entry:', error);
    }
  }

  /**
   * Query logs with filters
   */
  async queryLogs(filters: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    const { level, category, userId, startDate, endDate, limit = 100 } = filters;

    return prisma.systemLog.findMany({
      where: {
        ...(level && { level }),
        ...(category && { category }),
        ...(userId && { userId }),
        ...(startDate || endDate) && {
          timestamp: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await prisma.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
  }
}