export declare class AuditLogUser {
    id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}
export declare class AuditLog {
    id: string;
    userId?: string;
    sessionId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    entityName?: string;
    parentResourceType?: string;
    parentResourceId?: string;
    operationType?: string;
    severity: string;
    tags: string[];
    batchId?: string;
    batchSize?: number;
    batchIndex?: number;
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    endpoint?: string;
    oldValues?: any;
    newValues?: any;
    details?: any;
    success: boolean;
    errorMessage?: string;
    errorCode?: string;
    responseTime?: number;
    requestSize?: number;
    responseSize?: number;
    dbQueryTime?: number;
    dbQueryCount?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    statusCode?: number;
    performanceData?: any;
    requiresReview: boolean;
    sensitiveData: boolean;
    retentionPeriod?: number;
    correlationId?: string;
    sessionInfo?: any;
    clientInfo?: any;
    timestamp: Date;
    createdAt: Date;
    user?: AuditLogUser;
}
export declare class AuditLogFilter {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    operationType?: string;
    severity?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    correlationId?: string;
    batchId?: string;
    sensitiveData?: boolean;
    requiresReview?: boolean;
    page?: number;
    limit?: number;
}
export declare class PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class PaginatedAuditLogs {
    logs: AuditLog[];
    pagination: PaginationInfo;
}
export declare class OperationTypeCount {
    operationType: string;
    _count: {
        operationType: number;
    };
}
export declare class SeverityCount {
    severity: string;
    _count: {
        severity: number;
    };
}
export declare class ResourceTypeCount {
    resourceType: string;
    _count: {
        resourceType: number;
    };
}
export declare class AuditLogStats {
    totalLogs: number;
    successRate: number;
    operationsByType: OperationTypeCount[];
    severityBreakdown: SeverityCount[];
    topResources: ResourceTypeCount[];
    averageResponseTime?: number;
}
