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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const performance_metrics_service_1 = require("./performance-metrics.service");
const advanced_cache_service_1 = require("./advanced-cache.service");
let RealTimeMonitoringService = class RealTimeMonitoringService {
    constructor(performanceMetricsService, cacheService) {
        this.performanceMetricsService = performanceMetricsService;
        this.cacheService = cacheService;
        this.isCollectingMetrics = false;
        this.latestMetrics = null;
        this.alertRules = [
            {
                id: 'high-response-time',
                name: 'High Response Time',
                metric: 'averageResponseTime',
                operator: '>',
                threshold: 1000,
                duration: 30,
                enabled: true
            },
            {
                id: 'high-error-rate',
                name: 'High Error Rate',
                metric: 'errorRate',
                operator: '>',
                threshold: 5,
                duration: 60,
                enabled: true
            },
            {
                id: 'low-cache-hit-rate',
                name: 'Low Cache Hit Rate',
                metric: 'cacheHitRate',
                operator: '<',
                threshold: 50,
                duration: 120,
                enabled: true
            },
            {
                id: 'high-memory-usage',
                name: 'High Memory Usage',
                metric: 'memoryUsage.heapUsed',
                operator: '>',
                threshold: 500 * 1024 * 1024,
                duration: 60,
                enabled: true
            }
        ];
        this.alertHistory = [];
    }
    async onModuleInit() {
        this.startMetricsCollection();
        this.startAlertMonitoring();
    }
    async onModuleDestroy() {
        this.stopMetricsCollection();
        if (this.alertsInterval) {
            clearInterval(this.alertsInterval);
        }
    }
    startMetricsCollection() {
        if (this.isCollectingMetrics)
            return;
        this.isCollectingMetrics = true;
        this.metricsInterval = setInterval(async () => {
            this.latestMetrics = await this.collectRealTimeMetrics();
        }, 5000);
    }
    stopMetricsCollection() {
        this.isCollectingMetrics = false;
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
    }
    startAlertMonitoring() {
        this.alertsInterval = setInterval(async () => {
            await this.checkAlertRules();
        }, 10000);
    }
    async collectRealTimeMetrics() {
        const performanceStats = this.performanceMetricsService.getPerformanceStats();
        const realTimeMetrics = this.performanceMetricsService.getRealTimeMetrics();
        const cacheStats = await this.cacheService.getStatistics();
        return {
            timestamp: Date.now(),
            performance: realTimeMetrics,
            system: {
                memoryUsage: performanceStats.systemMetrics.memoryUsage,
                uptime: performanceStats.systemMetrics.uptime,
                cpuUsage: process.cpuUsage()
            },
            cache: {
                hitRate: (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 || 0,
                operations: cacheStats.operations,
                size: cacheStats.totalSize,
                evictions: cacheStats.evictions
            },
            graphql: {
                queriesPerSecond: realTimeMetrics.requestsPerSecond,
                mutationsPerSecond: performanceStats.counters['graphql.mutations.total'] || 0,
                subscriptionsActive: performanceStats.counters['graphql.subscriptions.total'] || 0,
                complexityAverage: performanceStats.queryStats.averageComplexity
            }
        };
    }
    getLatestMetrics() {
        return this.latestMetrics;
    }
    async checkAlertRules() {
        if (this.alertRules.length === 0 || !this.latestMetrics)
            return;
        try {
            const now = Date.now();
            for (const rule of this.alertRules) {
                if (!rule.enabled)
                    continue;
                const value = this.extractMetricValue(this.latestMetrics, rule.metric);
                if (value === undefined)
                    continue;
                const isTriggered = this.evaluateAlertCondition(value, rule.operator, rule.threshold);
                if (isTriggered) {
                    if (!rule.lastTriggered || (now - rule.lastTriggered) > (rule.duration * 1000)) {
                        await this.triggerAlert(rule, value);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error checking alert rules:', error);
        }
    }
    extractMetricValue(metricsData, metricPath) {
        const keys = metricPath.split('.');
        let value = metricsData;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return undefined;
            }
        }
        return typeof value === 'number' ? value : undefined;
    }
    evaluateAlertCondition(value, operator, threshold) {
        switch (operator) {
            case '>': return value > threshold;
            case '<': return value < threshold;
            case '>=': return value >= threshold;
            case '<=': return value <= threshold;
            case '==': return value === threshold;
            case '!=': return value !== threshold;
            default: return false;
        }
    }
    async triggerAlert(rule, value) {
        const alert = {
            ruleId: rule.id,
            ruleName: rule.name,
            value,
            threshold: rule.threshold,
            timestamp: Date.now()
        };
        this.alertHistory.unshift(alert);
        if (this.alertHistory.length > 100) {
            this.alertHistory = this.alertHistory.slice(0, 100);
        }
        rule.lastTriggered = alert.timestamp;
        console.warn(`ALERT TRIGGERED: ${rule.name} - Value: ${value}, Threshold: ${rule.threshold}`);
    }
    getRecentAlerts() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return this.alertHistory.filter(alert => alert.timestamp > oneDayAgo);
    }
    getAlertRules() {
        return [...this.alertRules];
    }
    updateAlertRule(ruleId, updates) {
        const rule = this.alertRules.find(r => r.id === ruleId);
        if (!rule)
            return false;
        Object.assign(rule, updates);
        return true;
    }
    addAlertRule(rule) {
        const newRule = {
            ...rule,
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        this.alertRules.push(newRule);
        return newRule.id;
    }
    removeAlertRule(ruleId) {
        const index = this.alertRules.findIndex(r => r.id === ruleId);
        if (index === -1)
            return false;
        this.alertRules.splice(index, 1);
        return true;
    }
    async getDashboardData() {
        const [realTimeMetrics, performanceStats, queryInsights] = await Promise.all([
            this.collectRealTimeMetrics(),
            this.performanceMetricsService.getPerformanceStats(),
            this.performanceMetricsService.getQueryInsights()
        ]);
        return {
            realTimeMetrics,
            performanceStats,
            queryInsights,
            alertRules: this.alertRules,
            recentAlerts: this.getRecentAlerts()
        };
    }
    async getHistoricalMetrics(timeRange = '1h') {
        const now = Date.now();
        const ranges = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };
        const range = ranges[timeRange];
        const points = timeRange === '7d' ? 168 : timeRange === '24h' ? 144 : 60;
        const interval = range / points;
        const timestamps = [];
        const responseTime = [];
        const requestsPerSecond = [];
        const cacheHitRate = [];
        const errorRate = [];
        const memoryUsage = [];
        for (let i = 0; i < points; i++) {
            const timestamp = now - range + (i * interval);
            timestamps.push(timestamp);
            const timeOfDay = new Date(timestamp).getHours();
            const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 17;
            const multiplier = isBusinessHours ? 1.5 : 0.8;
            responseTime.push(Math.random() * 200 * multiplier + 100);
            requestsPerSecond.push(Math.random() * 50 * multiplier + 10);
            cacheHitRate.push(Math.random() * 30 + 70);
            errorRate.push(Math.random() * 3);
            memoryUsage.push(Math.random() * 200 + 100);
        }
        return {
            timestamps,
            responseTime,
            requestsPerSecond,
            cacheHitRate,
            errorRate,
            memoryUsage
        };
    }
};
exports.RealTimeMonitoringService = RealTimeMonitoringService;
exports.RealTimeMonitoringService = RealTimeMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService,
        advanced_cache_service_1.AdvancedCacheService])
], RealTimeMonitoringService);
//# sourceMappingURL=real-time-monitoring.service.js.map