import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CacheLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;
    const cacheKey = this.generateCacheKey(className, methodName, context.getArgs());
    
    const startTime = Date.now();
    let cacheHit = false;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          
          // Determine if this was a cache hit based on response time
          // Cache hits are typically much faster (< 10ms)
          cacheHit = duration < 10;
          
          this.logger.logCacheOperation(
            cacheHit ? 'hit' : 'miss',
            cacheKey
          );
          
          if (!cacheHit) {
            this.logger.debug(`Cache miss for ${cacheKey}, fetched from source in ${duration}ms`, 'Cache');
          }
        },
        error: (error) => {
          this.logger.error(
            `Cache operation failed for ${cacheKey}`,
            error.stack,
            'Cache',
            {
              cacheKey,
              className,
              methodName,
              errorMessage: error.message,
            }
          );
        },
      })
    );
  }

  private generateCacheKey(className: string, methodName: string, args: any[]): string {
    // Generate a cache key based on class, method, and arguments
    const argsStr = args.length > 0 ? JSON.stringify(args).slice(0, 100) : '';
    return `${className}.${methodName}:${argsStr}`;
  }
}
