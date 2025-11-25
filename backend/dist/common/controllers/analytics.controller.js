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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_dashboard_service_1 = require("../services/analytics-dashboard.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getDashboardData() {
        return this.analyticsService.getDashboardData();
    }
    async getWidgetData(widgetId, timeRange) {
        return this.analyticsService.getWidgetData(widgetId, timeRange);
    }
    getDashboards() {
        return this.analyticsService.getDashboards();
    }
    getDashboard(id) {
        const dashboard = this.analyticsService.getDashboard(id);
        if (!dashboard) {
            throw new Error('Dashboard not found');
        }
        return dashboard;
    }
    createDashboard(dashboard) {
        const id = this.analyticsService.createDashboard(dashboard);
        return { id, message: 'Dashboard created successfully' };
    }
    updateDashboard(id, updates) {
        const success = this.analyticsService.updateDashboard(id, updates);
        return {
            success,
            message: success ? 'Dashboard updated successfully' : 'Dashboard not found'
        };
    }
    deleteDashboard(id) {
        const success = this.analyticsService.deleteDashboard(id);
        return {
            success,
            message: success ? 'Dashboard deleted successfully' : 'Dashboard not found'
        };
    }
    async getPerformanceInsights() {
        return this.analyticsService.getPerformanceInsights();
    }
    async generateReport(timeRange = '24h') {
        return this.analyticsService.generateReport(timeRange);
    }
    async getMetricsSummary() {
        const dashboardData = await this.analyticsService.getDashboardData();
        return {
            timestamp: Date.now(),
            summary: dashboardData.summary,
            keyMetrics: dashboardData.currentMetrics.metrics,
            trends: dashboardData.currentMetrics.trends,
            activeAlerts: dashboardData.alerts.length
        };
    }
    async getHistoricalMetrics(timeRange = '24h', metrics) {
        const dashboardData = await this.analyticsService.getDashboardData();
        if (metrics) {
            const requestedMetrics = metrics.split(',');
            const filteredData = dashboardData.historicalData.map(data => {
                const filtered = { timestamp: data.timestamp };
                requestedMetrics.forEach(metric => {
                    const keys = metric.split('.');
                    let source = data.metrics;
                    let target = filtered;
                    keys.forEach((key, index) => {
                        if (index === keys.length - 1) {
                            target[key] = source?.[key];
                        }
                        else {
                            if (!target[key])
                                target[key] = {};
                            target = target[key];
                            source = source?.[key];
                        }
                    });
                });
                return filtered;
            });
            return filteredData;
        }
        return dashboardData.historicalData;
    }
    async getSystemHealth() {
        const dashboardData = await this.analyticsService.getDashboardData();
        const current = dashboardData.currentMetrics;
        const healthScore = this.calculateHealthScore(current);
        const status = this.getHealthStatus(healthScore);
        return {
            status,
            score: healthScore,
            timestamp: current.timestamp,
            components: {
                performance: {
                    status: current.metrics.performance.responseTime < 1000 ? 'healthy' : 'warning',
                    responseTime: current.metrics.performance.responseTime,
                    errorRate: current.metrics.performance.errorRate
                },
                cache: {
                    status: current.metrics.cache.hitRate > 70 ? 'healthy' : 'warning',
                    hitRate: current.metrics.cache.hitRate,
                    operations: current.metrics.cache.operations
                },
                subscriptions: {
                    status: 'healthy',
                    activeConnections: current.metrics.subscriptions.activeConnections,
                    eventsPerSecond: current.metrics.subscriptions.eventsPerSecond
                },
                mobile: {
                    status: current.metrics.mobile.optimizationRate > 60 ? 'healthy' : 'info',
                    trafficPercentage: current.metrics.mobile.mobileTraffic,
                    optimizationRate: current.metrics.mobile.optimizationRate
                }
            },
            alerts: dashboardData.alerts.slice(0, 5),
            recommendations: dashboardData.insights.slice(0, 3)
        };
    }
    getAnalyticsConfig() {
        return {
            refreshRates: [1000, 5000, 10000, 30000, 60000],
            timeRanges: ['1h', '6h', '24h', '7d', '30d'],
            chartTypes: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'],
            widgetTypes: ['metric', 'chart', 'list', 'gauge', 'progress', 'heatmap'],
            thresholds: {
                responseTime: { warning: 500, critical: 1000 },
                errorRate: { warning: 2, critical: 5 },
                cacheHitRate: { warning: 70, critical: 50 },
                memoryUsage: { warning: 512, critical: 768 }
            }
        };
    }
    async exportAnalytics(format = 'json', timeRange = '24h') {
        const report = await this.analyticsService.generateReport(timeRange);
        if (format === 'csv') {
            return {
                contentType: 'text/csv',
                filename: `rausachcore-analytics-${timeRange}-${Date.now()}.csv`,
                data: this.convertToCSV(report)
            };
        }
        return {
            contentType: 'application/json',
            filename: `rausachcore-analytics-${timeRange}-${Date.now()}.json`,
            data: report
        };
    }
    async getPerformanceComparison(period1 = '24h', period2 = '7d') {
        const [report1, report2] = await Promise.all([
            this.analyticsService.generateReport(period1),
            this.analyticsService.generateReport(period2)
        ]);
        return {
            period1: {
                period: period1,
                data: report1
            },
            period2: {
                period: period2,
                data: report2
            },
            comparison: {
                responseTime: {
                    change: this.calculateChange(report1.summary.averageResponseTime, report2.summary.averageResponseTime),
                    trend: report1.summary.averageResponseTime < report2.summary.averageResponseTime ? 'improved' : 'degraded'
                },
                errorRate: {
                    change: this.calculateChange(report1.summary.errorRate, report2.summary.errorRate),
                    trend: report1.summary.errorRate < report2.summary.errorRate ? 'improved' : 'degraded'
                },
                cacheHitRate: {
                    change: this.calculateChange(report1.performance.cacheHitRate, report2.performance.cacheHitRate),
                    trend: report1.performance.cacheHitRate > report2.performance.cacheHitRate ? 'improved' : 'degraded'
                }
            }
        };
    }
    calculateHealthScore(metrics) {
        let score = 100;
        if (metrics.metrics.performance.responseTime > 500)
            score -= 15;
        if (metrics.metrics.performance.responseTime > 1000)
            score -= 25;
        if (metrics.metrics.performance.errorRate > 1)
            score -= 10;
        if (metrics.metrics.performance.errorRate > 5)
            score -= 20;
        if (metrics.metrics.cache.hitRate < 80)
            score -= 10;
        if (metrics.metrics.cache.hitRate < 60)
            score -= 20;
        if (metrics.metrics.system.memoryUsage > 512)
            score -= 10;
        if (metrics.metrics.system.memoryUsage > 768)
            score -= 20;
        return Math.max(0, Math.min(100, score));
    }
    getHealthStatus(score) {
        if (score >= 80)
            return 'healthy';
        if (score >= 60)
            return 'warning';
        return 'critical';
    }
    convertToCSV(report) {
        const headers = ['Metric', 'Value', 'Unit'];
        const rows = [
            ['Average Response Time', report.summary.averageResponseTime, 'ms'],
            ['Error Rate', report.summary.errorRate, '%'],
            ['Cache Hit Rate', report.performance.cacheHitRate, '%'],
            ['Uptime', report.availability.uptime, '%'],
            ['Total Requests', report.summary.totalRequests, 'count']
        ];
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        return csvContent;
    }
    calculateChange(current, previous) {
        if (previous === 0)
            return 0;
        return ((current - previous) / previous) * 100;
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('widgets/:widgetId/data'),
    __param(0, (0, common_1.Param)('widgetId')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getWidgetData", null);
__decorate([
    (0, common_1.Get)('dashboards'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDashboards", null);
__decorate([
    (0, common_1.Get)('dashboards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('dashboards'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "createDashboard", null);
__decorate([
    (0, common_1.Put)('dashboards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "updateDashboard", null);
__decorate([
    (0, common_1.Delete)('dashboards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "deleteDashboard", null);
__decorate([
    (0, common_1.Get)('insights'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPerformanceInsights", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('metrics/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMetricsSummary", null);
__decorate([
    (0, common_1.Get)('metrics/historical'),
    __param(0, (0, common_1.Query)('timeRange')),
    __param(1, (0, common_1.Query)('metrics')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getHistoricalMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAnalyticsConfig", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "exportAnalytics", null);
__decorate([
    (0, common_1.Get)('compare'),
    __param(0, (0, common_1.Query)('period1')),
    __param(1, (0, common_1.Query)('period2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPerformanceComparison", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_dashboard_service_1.AnalyticsDashboardService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map