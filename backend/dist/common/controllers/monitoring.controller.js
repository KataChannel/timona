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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const real_time_monitoring_service_1 = require("../services/real-time-monitoring.service");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
let MonitoringController = class MonitoringController {
    constructor(monitoringService, performanceMetricsService) {
        this.monitoringService = monitoringService;
        this.performanceMetricsService = performanceMetricsService;
    }
    getRealTimeMetrics() {
        return this.monitoringService.getLatestMetrics();
    }
    async getDashboardData() {
        return this.monitoringService.getDashboardData();
    }
    getPerformanceStats() {
        return this.performanceMetricsService.getPerformanceStats();
    }
    getQueryInsights() {
        return this.performanceMetricsService.getQueryInsights();
    }
    async getHistoricalMetrics(range = '1h') {
        return this.monitoringService.getHistoricalMetrics(range);
    }
    exportPrometheusMetrics() {
        return {
            contentType: 'text/plain',
            data: this.performanceMetricsService.exportPrometheusMetrics()
        };
    }
    getAlertRules() {
        return this.monitoringService.getAlertRules();
    }
    createAlertRule(rule) {
        const ruleId = this.monitoringService.addAlertRule(rule);
        return { id: ruleId, message: 'Alert rule created successfully' };
    }
    updateAlertRule(id, updates) {
        const success = this.monitoringService.updateAlertRule(id, updates);
        return {
            success,
            message: success ? 'Alert rule updated successfully' : 'Alert rule not found'
        };
    }
    deleteAlertRule(id) {
        const success = this.monitoringService.removeAlertRule(id);
        return {
            success,
            message: success ? 'Alert rule deleted successfully' : 'Alert rule not found'
        };
    }
    getRecentAlerts() {
        return this.monitoringService.getRecentAlerts();
    }
    async getSystemHealth() {
        const metrics = this.monitoringService.getLatestMetrics();
        const perfStats = this.performanceMetricsService.getPerformanceStats();
        if (!metrics) {
            return {
                status: 'starting',
                message: 'Monitoring service is starting up'
            };
        }
        const issues = [];
        if (metrics.performance.averageResponseTime > 2000) {
            issues.push('High response time');
        }
        if (metrics.performance.errorRate > 5) {
            issues.push('High error rate');
        }
        if (metrics.performance.cacheHitRate < 70) {
            issues.push('Low cache hit rate');
        }
        if (metrics.system.memoryUsage.heapUsed > 800 * 1024 * 1024) {
            issues.push('High memory usage');
        }
        const status = issues.length === 0 ? 'healthy' :
            issues.length <= 2 ? 'warning' : 'critical';
        return {
            status,
            issues,
            timestamp: Date.now(),
            uptime: metrics.system.uptime,
            metrics: {
                responseTime: metrics.performance.averageResponseTime,
                errorRate: metrics.performance.errorRate,
                cacheHitRate: metrics.performance.cacheHitRate,
                memoryUsageMB: Math.round(metrics.system.memoryUsage.heapUsed / 1024 / 1024),
                activeConnections: metrics.performance.activeConnections,
                requestsPerSecond: metrics.performance.requestsPerSecond
            }
        };
    }
    async triggerMetricsCollection() {
        return { message: 'Metrics collection triggered' };
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('metrics/realtime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getRealTimeMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('performance/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getPerformanceStats", null);
__decorate([
    (0, common_1.Get)('performance/queries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getQueryInsights", null);
__decorate([
    (0, common_1.Get)('metrics/historical'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHistoricalMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/prometheus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "exportPrometheusMetrics", null);
__decorate([
    (0, common_1.Get)('alerts/rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertRules", null);
__decorate([
    (0, common_1.Post)('alerts/rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createAlertRule", null);
__decorate([
    (0, common_1.Put)('alerts/rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "updateAlertRule", null);
__decorate([
    (0, common_1.Delete)('alerts/rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "deleteAlertRule", null);
__decorate([
    (0, common_1.Get)('alerts/history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getRecentAlerts", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Post)('metrics/collect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "triggerMetricsCollection", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)('monitoring'),
    __metadata("design:paramtypes", [real_time_monitoring_service_1.RealTimeMonitoringService,
        performance_metrics_service_1.PerformanceMetricsService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map