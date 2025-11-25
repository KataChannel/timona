import { EnhancedAuditService } from 'src/services/enhanced-audit.service';
import { PaginatedAuditLogs, AuditLogFilter, AuditLogStats } from './audit-log.types';
export declare class AuditResolver {
    private readonly auditService;
    constructor(auditService: EnhancedAuditService);
    getAuditLogs(filters?: AuditLogFilter, context?: any): Promise<PaginatedAuditLogs>;
    getMyAuditLogs(filters?: Omit<AuditLogFilter, 'userId'>, context?: any): Promise<PaginatedAuditLogs>;
    getAuditStats(userId?: string, dateFrom?: Date, dateTo?: Date): Promise<AuditLogStats>;
    getMyAuditStats(dateFrom?: Date, dateTo?: Date, context?: any): Promise<AuditLogStats>;
}
