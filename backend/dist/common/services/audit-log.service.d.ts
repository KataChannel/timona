import { PrismaService } from '../../prisma/prisma.service';
export declare enum AuditAction {
    ASSIGN_ROLE = "ASSIGN_ROLE",
    REMOVE_ROLE = "REMOVE_ROLE",
    CREATE_ROLE = "CREATE_ROLE",
    UPDATE_ROLE = "UPDATE_ROLE",
    DELETE_ROLE = "DELETE_ROLE",
    CREATE_PERMISSION = "CREATE_PERMISSION",
    UPDATE_PERMISSION = "UPDATE_PERMISSION",
    DELETE_PERMISSION = "DELETE_PERMISSION",
    ASSIGN_PERMISSION = "ASSIGN_PERMISSION",
    REMOVE_PERMISSION = "REMOVE_PERMISSION",
    ACCESS_GRANTED = "ACCESS_GRANTED",
    ACCESS_DENIED = "ACCESS_DENIED",
    PERMISSION_CHECK = "PERMISSION_CHECK",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    ADMIN_BYPASS = "ADMIN_BYPASS"
}
interface AuditLogData {
    action: AuditAction;
    userId: string;
    targetUserId?: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
    severity?: 'info' | 'warn' | 'error' | 'critical';
}
interface GetAuditLogsParams {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
}
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<void>;
    logRoleAssignment(actorId: string, targetId: string, roleId: string, roleName: string, expiresAt?: Date, ipAddress?: string, userAgent?: string): Promise<void>;
    logRoleRemoval(actorId: string, targetId: string, roleId: string, roleName: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logAccessGranted(userId: string, resource: string, action: string, scope: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logAccessDenied(userId: string, resource: string, action: string, scope: string, reason: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logAdminBypass(userId: string, resource: string, action: string, ipAddress?: string, userAgent?: string): Promise<void>;
    getAuditLogs(params?: GetAuditLogsParams): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
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
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getSuspiciousActivities(days?: number): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.AuditLogGroupByOutputType, ("userId" | "resourceType")[]> & {
        _count: {
            id: number;
        };
    })[]>;
}
export {};
