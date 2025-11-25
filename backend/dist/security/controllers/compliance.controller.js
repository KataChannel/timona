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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const security_audit_service_1 = require("../services/security-audit.service");
let ComplianceController = class ComplianceController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async generateGDPRReport(req, body) {
        try {
            const startDate = new Date(body.startDate);
            const endDate = new Date(body.endDate);
            const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);
            await this.auditService.logSecurityEvent({
                userId: req.user?.id || 'system',
                eventType: 'gdpr_compliance_report_generated',
                severity: 'low',
                details: {
                    framework: 'GDPR',
                    period: { startDate, endDate },
                    complianceScore: complianceReport.complianceScore,
                },
            });
            return {
                success: true,
                data: complianceReport,
                message: 'GDPR compliance report generated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate GDPR compliance report',
            };
        }
    }
    async generateSOC2Report(req, body) {
        try {
            const startDate = new Date(body.startDate);
            const endDate = new Date(body.endDate);
            const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);
            const soc2Report = {
                ...complianceReport,
                framework: 'SOC2',
                reportId: `soc2-${Date.now()}`,
                trustServicesCriteria: {
                    security: complianceReport.complianceScore >= 90,
                    availability: true,
                    processingIntegrity: true,
                    confidentiality: complianceReport.complianceScore >= 95,
                },
            };
            await this.auditService.logSecurityEvent({
                userId: req.user?.id || 'system',
                eventType: 'soc2_compliance_report_generated',
                severity: 'low',
                details: {
                    framework: 'SOC2',
                    period: { startDate, endDate },
                    complianceScore: complianceReport.complianceScore,
                },
            });
            return {
                success: true,
                data: soc2Report,
                message: 'SOC2 compliance report generated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate SOC2 compliance report',
            };
        }
    }
    async getComplianceDashboard(req, timeframe) {
        try {
            const dashboardData = await this.auditService.getSecurityDashboard(timeframe || 'month');
            const complianceMetrics = {
                ...dashboardData,
                gdprCompliance: {
                    score: Math.max(90 - dashboardData.summary.criticalEvents * 5, 0),
                    status: dashboardData.summary.criticalEvents === 0 ? 'compliant' : 'partial',
                    lastAssessment: new Date(),
                },
                soc2Compliance: {
                    score: Math.max(85 - dashboardData.summary.highEvents * 3, 0),
                    status: dashboardData.summary.highEvents <= 2 ? 'compliant' : 'partial',
                    lastAssessment: new Date(),
                },
                securityPosture: {
                    riskLevel: dashboardData.summary.riskScore > 50 ? 'high' :
                        dashboardData.summary.riskScore > 25 ? 'medium' : 'low',
                    improvementAreas: this.identifyImprovementAreas(dashboardData),
                },
            };
            return {
                success: true,
                data: complianceMetrics,
                message: 'Compliance dashboard data retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve compliance dashboard data',
            };
        }
    }
    async getComplianceAuditLogs(req, action, resourceType, limit, offset) {
        try {
            const auditLogs = await this.auditService.getAuditLogs(undefined, action, resourceType, parseInt(limit || '50'), parseInt(offset || '0'));
            return {
                success: true,
                data: auditLogs,
                message: 'Compliance audit logs retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve compliance audit logs',
            };
        }
    }
    async getSecurityEvents(req, eventType, severity, limit, offset) {
        try {
            const securityEvents = await this.auditService.getSecurityEvents(undefined, eventType, undefined, severity, parseInt(limit || '50'), parseInt(offset || '0'));
            return {
                success: true,
                data: securityEvents,
                message: 'Security events retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve security events',
            };
        }
    }
    async getUserAnomalies(req, timeframe) {
        try {
            const anomalies = await this.auditService.detectAnomalies(req.params.userId, timeframe || 'day');
            return {
                success: true,
                data: anomalies,
                message: 'User anomalies detected successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to detect user anomalies',
            };
        }
    }
    identifyImprovementAreas(dashboardData) {
        const areas = [];
        if (dashboardData.summary.criticalEvents > 0) {
            areas.push('Critical security incidents require immediate attention');
        }
        if (dashboardData.summary.highEvents > 5) {
            areas.push('High number of high-severity events indicates systemic issues');
        }
        if (dashboardData.summary.riskScore > 30) {
            areas.push('Overall risk score is elevated - review security controls');
        }
        const failedLoginEvents = dashboardData.eventsByType.find((event) => event.eventType === 'failed_login');
        if (failedLoginEvents && failedLoginEvents.count > 100) {
            areas.push('High number of failed login attempts - consider implementing rate limiting');
        }
        if (areas.length === 0) {
            areas.push('Security posture appears healthy - maintain current controls');
        }
        return areas;
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Post)('reports/gdpr'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateGDPRReport", null);
__decorate([
    (0, common_1.Post)('reports/soc2'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateSOC2Report", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceDashboard", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('resourceType')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getComplianceAuditLogs", null);
__decorate([
    (0, common_1.Get)('security-events'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getSecurityEvents", null);
__decorate([
    (0, common_1.Get)('anomalies/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserAnomalies", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('api/security/compliance'),
    __metadata("design:paramtypes", [security_audit_service_1.SecurityAuditService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map