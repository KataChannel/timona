import { SecurityAuditService } from '../services/security-audit.service';
export interface ComplianceReportRequest {
    framework: 'GDPR' | 'SOC2' | 'ISO27001';
    startDate: string;
    endDate: string;
}
export declare class ComplianceController {
    private readonly auditService;
    constructor(auditService: SecurityAuditService);
    generateGDPRReport(req: any, body: ComplianceReportRequest): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    generateSOC2Report(req: any, body: ComplianceReportRequest): Promise<{
        success: boolean;
        data: {
            framework: string;
            reportId: string;
            trustServicesCriteria: {
                security: boolean;
                availability: boolean;
                processingIntegrity: boolean;
                confidentiality: boolean;
            };
            complianceScore: number;
            status: string;
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getComplianceDashboard(req: any, timeframe?: string): Promise<{
        success: boolean;
        data: {
            gdprCompliance: {
                score: number;
                status: string;
                lastAssessment: Date;
            };
            soc2Compliance: {
                score: number;
                status: string;
                lastAssessment: Date;
            };
            securityPosture: {
                riskLevel: string;
                improvementAreas: string[];
            };
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getComplianceAuditLogs(req: any, action?: string, resourceType?: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getSecurityEvents(req: any, eventType?: string, severity?: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getUserAnomalies(req: any, timeframe?: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            timeframe: "day" | "hour";
            anomaliesDetected: number;
            anomalies: any[];
            riskLevel: "medium" | "critical" | "low" | "high";
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    private identifyImprovementAreas;
}
