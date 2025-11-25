import { PrismaService } from '../../prisma/prisma.service';
export interface SecurityEventDto {
    userId: string;
    eventType: string;
    resourceType?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: any;
}
export interface AuditLogDto {
    userId: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    metadata?: any;
}
export interface PerformanceAuditLogDto extends AuditLogDto {
    method?: string;
    endpoint?: string;
    success?: boolean;
    errorMessage?: string;
    statusCode?: number;
    responseTime?: number;
    requestSize?: number;
    responseSize?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    dbQueryTime?: number;
    dbQueryCount?: number;
    performanceData?: any;
    correlationId?: string;
}
export declare class SecurityAuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private normalizeUserId;
    logSecurityEvent(eventDto: SecurityEventDto): Promise<void>;
    logAudit(auditDto: AuditLogDto): Promise<void>;
    logAuditWithPerformance(auditDto: PerformanceAuditLogDto): Promise<void>;
    getSecurityEvents(userId?: string, eventType?: string, resourceType?: string, severity?: string, limit?: number, offset?: number): Promise<{
        events: ({
            user: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            category: string;
            id: string;
            createdAt: Date;
            sessionId: string | null;
            ipAddress: string;
            userAgent: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string | null;
            updatedAt: Date;
            severity: string;
            correlationId: string | null;
            description: string;
            eventType: string;
            location: string | null;
            riskScore: number | null;
            isBlocked: boolean;
            requiresAction: boolean;
            isResolved: boolean;
            resolvedBy: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            detectedAt: Date;
            parentEventId: string | null;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getAuditLogs(userId?: string, action?: string, resourceType?: string, limit?: number, offset?: number): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            id: string;
            createdAt: Date;
            sessionId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            action: string;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string | null;
            resourceType: string;
            resourceId: string | null;
            method: string | null;
            endpoint: string | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            entityName: string | null;
            parentResourceType: string | null;
            parentResourceId: string | null;
            operationType: string | null;
            severity: string;
            tags: string[];
            batchId: string | null;
            batchSize: number | null;
            batchIndex: number | null;
            success: boolean;
            errorMessage: string | null;
            errorCode: string | null;
            responseTime: number | null;
            requestSize: number | null;
            responseSize: number | null;
            dbQueryTime: number | null;
            dbQueryCount: number | null;
            memoryUsage: number | null;
            cpuUsage: number | null;
            statusCode: number | null;
            performanceData: import("@prisma/client/runtime/library").JsonValue | null;
            requiresReview: boolean;
            sensitiveData: boolean;
            retentionPeriod: number | null;
            correlationId: string | null;
            sessionInfo: import("@prisma/client/runtime/library").JsonValue | null;
            clientInfo: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getSecurityDashboard(timeframe?: 'day' | 'week' | 'month'): Promise<{
        timeframe: "day" | "month" | "week";
        summary: {
            totalEvents: number;
            criticalEvents: number;
            highEvents: number;
            riskScore: number;
        };
        eventsByType: {
            eventType: string;
            count: number;
        }[];
        eventsByUser: {
            userId: string;
            count: number;
        }[];
        recentEvents: ({
            user: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            category: string;
            id: string;
            createdAt: Date;
            sessionId: string | null;
            ipAddress: string;
            userAgent: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string | null;
            updatedAt: Date;
            severity: string;
            correlationId: string | null;
            description: string;
            eventType: string;
            location: string | null;
            riskScore: number | null;
            isBlocked: boolean;
            requiresAction: boolean;
            isResolved: boolean;
            resolvedBy: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            detectedAt: Date;
            parentEventId: string | null;
        })[];
    }>;
    private calculateRiskScore;
    detectAnomalies(userId: string, timeframe?: 'hour' | 'day'): Promise<{
        userId: string;
        timeframe: "day" | "hour";
        anomaliesDetected: number;
        anomalies: any[];
        riskLevel: "medium" | "critical" | "low" | "high";
    }>;
    private calculateAnomalyRiskLevel;
    generateComplianceReport(startDate: Date, endDate: Date): Promise<{
        complianceScore: number;
        status: string;
        reportId: string;
        generatedAt: Date;
        reportPeriod: {
            startDate: Date;
            endDate: Date;
        };
        summary: {
            totalAuditLogs: number;
            securityEventsBySeverity: Record<string, number>;
            accessControlChanges: number;
        };
        userActivities: {
            userId: string;
            eventType: string;
            count: number;
        }[];
        accessChanges: {
            id: string;
            action: string;
            userId: string;
            user: {
                id: string;
                email: string;
                username: string;
            };
            resourceType: string;
            resourceId: string;
            timestamp: Date;
            details: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    private calculateOverallComplianceScore;
    private generateBaseComplianceReport;
}
