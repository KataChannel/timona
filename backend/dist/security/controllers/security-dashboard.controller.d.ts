import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SecurityAuditService } from '../services/security-audit.service';
export interface SecurityDashboardSummary {
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastAssessment: Date;
    complianceStatus: {
        gdpr: number;
        soc2: number;
        iso27001: number;
    };
    recentActivity: {
        auditLogsToday: number;
        securityEventsToday: number;
        criticalAlertsOpen: number;
    };
}
export declare class SecurityDashboardController {
    private readonly monitoringService;
    private readonly auditService;
    private readonly logger;
    constructor(monitoringService: SecurityMonitoringService, auditService: SecurityAuditService);
    getSecuritySummary(): Promise<SecurityDashboardSummary>;
    runSecurityAssessment(): Promise<{
        success: boolean;
        assessment: import("../services/security-monitoring.service").SecurityAssessment;
        message: string;
    }>;
    generateComplianceReport(days?: string): Promise<{
        success: boolean;
        report: {
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
        period: {
            startDate: Date;
            endDate: Date;
            days: number;
        };
    }>;
    getSecurityAlerts(severity?: 'low' | 'medium' | 'high' | 'critical', limit?: string): Promise<{
        success: boolean;
        alerts: ({
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
        totalCount: number;
        unresolved: number;
    }>;
    getSecurityRecommendations(): Promise<{
        success: boolean;
        recommendations: import("../services/security-monitoring.service").SecurityRecommendation[];
        summary: {
            total: number;
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
        topRecommendations: import("../services/security-monitoring.service").SecurityRecommendation[];
    }>;
    runDailyAssessment(): Promise<{
        success: boolean;
        message: string;
        assessment: {
            id: string;
            score: number;
            riskLevel: "medium" | "critical" | "low" | "high";
            timestamp: Date;
        };
    }>;
    runWeeklyComplianceCheck(): Promise<{
        success: boolean;
        message: string;
        report: {
            complianceScore: number;
            status: string;
            timestamp: Date;
        };
    }>;
    getSystemHealth(): Promise<{
        success: boolean;
        health: {
            status: string;
            uptime: number;
            uptimeFormatted: string;
            timestamp: Date;
            services: {
                securityMonitoring: string;
                auditLogging: string;
                compliance: string;
            };
        };
    }>;
    private formatUptime;
}
