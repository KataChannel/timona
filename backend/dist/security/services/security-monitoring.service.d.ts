import { PrismaService } from '../../prisma/prisma.service';
import { SecurityAuditService } from './security-audit.service';
import { RbacService } from './rbac.service';
export interface SecurityAssessment {
    assessmentId: string;
    timestamp: Date;
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    categories: {
        authentication: SecurityCategoryScore;
        authorization: SecurityCategoryScore;
        dataProtection: SecurityCategoryScore;
        auditLogging: SecurityCategoryScore;
        incidentResponse: SecurityCategoryScore;
    };
    recommendations: SecurityRecommendation[];
    complianceStatus: {
        gdpr: ComplianceStatus;
        soc2: ComplianceStatus;
        iso27001: ComplianceStatus;
    };
}
export interface SecurityCategoryScore {
    score: number;
    maxScore: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    findings: string[];
    improvements: string[];
}
export interface SecurityRecommendation {
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
}
export interface ComplianceStatus {
    score: number;
    status: 'compliant' | 'partial' | 'non-compliant';
    lastAssessment: Date;
    nextAssessment: Date;
    keyRequirements: {
        requirement: string;
        status: 'met' | 'partial' | 'not-met';
        evidence?: string;
    }[];
}
export declare class SecurityMonitoringService {
    private prisma;
    private auditService;
    private rbacService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: SecurityAuditService, rbacService: RbacService);
    runDailySecurityAssessment(): Promise<SecurityAssessment>;
    runWeeklyComplianceCheck(): Promise<{
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
    performSecurityAssessment(): Promise<SecurityAssessment>;
    private assessAuthentication;
    private assessAuthorization;
    private assessDataProtection;
    private assessAuditLogging;
    private assessIncidentResponse;
    private calculateOverallScore;
    private determineRiskLevel;
    private getScoreStatus;
    private generateSecurityRecommendations;
    private assessComplianceStatus;
    private storeSecurityAssessment;
    private sendCriticalSecurityAlert;
}
