import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
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
export declare class PerformanceInterceptor implements NestInterceptor {
    private readonly auditService;
    private readonly logger;
    constructor(auditService: SecurityAuditService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private shouldSkipLogging;
    private calculateRequestSize;
    private calculateResponseSize;
    private logPerformanceMetrics;
    private sanitizeHeaders;
}
