import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EnhancedAuditService } from '../services/enhanced-audit.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditService;
    private readonly logger;
    constructor(auditService: EnhancedAuditService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private analyzeOperation;
    private extractResourceType;
    private extractResourceId;
    private extractEntityName;
    private shouldSkipAudit;
    private shouldCaptureResult;
    private sanitizeResult;
    private sanitizeVariables;
    private extractSelectionSet;
}
