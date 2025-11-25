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
var SecurityDashboardController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityDashboardController = void 0;
const common_1 = require("@nestjs/common");
const security_monitoring_service_1 = require("../services/security-monitoring.service");
const security_audit_service_1 = require("../services/security-audit.service");
let SecurityDashboardController = SecurityDashboardController_1 = class SecurityDashboardController {
    constructor(monitoringService, auditService) {
        this.monitoringService = monitoringService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(SecurityDashboardController_1.name);
    }
    async getSecuritySummary() {
        try {
            this.logger.log('Generating security dashboard summary');
            const assessment = await this.monitoringService.performSecurityAssessment();
            const now = new Date();
            const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const recentAuditLogs = await this.auditService.getAuditLogs(undefined, undefined, undefined, 1000, 0);
            const recentSecurityEvents = await this.auditService.getSecurityEvents(undefined, undefined, undefined, undefined, 1000, 0);
            const criticalEvents = await this.auditService.getSecurityEvents(undefined, undefined, undefined, 'critical', 100, 0);
            return {
                securityScore: assessment.overallScore,
                riskLevel: assessment.riskLevel,
                lastAssessment: assessment.timestamp,
                complianceStatus: {
                    gdpr: assessment.complianceStatus.gdpr.score,
                    soc2: assessment.complianceStatus.soc2.score,
                    iso27001: assessment.complianceStatus.iso27001.score,
                },
                recentActivity: {
                    auditLogsToday: recentAuditLogs.total,
                    securityEventsToday: recentSecurityEvents.total,
                    criticalAlertsOpen: criticalEvents.events.filter(e => !e.isResolved).length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate security summary: ${error.message}`);
            throw new common_1.HttpException('Failed to generate security summary', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async runSecurityAssessment() {
        try {
            this.logger.log('Security assessment requested');
            const assessment = await this.monitoringService.performSecurityAssessment();
            return {
                success: true,
                assessment,
                message: 'Security assessment completed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Security assessment failed: ${error.message}`);
            throw new common_1.HttpException('Security assessment failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateComplianceReport(days = '30') {
        try {
            const daysNum = Math.min(parseInt(days, 10) || 30, 365);
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
            this.logger.log(`Generating compliance report for ${daysNum} days`);
            const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);
            return {
                success: true,
                report: complianceReport,
                period: {
                    startDate,
                    endDate,
                    days: daysNum,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate compliance report: ${error.message}`);
            throw new common_1.HttpException('Failed to generate compliance report', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSecurityAlerts(severity, limit = '50') {
        try {
            const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const alerts = await this.auditService.getSecurityEvents(undefined, undefined, undefined, severity, limitNum, 0);
            return {
                success: true,
                alerts: alerts.events,
                totalCount: alerts.total,
                unresolved: alerts.events.filter(event => !event.isResolved).length,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get security alerts: ${error.message}`);
            throw new common_1.HttpException('Failed to get security alerts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSecurityRecommendations() {
        try {
            const assessment = await this.monitoringService.performSecurityAssessment();
            const criticalRecommendations = assessment.recommendations.filter(r => r.priority === 'critical');
            const highRecommendations = assessment.recommendations.filter(r => r.priority === 'high');
            return {
                success: true,
                recommendations: assessment.recommendations,
                summary: {
                    total: assessment.recommendations.length,
                    critical: criticalRecommendations.length,
                    high: highRecommendations.length,
                    medium: assessment.recommendations.filter(r => r.priority === 'medium').length,
                    low: assessment.recommendations.filter(r => r.priority === 'low').length,
                },
                topRecommendations: [...criticalRecommendations, ...highRecommendations].slice(0, 5),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get recommendations: ${error.message}`);
            throw new common_1.HttpException('Failed to get recommendations', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async runDailyAssessment() {
        try {
            this.logger.log('Running daily security assessment');
            const assessment = await this.monitoringService.runDailySecurityAssessment();
            return {
                success: true,
                message: 'Daily security assessment completed',
                assessment: {
                    id: assessment.assessmentId,
                    score: assessment.overallScore,
                    riskLevel: assessment.riskLevel,
                    timestamp: assessment.timestamp,
                },
            };
        }
        catch (error) {
            this.logger.error(`Daily assessment failed: ${error.message}`);
            throw new common_1.HttpException('Daily assessment failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async runWeeklyComplianceCheck() {
        try {
            this.logger.log('Running weekly compliance check');
            const report = await this.monitoringService.runWeeklyComplianceCheck();
            return {
                success: true,
                message: 'Weekly compliance check completed',
                report: {
                    complianceScore: report.complianceScore,
                    status: report.status,
                    timestamp: new Date(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Weekly compliance check failed: ${error.message}`);
            throw new common_1.HttpException('Weekly compliance check failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSystemHealth() {
        try {
            const now = new Date();
            const uptime = process.uptime();
            const health = {
                status: 'healthy',
                uptime: Math.floor(uptime),
                uptimeFormatted: this.formatUptime(uptime),
                timestamp: now,
                services: {
                    securityMonitoring: 'operational',
                    auditLogging: 'operational',
                    compliance: 'operational',
                },
            };
            return {
                success: true,
                health,
            };
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new common_1.HttpException('Health check failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
};
exports.SecurityDashboardController = SecurityDashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "getSecuritySummary", null);
__decorate([
    (0, common_1.Get)('assessment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "runSecurityAssessment", null);
__decorate([
    (0, common_1.Get)('compliance-report'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "generateComplianceReport", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('severity')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "getSecurityAlerts", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "getSecurityRecommendations", null);
__decorate([
    (0, common_1.Post)('assessment/daily'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "runDailyAssessment", null);
__decorate([
    (0, common_1.Post)('compliance/weekly-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "runWeeklyComplianceCheck", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityDashboardController.prototype, "getSystemHealth", null);
exports.SecurityDashboardController = SecurityDashboardController = SecurityDashboardController_1 = __decorate([
    (0, common_1.Controller)('security/dashboard'),
    __metadata("design:paramtypes", [security_monitoring_service_1.SecurityMonitoringService,
        security_audit_service_1.SecurityAuditService])
], SecurityDashboardController);
//# sourceMappingURL=security-dashboard.controller.js.map