import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
export interface AuditContext {
    userId?: string;
    sessionId?: string;
    request?: Request;
    correlationId?: string;
    batchId?: string;
    parentResource?: {
        type: string;
        id: string;
    };
}
export interface AuditOperation {
    action: string;
    resourceType: string;
    resourceId?: string;
    entityName?: string;
    operationType?: 'CRUD' | 'AUTH' | 'PERMISSION' | 'SECURITY' | 'SYSTEM';
    severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    tags?: string[];
    oldValues?: any;
    newValues?: any;
    details?: any;
    sensitiveData?: boolean;
    requiresReview?: boolean;
}
export declare class EnhancedAuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logOperation(operation: AuditOperation, context?: AuditContext, performance?: {
        responseTime?: number;
        dbQueryTime?: number;
        dbQueryCount?: number;
        memoryUsage?: number;
        cpuUsage?: number;
    }): Promise<void>;
    logFailure(operation: AuditOperation, context: AuditContext, error: Error, statusCode?: number): Promise<void>;
    logBatchOperation(operations: AuditOperation[], context: AuditContext): Promise<void>;
    createAuditDecorator(operation: Omit<AuditOperation, 'oldValues' | 'newValues'>, options?: {
        captureArgs?: boolean;
        captureResult?: boolean;
        sensitiveFields?: string[];
    }): (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
    getAuditLogs(filters: {
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
    }): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                username: string;
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
            details: Prisma.JsonValue | null;
            userId: string | null;
            resourceType: string;
            resourceId: string | null;
            method: string | null;
            endpoint: string | null;
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
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
            performanceData: Prisma.JsonValue | null;
            requiresReview: boolean;
            sensitiveData: boolean;
            retentionPeriod: number | null;
            correlationId: string | null;
            sessionInfo: Prisma.JsonValue | null;
            clientInfo: Prisma.JsonValue | null;
            timestamp: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAuditStats(filters: {
        userId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
        totalLogs: number;
        successRate: number;
        operationsByType: (Prisma.PickEnumerable<Prisma.AuditLogGroupByOutputType, "operationType"[]> & {
            _count: {
                operationType: number;
            };
        })[];
        severityBreakdown: (Prisma.PickEnumerable<Prisma.AuditLogGroupByOutputType, "severity"[]> & {
            _count: {
                severity: number;
            };
        })[];
        topResources: (Prisma.PickEnumerable<Prisma.AuditLogGroupByOutputType, "resourceType"[]> & {
            _count: {
                resourceType: number;
            };
        })[];
        averageResponseTime: number;
    }>;
    private generateCorrelationId;
    private generateBatchId;
    private sanitizeHeaders;
    private sanitizeData;
}
