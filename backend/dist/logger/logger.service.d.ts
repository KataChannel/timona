import { LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'winston-daily-rotate-file';
export declare class LoggerService implements NestLoggerService {
    private configService;
    private logger;
    constructor(configService: ConfigService);
    log(message: string, context?: string, meta?: any): void;
    error(message: string, trace?: string, context?: string, meta?: any): void;
    warn(message: string, context?: string, meta?: any): void;
    debug(message: string, context?: string, meta?: any): void;
    verbose(message: string, context?: string, meta?: any): void;
    logGraphQLOperation(operationName: string, query: string, variables?: any, duration?: number, userId?: string): void;
    logPrismaQuery(model: string, operation: string, duration?: number, args?: any): void;
    logAuth(action: string, userId?: string, email?: string, success?: boolean, reason?: string): void;
    logFileOperation(action: string, filename: string, size?: number, mimetype?: string, success?: boolean, error?: string): void;
    logCacheOperation(action: 'hit' | 'miss' | 'set' | 'del', key: string, ttl?: number): void;
    logSubscription(event: string, subscriberCount?: number, payload?: any): void;
    logPerformance(operation: string, duration: number, meta?: any): void;
    logSecurity(event: string, severity: 'low' | 'medium' | 'high', details?: any): void;
}
