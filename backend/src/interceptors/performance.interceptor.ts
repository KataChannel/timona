import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { SecurityAuditService } from '../security/services/security-audit.service';

export interface PerformanceMetrics {
  startTime: [number, number];
  startMemory: NodeJS.MemoryUsage;
  requestSize: number;
  responseTime?: number;
  responseSize?: number;
  dbQueryStartTime: number;
  dbQueryCount: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(private readonly auditService: SecurityAuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Handle different execution contexts
    let request: any;
    let response: any;
    let endpoint: string;

    if (context.getType() === 'http') {
      // HTTP/REST context
      request = context.switchToHttp().getRequest<Request>();
      response = context.switchToHttp().getResponse<Response>();
      endpoint = request.path;
    } else if (context.getType<'graphql'>() === 'graphql') {
      // GraphQL context
      const gqlContext = context.getArgs()[2]; // GraphQL context is 3rd argument
      request = gqlContext?.req || {};
      response = gqlContext?.res || {};
      endpoint = request.body?.operationName || 'GraphQL';
    } else {
      // Other contexts (WS, etc.) - skip performance logging
      return next.handle();
    }
    
    // Skip performance logging for health checks and static assets
    if (this.shouldSkipLogging(endpoint)) {
      return next.handle();
    }

    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();
    const requestSize = this.calculateRequestSize(request);

    const metrics: PerformanceMetrics = {
      startTime,
      startMemory,
      requestSize,
      dbQueryStartTime: Date.now(),
      dbQueryCount: 0,
    };

    // Store metrics in request for access by other services
    (request as any).performanceMetrics = metrics;

    return next.handle().pipe(
      tap(data => {
        // Log successful response
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const responseTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
        const endMemory = process.memoryUsage();
        const responseSize = this.calculateResponseSize(data);

        const finalMetrics: PerformanceMetrics = {
          ...metrics,
          responseTime,
          responseSize,
          memoryUsage: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            rss: endMemory.rss - startMemory.rss,
          },
        };

        this.logPerformanceMetrics(request, response, finalMetrics, data, null, endpoint);
      }),
      catchError(error => {
        // Log error response
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const responseTime = seconds * 1000 + nanoseconds / 1000000;
        const endMemory = process.memoryUsage();

        const finalMetrics: PerformanceMetrics = {
          ...metrics,
          responseTime,
          responseSize: 0,
          memoryUsage: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            rss: endMemory.rss - startMemory.rss,
          },
        };

        this.logPerformanceMetrics(request, response, finalMetrics, null, error, endpoint);
        throw error;
      }),
    );
  }

  private shouldSkipLogging(path: string): boolean {
    const skipPaths = [
      '/health',
      '/favicon.ico',
      '/metrics',
      '/.well-known',
      '/static',
      '/assets',
    ];
    
    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }

  private calculateRequestSize(request: any): number {
    let size = 0;
    
    // Calculate headers size
    const headers = request.headers || {};
    Object.keys(headers).forEach(key => {
      size += key.length + (headers[key]?.toString().length || 0);
    });
    
    // Add body size if available
    if (request.body) {
      try {
        size += JSON.stringify(request.body).length;
      } catch (error) {
        // If body can't be stringified, estimate size
        size += 100;
      }
    }
    
    // Add query parameters size
    if (request.query) {
      try {
        size += JSON.stringify(request.query).length;
      } catch (error) {
        size += 50;
      }
    }
    
    return size;
  }

  private calculateResponseSize(data: any): number {
    if (!data) return 0;
    
    try {
      return JSON.stringify(data).length;
    } catch (error) {
      return 0;
    }
  }

  private async logPerformanceMetrics(
    request: any,
    response: any,
    metrics: PerformanceMetrics,
    responseData: any,
    error: Error | null,
    endpoint?: string,
  ): Promise<void> {
    try {
      const endTime = process.hrtime(metrics.startTime);
      const responseTime = Math.round((endTime[0] * 1000) + (endTime[1] * 1e-6));
      
      const endMemory = process.memoryUsage();
      const memoryUsage = (endMemory.heapUsed - metrics.startMemory.heapUsed) / 1024 / 1024;
      
      const responseSize = this.calculateResponseSize(responseData);
      const statusCode = response.statusCode || 200;

      // Extract user info if available
      const user = request.user;
      const userId = user?.id || user?.sub;

      // Handle different request types
      const method = request.method || 'POST';
      const url = request.url || endpoint || 'GraphQL';
      const path = request.path || endpoint || 'GraphQL';

      // Get additional performance data
      const performanceData = {
        heap: {
          used: endMemory.heapUsed,
          total: endMemory.heapTotal,
          external: endMemory.external,
        },
        timing: {
          responseTime,
          requestTime: new Date().toISOString(),
        },
        request: {
          method,
          url,
          headers: this.sanitizeHeaders(request.headers || {}),
          query: request.query || {},
        },
        response: {
          statusCode,
          headers: this.sanitizeHeaders(response.getHeaders ? response.getHeaders() : {}),
        },
        error: error ? {
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack trace
        } : null,
      };

      // Log to audit system with performance data
      await this.auditService.logAuditWithPerformance({
        userId: userId || 'anonymous',
        action: `${method}_${path}`,
        resourceType: 'api_call',
        resourceId: path,
        method: request.method,
        endpoint: request.path,
        success: !error && statusCode < 400,
        errorMessage: error?.message,
        statusCode,
        responseTime,
        requestSize: metrics.requestSize,
        responseSize,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        dbQueryCount: (request as any).dbQueryCount || 0,
        dbQueryTime: (request as any).dbQueryTime || 0,
        performanceData,
        ipAddress: request.ip || request.connection.remoteAddress,
        userAgent: request.get('User-Agent'),
        sessionId: (request as any).sessionId,
        correlationId: request.get('X-Correlation-ID') || request.get('X-Request-ID'),
      });

      // Log slow requests
      if (responseTime > 1000) {
        this.logger.warn(`Slow API request detected`, {
          method: request.method,
          path: request.path,
          responseTime: `${responseTime}ms`,
          statusCode,
          userId,
          memoryUsage: `${memoryUsage.toFixed(2)}MB`,
        });
      }

      // Log high memory usage
      if (memoryUsage > 50) {
        this.logger.warn(`High memory usage detected`, {
          method,
          path,
          memoryUsage: `${memoryUsage.toFixed(2)}MB`,
          responseTime: `${responseTime}ms`,
          userId,
        });
      }

    } catch (logError) {
      this.logger.error(`Failed to log performance metrics: ${logError.message}`);
    }
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'password',
      'secret',
    ];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}