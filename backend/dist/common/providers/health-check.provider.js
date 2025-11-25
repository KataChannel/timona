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
exports.HealthCheckProvider = void 0;
const common_1 = require("@nestjs/common");
const advanced_cache_service_1 = require("../services/advanced-cache.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const real_time_monitoring_service_1 = require("../services/real-time-monitoring.service");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
let HealthCheckProvider = class HealthCheckProvider {
    constructor(cacheService, prismaService, monitoringService, performanceService) {
        this.cacheService = cacheService;
        this.prismaService = prismaService;
        this.monitoringService = monitoringService;
        this.performanceService = performanceService;
    }
    async performHealthCheck() {
        const timestamp = Date.now();
        const checks = {};
        const [databaseCheck, cacheCheck, memoryCheck, performanceCheck, monitoringCheck] = await Promise.allSettled([
            this.checkDatabase(),
            this.checkCache(),
            this.checkMemory(),
            this.checkPerformance(),
            this.checkMonitoring()
        ]);
        this.processCheckResult(checks, 'database', databaseCheck);
        this.processCheckResult(checks, 'cache', cacheCheck);
        this.processCheckResult(checks, 'memory', memoryCheck);
        this.processCheckResult(checks, 'performance', performanceCheck);
        this.processCheckResult(checks, 'monitoring', monitoringCheck);
        const summary = this.calculateSummary(checks);
        const overallStatus = this.determineOverallStatus(summary);
        return {
            status: overallStatus,
            timestamp,
            checks,
            summary
        };
    }
    async checkDatabase() {
        const startTime = Date.now();
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            const latency = Date.now() - startTime;
            const taskCount = await this.prismaService.task.count();
            const totalLatency = Date.now() - startTime;
            if (totalLatency > 1000) {
                return {
                    status: 'warn',
                    latency: totalLatency,
                    message: 'Database response time is slow',
                    details: { taskCount, queryLatency: totalLatency }
                };
            }
            return {
                status: 'pass',
                latency: totalLatency,
                details: { taskCount, connected: true }
            };
        }
        catch (error) {
            return {
                status: 'fail',
                latency: Date.now() - startTime,
                message: `Database connection failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkCache() {
        const startTime = Date.now();
        try {
            const testKey = `health-check-${Date.now()}`;
            const testValue = { timestamp: Date.now(), test: true };
            await this.cacheService.set(testKey, testValue, { ttl: 30000 });
            const retrieved = await this.cacheService.get(testKey);
            await this.cacheService.delete(testKey);
            const latency = Date.now() - startTime;
            if (!retrieved || retrieved.test !== testValue.test) {
                return {
                    status: 'fail',
                    latency,
                    message: 'Cache read/write test failed',
                    details: { testKey, expected: testValue, actual: retrieved }
                };
            }
            const stats = await this.cacheService.getStatistics();
            const hitRate = (stats.hits / (stats.hits + stats.misses)) * 100 || 0;
            if (hitRate < 50) {
                return {
                    status: 'warn',
                    latency,
                    message: 'Cache hit rate is low',
                    details: { hitRate, ...stats }
                };
            }
            return {
                status: 'pass',
                latency,
                details: { hitRate, ...stats }
            };
        }
        catch (error) {
            return {
                status: 'fail',
                latency: Date.now() - startTime,
                message: `Cache system error: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkMemory() {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
        const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
        const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
        const details = {
            heapUsedMB: Math.round(heapUsedMB * 100) / 100,
            heapTotalMB: Math.round(heapTotalMB * 100) / 100,
            heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
            rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
            external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
        };
        if (heapUsedMB > 1024) {
            return {
                status: 'fail',
                message: 'Memory usage is critically high',
                details
            };
        }
        if (heapUsedMB > 512) {
            return {
                status: 'warn',
                message: 'Memory usage is high',
                details
            };
        }
        return {
            status: 'pass',
            details
        };
    }
    async checkPerformance() {
        try {
            const performanceStats = this.performanceService.getPerformanceStats();
            const realTimeMetrics = this.performanceService.getRealTimeMetrics();
            const details = {
                averageResponseTime: realTimeMetrics.averageResponseTime,
                requestsPerSecond: realTimeMetrics.requestsPerSecond,
                errorRate: realTimeMetrics.errorRate,
                cacheHitRate: realTimeMetrics.cacheHitRate,
                totalQueries: performanceStats.queryStats.totalQueries
            };
            if (realTimeMetrics.errorRate > 10) {
                return {
                    status: 'fail',
                    message: 'Error rate is critically high',
                    details
                };
            }
            if (realTimeMetrics.averageResponseTime > 2000) {
                return {
                    status: 'fail',
                    message: 'Response time is critically slow',
                    details
                };
            }
            if (realTimeMetrics.errorRate > 5 || realTimeMetrics.averageResponseTime > 1000) {
                return {
                    status: 'warn',
                    message: 'Performance metrics are degraded',
                    details
                };
            }
            return {
                status: 'pass',
                details
            };
        }
        catch (error) {
            return {
                status: 'fail',
                message: `Performance check failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkMonitoring() {
        try {
            const latestMetrics = this.monitoringService.getLatestMetrics();
            const recentAlerts = this.monitoringService.getRecentAlerts();
            if (!latestMetrics) {
                return {
                    status: 'warn',
                    message: 'No recent metrics available',
                    details: { lastUpdate: 'never' }
                };
            }
            const metricsAge = Date.now() - latestMetrics.timestamp;
            const details = {
                lastUpdate: new Date(latestMetrics.timestamp).toISOString(),
                metricsAge,
                recentAlerts: recentAlerts.length,
                systemUptime: latestMetrics.system.uptime
            };
            if (metricsAge > 300000) {
                return {
                    status: 'warn',
                    message: 'Metrics data is stale',
                    details
                };
            }
            const criticalAlerts = recentAlerts.filter(alert => alert.ruleName.toLowerCase().includes('critical') ||
                alert.ruleName.toLowerCase().includes('high'));
            if (criticalAlerts.length > 0) {
                return {
                    status: 'warn',
                    message: `${criticalAlerts.length} critical alerts active`,
                    details: { ...details, criticalAlerts: criticalAlerts.length }
                };
            }
            return {
                status: 'pass',
                details
            };
        }
        catch (error) {
            return {
                status: 'fail',
                message: `Monitoring check failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    processCheckResult(checks, checkName, result) {
        if (result.status === 'fulfilled') {
            checks[checkName] = result.value;
        }
        else {
            checks[checkName] = {
                status: 'fail',
                message: `Health check failed: ${result.reason?.message || 'Unknown error'}`,
                details: { error: result.reason }
            };
        }
    }
    calculateSummary(checks) {
        const total = Object.keys(checks).length;
        let passed = 0;
        let failed = 0;
        let warnings = 0;
        Object.values(checks).forEach(check => {
            switch (check.status) {
                case 'pass':
                    passed++;
                    break;
                case 'fail':
                    failed++;
                    break;
                case 'warn':
                    warnings++;
                    break;
            }
        });
        return { total, passed, failed, warnings };
    }
    determineOverallStatus(summary) {
        if (summary.failed > 0) {
            return 'unhealthy';
        }
        if (summary.warnings > 0) {
            return 'degraded';
        }
        return 'healthy';
    }
    async getQuickHealthStatus() {
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            const memoryUsage = process.memoryUsage();
            const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
            if (heapUsedMB > 1024) {
                return { status: 'unhealthy', timestamp: Date.now() };
            }
            return { status: 'healthy', timestamp: Date.now() };
        }
        catch (error) {
            return { status: 'unhealthy', timestamp: Date.now() };
        }
    }
    async getReadinessStatus() {
        try {
            const [dbReady, cacheReady] = await Promise.all([
                this.isDatabaseReady(),
                this.isCacheReady()
            ]);
            const ready = dbReady && cacheReady;
            return {
                ready,
                timestamp: Date.now(),
                details: {
                    database: dbReady,
                    cache: cacheReady
                }
            };
        }
        catch (error) {
            return {
                ready: false,
                timestamp: Date.now(),
                details: { error: error.message }
            };
        }
    }
    async isDatabaseReady() {
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    async isCacheReady() {
        try {
            const stats = await this.cacheService.getStatistics();
            return stats !== null;
        }
        catch {
            return false;
        }
    }
};
exports.HealthCheckProvider = HealthCheckProvider;
exports.HealthCheckProvider = HealthCheckProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService,
        prisma_service_1.PrismaService,
        real_time_monitoring_service_1.RealTimeMonitoringService,
        performance_metrics_service_1.PerformanceMetricsService])
], HealthCheckProvider);
//# sourceMappingURL=health-check.provider.js.map