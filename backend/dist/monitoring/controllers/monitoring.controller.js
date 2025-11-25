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
const metrics_collector_service_1 = require("../services/metrics-collector.service");
const health_check_service_1 = require("../services/health-check.service");
const performance_profiler_service_1 = require("../services/performance-profiler.service");
const alert_manager_service_1 = require("../services/alert-manager.service");
let MonitoringController = class MonitoringController {
    constructor(metricsCollector, healthCheck, performanceProfiler, alertManager) {
        this.metricsCollector = metricsCollector;
        this.healthCheck = healthCheck;
        this.performanceProfiler = performanceProfiler;
        this.alertManager = alertManager;
    }
    async getHealth() {
        return await this.healthCheck.performHealthCheck();
    }
    async getSimpleHealth() {
        return await this.healthCheck.getSimpleHealthStatus();
    }
    async getSystemMetrics() {
        return await this.metricsCollector.getSystemMetrics();
    }
    async getApplicationMetrics() {
        return await this.metricsCollector.getApplicationMetrics();
    }
    async getCustomMetrics() {
        return await this.metricsCollector.getCustomMetrics();
    }
    async getPrometheusMetrics() {
        return await this.metricsCollector.getPrometheusMetrics();
    }
    recordCustomMetric(body) {
        const { name, value, type, description, labels } = body;
        this.metricsCollector.recordCustomMetric(name, value, type, description, labels);
        return { success: true, message: 'Metric recorded successfully' };
    }
    async getPerformanceProfile() {
        return await this.performanceProfiler.getPerformanceSnapshot();
    }
    startProfiling(body) {
        const duration = body.duration || 60000;
        this.performanceProfiler.startProfiling();
        return { success: true, message: 'Profiling started', duration };
    }
    stopProfiling() {
        this.performanceProfiler.stopProfiling();
        return { success: true, message: 'Profiling stopped' };
    }
    async getPerformanceRecommendations() {
        const snapshot = await this.performanceProfiler.getPerformanceSnapshot();
        return {
            recommendations: [
                'Consider monitoring memory usage patterns',
                'Profile CPU-intensive operations',
                'Monitor event loop lag'
            ],
            snapshot
        };
    }
    async analyzeBottlenecks() {
        const snapshot = await this.performanceProfiler.getPerformanceSnapshot();
        return {
            bottlenecks: [
                'High memory usage detected',
                'Event loop lag above threshold',
                'CPU usage spikes observed'
            ],
            snapshot
        };
    }
    getAlertSummary() {
        return this.alertManager.getAlertSummary();
    }
    getActiveAlerts() {
        return this.alertManager.getActiveAlerts();
    }
    createAlert(body) {
        const { title, description, severity, category, source, metrics, correlationId } = body;
        const alert = this.alertManager.createAlert(title, description, severity, category, source, metrics, correlationId);
        return { success: true, alert };
    }
    acknowledgeAlert(alertId, body) {
        const { user, comment } = body;
        const alert = this.alertManager.acknowledgeAlert(alertId, user, comment);
        if (!alert) {
            return { success: false, message: 'Alert not found' };
        }
        return { success: true, alert };
    }
    resolveAlert(alertId, body) {
        const { user, comment } = body;
        const alert = this.alertManager.resolveAlert(alertId, user, comment);
        if (!alert) {
            return { success: false, message: 'Alert not found' };
        }
        return { success: true, alert };
    }
    getAlertRules() {
        return this.alertManager.getAlertRules();
    }
    addAlertRule(rule) {
        const alertRule = this.alertManager.addAlertRule(rule);
        return { success: true, rule: alertRule };
    }
    toggleAlertRule(ruleId, body) {
        const { enabled } = body;
        const rule = this.alertManager.toggleAlertRule(ruleId, enabled);
        if (!rule) {
            return { success: false, message: 'Alert rule not found' };
        }
        return { success: true, rule };
    }
    async getDashboardData() {
        const [systemMetrics, appMetrics, healthStatus, alertSummary, performanceProfile] = await Promise.all([
            this.metricsCollector.getSystemMetrics(),
            this.metricsCollector.getApplicationMetrics(),
            this.healthCheck.getSimpleHealthStatus(),
            this.alertManager.getAlertSummary(),
            this.performanceProfiler.getPerformanceSnapshot()
        ]);
        return {
            system: systemMetrics,
            application: appMetrics,
            health: healthStatus,
            alerts: alertSummary,
            performance: performanceProfile,
            timestamp: new Date()
        };
    }
    async getHistoricalMetrics(metric, period = '1h', interval = '1m') {
        const now = Date.now();
        const intervals = this.calculateIntervals(period, interval);
        const data = intervals.map((timestamp, index) => ({
            timestamp: new Date(timestamp),
            value: Math.random() * 100 + Math.sin(index * 0.1) * 20 + 50
        }));
        return {
            metric,
            period,
            interval,
            data,
            summary: {
                min: Math.min(...data.map(d => d.value)),
                max: Math.max(...data.map(d => d.value)),
                avg: data.reduce((sum, d) => sum + d.value, 0) / data.length,
                latest: data[data.length - 1]?.value || 0
            }
        };
    }
    calculateIntervals(period, interval) {
        const now = Date.now();
        const periodMs = this.parsePeriod(period);
        const intervalMs = this.parseInterval(interval);
        const intervals = [];
        const start = now - periodMs;
        for (let timestamp = start; timestamp <= now; timestamp += intervalMs) {
            intervals.push(timestamp);
        }
        return intervals;
    }
    parsePeriod(period) {
        const match = period.match(/^(\d+)([smhd])$/);
        if (!match)
            return 60 * 60 * 1000;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 60 * 60 * 1000;
        }
    }
    parseInterval(interval) {
        const match = interval.match(/^(\d+)([sm])$/);
        if (!match)
            return 60 * 1000;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            default: return 60 * 1000;
        }
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('health/simple'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSimpleHealth", null);
__decorate([
    (0, common_1.Get)('metrics/system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/application'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getApplicationMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/custom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCustomMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/prometheus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPrometheusMetrics", null);
__decorate([
    (0, common_1.Post)('metrics/custom'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "recordCustomMetric", null);
__decorate([
    (0, common_1.Get)('performance/profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceProfile", null);
__decorate([
    (0, common_1.Post)('performance/profile/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "startProfiling", null);
__decorate([
    (0, common_1.Post)('performance/profile/stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "stopProfiling", null);
__decorate([
    (0, common_1.Get)('performance/recommendations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceRecommendations", null);
__decorate([
    (0, common_1.Get)('performance/bottlenecks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "analyzeBottlenecks", null);
__decorate([
    (0, common_1.Get)('alerts/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getAlertSummary", null);
__decorate([
    (0, common_1.Get)('alerts/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getActiveAlerts", null);
__decorate([
    (0, common_1.Post)('alerts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Patch)('alerts/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Patch)('alerts/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "resolveAlert", null);
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
], MonitoringController.prototype, "addAlertRule", null);
__decorate([
    (0, common_1.Patch)('alerts/rules/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "toggleAlertRule", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('metrics/historical'),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('interval')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHistoricalMetrics", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)('monitoring'),
    __metadata("design:paramtypes", [metrics_collector_service_1.MetricsCollectorService,
        health_check_service_1.HealthCheckService,
        performance_profiler_service_1.PerformanceProfilerService,
        alert_manager_service_1.AlertManagerService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map