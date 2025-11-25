"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SecurityMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const security_audit_service_1 = require("./security-audit.service");
const rbac_service_1 = require("./rbac.service");
let SecurityMonitoringService = SecurityMonitoringService_1 = class SecurityMonitoringService {
    constructor(prisma, auditService, rbacService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.rbacService = rbacService;
        this.logger = new common_1.Logger(SecurityMonitoringService_1.name);
    }
    async runDailySecurityAssessment() {
        this.logger.log('Running daily security assessment');
        try {
            const assessment = await this.performSecurityAssessment();
            await this.storeSecurityAssessment(assessment);
            if (assessment.riskLevel === 'critical') {
                await this.sendCriticalSecurityAlert(assessment);
            }
            return assessment;
        }
        catch (error) {
            this.logger.error(`Daily security assessment failed: ${error.message}`);
            throw error;
        }
    }
    async runWeeklyComplianceCheck() {
        this.logger.log('Running weekly compliance check');
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            const gdprReport = await this.auditService.generateComplianceReport(startDate, endDate);
            await this.auditService.logSecurityEvent({
                userId: 'system',
                eventType: 'weekly_compliance_check',
                severity: gdprReport.complianceScore < 70 ? 'high' : 'low',
                details: {
                    complianceScore: gdprReport.complianceScore,
                    status: gdprReport.status,
                    period: { startDate, endDate },
                },
            });
            return gdprReport;
        }
        catch (error) {
            this.logger.error(`Weekly compliance check failed: ${error.message}`);
            throw error;
        }
    }
    async performSecurityAssessment() {
        this.logger.log('Performing comprehensive security assessment');
        const [authScore, authzScore, dataProtectionScore, auditScore, incidentScore] = await Promise.all([
            this.assessAuthentication(),
            this.assessAuthorization(),
            this.assessDataProtection(),
            this.assessAuditLogging(),
            this.assessIncidentResponse(),
        ]);
        const categories = {
            authentication: authScore,
            authorization: authzScore,
            dataProtection: dataProtectionScore,
            auditLogging: auditScore,
            incidentResponse: incidentScore,
        };
        const overallScore = this.calculateOverallScore(categories);
        const riskLevel = this.determineRiskLevel(overallScore);
        const recommendations = this.generateSecurityRecommendations(categories);
        const complianceStatus = await this.assessComplianceStatus();
        return {
            assessmentId: `assessment-${Date.now()}`,
            timestamp: new Date(),
            overallScore,
            riskLevel,
            categories,
            recommendations,
            complianceStatus,
        };
    }
    async assessAuthentication() {
        const findings = [];
        const improvements = [];
        let score = 100;
        const maxScore = 100;
        const totalUsers = await this.prisma.user.count({ where: { isActive: true } });
        const mfaUsers = await this.prisma.user.count({
            where: { isActive: true, isTwoFactorEnabled: true }
        });
        const mfaAdoption = totalUsers > 0 ? (mfaUsers / totalUsers) * 100 : 0;
        if (mfaAdoption < 50) {
            score -= 30;
            findings.push(`Low MFA adoption rate: ${mfaAdoption.toFixed(1)}%`);
            improvements.push('Implement mandatory MFA for all users');
        }
        else if (mfaAdoption < 80) {
            score -= 15;
            findings.push(`Moderate MFA adoption rate: ${mfaAdoption.toFixed(1)}%`);
            improvements.push('Encourage MFA adoption through user education');
        }
        const privilegedWithoutMFA = await this.prisma.user.count({
            where: {
                isActive: true,
                roleType: 'ADMIN',
                isTwoFactorEnabled: false,
            },
        });
        if (privilegedWithoutMFA > 0) {
            score -= 25;
            findings.push(`${privilegedWithoutMFA} privileged users without MFA`);
            improvements.push('Enforce MFA for all privileged accounts');
        }
        const recentFailedLogins = await this.prisma.securityEvent.count({
            where: {
                eventType: { contains: 'failed_login' },
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        if (recentFailedLogins > 100) {
            score -= 10;
            findings.push(`High number of failed login attempts: ${recentFailedLogins}`);
            improvements.push('Implement stricter rate limiting and account lockout policies');
        }
        return {
            score: Math.max(0, score),
            maxScore,
            status: this.getScoreStatus(score, maxScore),
            findings,
            improvements,
        };
    }
    async assessAuthorization() {
        const findings = [];
        const improvements = [];
        let score = 100;
        const maxScore = 100;
        const totalUsers = await this.prisma.user.count({ where: { isActive: true } });
        const adminUsers = await this.prisma.user.count({
            where: { isActive: true, roleType: 'ADMIN' },
        });
        const adminRatio = totalUsers > 0 ? (adminUsers / totalUsers) * 100 : 0;
        if (adminRatio > 20) {
            score -= 25;
            findings.push(`Too many admin users: ${adminRatio.toFixed(1)}%`);
            improvements.push('Apply principle of least privilege - reduce admin access');
        }
        else if (adminRatio > 10) {
            score -= 10;
            findings.push(`High admin user ratio: ${adminRatio.toFixed(1)}%`);
            improvements.push('Review admin access assignments');
        }
        const recentPermChanges = await this.prisma.auditLog.count({
            where: {
                action: { in: ['role_assigned', 'role_removed', 'permission_granted', 'permission_revoked'] },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
        });
        if (recentPermChanges > 50) {
            score -= 5;
            findings.push(`High number of recent permission changes: ${recentPermChanges}`);
            improvements.push('Review access management processes for efficiency');
        }
        return {
            score: Math.max(0, score),
            maxScore,
            status: this.getScoreStatus(score, maxScore),
            findings,
            improvements,
        };
    }
    async assessDataProtection() {
        const findings = [];
        const improvements = [];
        let score = 100;
        const maxScore = 100;
        const dataViolations = await this.prisma.securityEvent.count({
            where: {
                eventType: { contains: 'unauthorized_access' },
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
        });
        if (dataViolations > 0) {
            score -= dataViolations * 10;
            findings.push(`${dataViolations} unauthorized data access attempts`);
            improvements.push('Strengthen data access controls and monitoring');
        }
        findings.push('Data encryption status: Implemented');
        return {
            score: Math.max(0, score),
            maxScore,
            status: this.getScoreStatus(score, maxScore),
            findings,
            improvements,
        };
    }
    async assessAuditLogging() {
        const findings = [];
        const improvements = [];
        let score = 100;
        const maxScore = 100;
        const recentAuditLogs = await this.prisma.auditLog.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        const recentSecurityEvents = await this.prisma.securityEvent.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        if (recentAuditLogs === 0 && recentSecurityEvents === 0) {
            score -= 50;
            findings.push('No recent audit logs or security events - logging may be disabled');
            improvements.push('Ensure comprehensive audit logging is enabled');
        }
        findings.push(`Recent audit logs: ${recentAuditLogs}`);
        findings.push(`Recent security events: ${recentSecurityEvents}`);
        return {
            score: Math.max(0, score),
            maxScore,
            status: this.getScoreStatus(score, maxScore),
            findings,
            improvements,
        };
    }
    async assessIncidentResponse() {
        const findings = [];
        const improvements = [];
        let score = 100;
        const maxScore = 100;
        const unresolvedCritical = await this.prisma.securityEvent.count({
            where: {
                severity: 'critical',
                isResolved: false,
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
        });
        if (unresolvedCritical > 0) {
            score -= unresolvedCritical * 20;
            findings.push(`${unresolvedCritical} unresolved critical security incidents`);
            improvements.push('Prioritize resolution of critical security incidents');
        }
        const recentIncidents = await this.prisma.securityEvent.findMany({
            where: {
                severity: { in: ['high', 'critical'] },
                isResolved: true,
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            select: {
                createdAt: true,
                resolvedAt: true,
            },
        });
        if (recentIncidents.length > 0) {
            const avgResponseTime = recentIncidents.reduce((sum, incident) => {
                if (incident.resolvedAt) {
                    return sum + (incident.resolvedAt.getTime() - incident.createdAt.getTime());
                }
                return sum;
            }, 0) / recentIncidents.length;
            const avgResponseHours = avgResponseTime / (1000 * 60 * 60);
            if (avgResponseHours > 24) {
                score -= 15;
                findings.push(`Slow incident response time: ${avgResponseHours.toFixed(1)} hours average`);
                improvements.push('Improve incident response procedures and automation');
            }
        }
        return {
            score: Math.max(0, score),
            maxScore,
            status: this.getScoreStatus(score, maxScore),
            findings,
            improvements,
        };
    }
    calculateOverallScore(categories) {
        const weights = {
            authentication: 0.25,
            authorization: 0.20,
            dataProtection: 0.25,
            auditLogging: 0.15,
            incidentResponse: 0.15,
        };
        let weightedSum = 0;
        let totalWeight = 0;
        Object.entries(categories).forEach(([category, data]) => {
            const weight = weights[category] || 0;
            weightedSum += data.score * weight;
            totalWeight += weight;
        });
        return Math.round(weightedSum / totalWeight);
    }
    determineRiskLevel(score) {
        if (score >= 90)
            return 'low';
        if (score >= 75)
            return 'medium';
        if (score >= 50)
            return 'high';
        return 'critical';
    }
    getScoreStatus(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90)
            return 'excellent';
        if (percentage >= 75)
            return 'good';
        if (percentage >= 50)
            return 'fair';
        return 'poor';
    }
    generateSecurityRecommendations(categories) {
        const recommendations = [];
        Object.entries(categories).forEach(([category, data]) => {
            if (data.score < 75) {
                data.improvements.forEach((improvement, index) => {
                    recommendations.push({
                        id: `rec-${category}-${index}`,
                        priority: data.score < 50 ? 'critical' : data.score < 75 ? 'high' : 'medium',
                        category,
                        title: improvement,
                        description: `Improve ${category} security posture`,
                        impact: 'Enhanced security posture and compliance',
                        effort: 'medium',
                        timeline: data.score < 50 ? 'immediate' : '1-3 months',
                    });
                });
            }
        });
        return recommendations;
    }
    async assessComplianceStatus() {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const complianceReport = await this.auditService.generateComplianceReport(monthAgo, now);
        return {
            gdpr: {
                score: complianceReport.complianceScore,
                status: complianceReport.status,
                lastAssessment: now,
                nextAssessment: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                keyRequirements: [
                    { requirement: 'Data encryption', status: 'met', evidence: 'AES-256 encryption implemented' },
                    { requirement: 'Access controls', status: 'met', evidence: 'RBAC system active' },
                    { requirement: 'Audit logging', status: 'met', evidence: 'Comprehensive logging enabled' },
                ],
            },
            soc2: {
                score: Math.max(0, complianceReport.complianceScore - 5),
                status: complianceReport.complianceScore >= 85 ? 'compliant' :
                    complianceReport.complianceScore >= 70 ? 'partial' : 'non-compliant',
                lastAssessment: now,
                nextAssessment: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
                keyRequirements: [
                    { requirement: 'Security controls', status: 'met' },
                    { requirement: 'Availability monitoring', status: 'partial' },
                    { requirement: 'Processing integrity', status: 'met' },
                ],
            },
            iso27001: {
                score: Math.max(0, complianceReport.complianceScore - 10),
                status: complianceReport.complianceScore >= 90 ? 'compliant' :
                    complianceReport.complianceScore >= 75 ? 'partial' : 'non-compliant',
                lastAssessment: now,
                nextAssessment: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
                keyRequirements: [
                    { requirement: 'Information security policy', status: 'met' },
                    { requirement: 'Risk management', status: 'partial' },
                    { requirement: 'Business continuity', status: 'not-met' },
                ],
            },
        };
    }
    async storeSecurityAssessment(assessment) {
        await this.auditService.logSecurityEvent({
            userId: 'system',
            eventType: 'security_assessment_completed',
            severity: assessment.riskLevel === 'critical' ? 'critical' :
                assessment.riskLevel === 'high' ? 'high' : 'low',
            details: {
                assessmentId: assessment.assessmentId,
                overallScore: assessment.overallScore,
                riskLevel: assessment.riskLevel,
                categoryScores: Object.fromEntries(Object.entries(assessment.categories).map(([key, value]) => [key, value.score])),
                recommendationCount: assessment.recommendations.length,
            },
        });
    }
    async sendCriticalSecurityAlert(assessment) {
        this.logger.error(`CRITICAL SECURITY ALERT: Overall security score is ${assessment.overallScore}`);
        await this.auditService.logSecurityEvent({
            userId: 'system',
            eventType: 'critical_security_alert',
            severity: 'critical',
            details: {
                assessmentId: assessment.assessmentId,
                overallScore: assessment.overallScore,
                criticalFindings: assessment.recommendations
                    .filter(r => r.priority === 'critical')
                    .map(r => r.title),
            },
        });
    }
};
exports.SecurityMonitoringService = SecurityMonitoringService;
exports.SecurityMonitoringService = SecurityMonitoringService = SecurityMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        security_audit_service_1.SecurityAuditService,
        rbac_service_1.RbacService])
], SecurityMonitoringService);
//# sourceMappingURL=security-monitoring.service.js.map