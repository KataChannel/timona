import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const nodeEnv = this.configService.get('NODE_ENV', 'development');

    // Create winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack, context, ...meta }) => {
          const contextStr = context ? `[${context}] ` : '';
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const stackStr = stack ? `\n${stack}` : '';
          
          return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message} ${metaStr}${stackStr}`;
        })
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple()
          ),
        }),
        
        // Daily rotate file for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          createSymlink: true,
          symlinkName: 'application.log',
        }),
        
        // Error logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          createSymlink: true,
          symlinkName: 'error.log',
        }),
        
        // GraphQL operations log
        new winston.transports.DailyRotateFile({
          filename: 'logs/graphql-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          createSymlink: true,
          symlinkName: 'graphql.log',
        }),
      ],
    });

    // Suppress console logs in production
    if (nodeEnv === 'production') {
      this.logger.transports.forEach((transport) => {
        if (transport instanceof winston.transports.Console) {
          transport.silent = true;
        }
      });
    }
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { stack: trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Additional methods for specific logging scenarios
  logGraphQLOperation(operationName: string, query: string, variables?: any, duration?: number, userId?: string) {
    this.logger.info('GraphQL Operation', {
      context: 'GraphQL',
      operationName,
      query: query.replace(/\s+/g, ' ').trim(),
      variables,
      duration: duration ? `${duration}ms` : undefined,
      userId,
    });
  }

  logPrismaQuery(model: string, operation: string, duration?: number, args?: any) {
    this.logger.debug('Prisma Query', {
      context: 'Prisma',
      model,
      operation,
      duration: duration ? `${duration}ms` : undefined,
      args,
    });
  }

  logAuth(action: string, userId?: string, email?: string, success: boolean = true, reason?: string) {
    const level = success ? 'info' : 'warn';
    this.logger.log(level, `Auth ${action}`, {
      context: 'Auth',
      action,
      userId,
      email,
      success,
      reason,
    });
  }

  logFileOperation(action: string, filename: string, size?: number, mimetype?: string, success: boolean = true, error?: string) {
    const level = success ? 'info' : 'error';
    this.logger.log(level, `File ${action}`, {
      context: 'File',
      action,
      filename,
      size,
      mimetype,
      success,
      error,
    });
  }

  logCacheOperation(action: 'hit' | 'miss' | 'set' | 'del', key: string, ttl?: number) {
    this.logger.debug(`Cache ${action}`, {
      context: 'Cache',
      action,
      key,
      ttl,
    });
  }

  logSubscription(event: string, subscriberCount?: number, payload?: any) {
    this.logger.info(`Subscription ${event}`, {
      context: 'Subscription',
      event,
      subscriberCount,
      payload: payload ? JSON.stringify(payload) : undefined,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, meta?: any) {
    const level = duration > 1000 ? 'warn' : 'debug';
    this.logger.log(level, `Performance: ${operation}`, {
      context: 'Performance',
      operation,
      duration: `${duration}ms`,
      ...meta,
    });
  }

  // Security logging
  logSecurity(event: string, severity: 'low' | 'medium' | 'high', details?: any) {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    this.logger.log(level, `Security: ${event}`, {
      context: 'Security',
      event,
      severity,
      ...details,
    });
  }
}
