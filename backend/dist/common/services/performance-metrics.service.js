"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMetricsService = void 0;
const common_1 = require("@nestjs/common");
const perf_hooks_1 = require("perf_hooks");
let PerformanceMetricsService = class PerformanceMetricsService {
    constructor() {
        this.metrics = [];
        this.queryMetrics = [];
        this.maxMetricsInMemory = 10000;
        this.maxQueryMetrics = 5000;
        this.counters = {
            'graphql.queries.total': 0,
            'graphql.mutations.total': 0,
            'graphql.subscriptions.total': 0,
            'graphql.errors.total': 0,
            'cache.hits.total': 0,
            'cache.misses.total': 0,
            'database.queries.total': 0,
            'auth.logins.total': 0,
            'auth.failures.total': 0,
        };
        this.histograms = {
            'graphql.response_time': [],
            'database.query_time': [],
            'cache.operation_time': [],
        };
    }
    async onModuleInit() {
        setInterval(() => this.collectSystemMetrics(), 30000);
        setInterval(() => this.cleanupOldMetrics(), 300000);
    }
    recordMetric(metric) {
        this.metrics.push({
            ...metric,
            timestamp: metric.timestamp || Date.now()
        });
        if (this.metrics.length > this.maxMetricsInMemory) {
            this.metrics = this.metrics.slice(-Math.floor(this.maxMetricsInMemory * 0.8));
        }
    }
    recordQueryPerformance(data) {
        this.queryMetrics.push(data);
        this.incrementCounter('graphql.queries.total');
        if (data.cacheHit) {
            this.incrementCounter('cache.hits.total');
        }
        else {
            this.incrementCounter('cache.misses.total');
        }
        this.recordHistogram('graphql.response_time', data.duration);
        if (this.queryMetrics.length > this.maxQueryMetrics) {
            this.queryMetrics = this.queryMetrics.slice(-Math.floor(this.maxQueryMetrics * 0.8));
        }
    }
    incrementCounter(name, value = 1) {
        this.counters[name] = (this.counters[name] || 0) + value;
    }
    recordHistogram(name, value) {
        if (!this.histograms[name]) {
            this.histograms[name] = [];
        }
        this.histograms[name].push(value);
        if (this.histograms[name].length > 1000) {
            this.histograms[name] = this.histograms[name].slice(-800);
        }
    }
    startTiming(operationName) {
        const startTime = perf_hooks_1.performance.now();
        return () => {
            const duration = perf_hooks_1.performance.now() - startTime;
            this.recordMetric({
                name: `operation.${operationName}.duration`,
                value: duration,
                timestamp: Date.now(),
                unit: 'ms'
            });
            return duration;
        };
    }
    async measureAsync(operationName, operation, tags) {
        const endTiming = this.startTiming(operationName);
        try {
            const result = await operation();
            const duration = endTiming();
            this.recordMetric({
                name: `${operationName}.success`,
                value: duration,
                timestamp: Date.now(),
                tags: { ...tags, status: 'success' },
                unit: 'ms'
            });
            return result;
        }
        catch (error) {
            const duration = endTiming();
            this.recordMetric({
                name: `${operationName}.error`,
                value: duration,
                timestamp: Date.now(),
                tags: { ...tags, status: 'error', error: error.message },
                unit: 'ms'
            });
            throw error;
        }
    }
    getPerformanceStats() {
        const stats = {
            counters: { ...this.counters },
            averageResponseTimes: this.calculateAverageResponseTimes(),
            percentiles: this.calculatePercentiles(),
            queryStats: this.getQueryStats(),
            systemMetrics: {
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            }
        };
        return stats;
    }
    getRealTimeMetrics() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo);
        const recentQueries = this.queryMetrics.filter(q => q.timestamp ? q.timestamp > oneMinuteAgo : true);
        const requestsPerSecond = recentQueries.length / 60;
        const averageResponseTime = recentQueries.length > 0
            ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
            : 0;
        const cacheHits = recentQueries.filter(q => q.cacheHit).length;
        const cacheHitRate = recentQueries.length > 0
            ? (cacheHits / recentQueries.length) * 100
            : 0;
        const activeConnections = Math.floor(Math.random() * 50) + 10;
        const errorMetrics = recentMetrics.filter(m => m.name.includes('error'));
        const totalRequests = recentQueries.length;
        const errorRate = totalRequests > 0 ? (errorMetrics.length / totalRequests) * 100 : 0;
        return {
            activeConnections,
            requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
            averageResponseTime: Math.round(averageResponseTime * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100
        };
    }
    getQueryInsights() {
        const queryGroups = {};
        this.queryMetrics.forEach(query => {
            if (!queryGroups[query.queryHash]) {
                queryGroups[query.queryHash] = [];
            }
            queryGroups[query.queryHash].push(query);
        });
        const mostFrequentQueries = Object.entries(queryGroups)
            .map(([queryHash, queries]) => ({
            queryHash,
            count: queries.length,
            avgDuration: queries.reduce((sum, q) => sum + q.duration, 0) / queries.length
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const slowestQueries = [...this.queryMetrics]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        const operationGroups = {};
        this.queryMetrics.forEach(query => {
            const operation = query.operationName || 'unknown';
            if (!operationGroups[operation]) {
                operationGroups[operation] = { hits: 0, total: 0 };
            }
            operationGroups[operation].total++;
            if (query.cacheHit) {
                operationGroups[operation].hits++;
            }
        });
        const cacheEfficiency = Object.entries(operationGroups)
            .map(([operation, data]) => ({
            operation,
            hitRate: data.total > 0 ? (data.hits / data.total) * 100 : 0
        }))
            .sort((a, b) => b.hitRate - a.hitRate);
        const complexityAnalysis = this.queryMetrics
            .filter(q => q.complexity !== undefined)
            .reduce((acc, q) => {
            if (q.complexity > 100)
                acc.high++;
            else if (q.complexity > 50)
                acc.medium++;
            else
                acc.low++;
            return acc;
        }, { high: 0, medium: 0, low: 0 });
        return {
            slowestQueries,
            mostFrequentQueries,
            cacheEfficiency,
            complexityAnalysis
        };
    }
    calculateAverageResponseTimes() {
        const averages = {};
        Object.entries(this.histograms).forEach(([name, values]) => {
            if (values.length > 0) {
                averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        });
        return averages;
    }
    calculatePercentiles() {
        const percentiles = {};
        Object.entries(this.histograms).forEach(([name, values]) => {
            if (values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                const length = sorted.length;
                percentiles[name] = {
                    p50: sorted[Math.floor(length * 0.5)],
                    p95: sorted[Math.floor(length * 0.95)],
                    p99: sorted[Math.floor(length * 0.99)]
                };
            }
        });
        return percentiles;
    }
    getQueryStats() {
        const totalQueries = this.queryMetrics.length;
        const cacheHits = this.queryMetrics.filter(q => q.cacheHit).length;
        const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
        const complexities = this.queryMetrics
            .filter(q => q.complexity !== undefined)
            .map(q => q.complexity);
        const averageComplexity = complexities.length > 0
            ? complexities.reduce((sum, c) => sum + c, 0) / complexities.length
            : 0;
        const slowestQueries = [...this.queryMetrics]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5);
        return {
            totalQueries,
            averageComplexity: Math.round(averageComplexity * 100) / 100,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100,
            slowestQueries
        };
    }
    async collectSystemMetrics() {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        this.recordMetric({
            name: 'system.memory.heap_used',
            value: memoryUsage.heapUsed,
            timestamp: Date.now(),
            unit: 'bytes'
        });
        this.recordMetric({
            name: 'system.memory.heap_total',
            value: memoryUsage.heapTotal,
            timestamp: Date.now(),
            unit: 'bytes'
        });
        this.recordMetric({
            name: 'system.uptime',
            value: uptime,
            timestamp: Date.now(),
            unit: 'ms'
        });
    }
    cleanupOldMetrics() {
        const oneHourAgo = Date.now() - 3600000;
        this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
        const tenMinutesAgo = Date.now() - 600000;
        this.queryMetrics = this.queryMetrics.filter(q => q.timestamp ? q.timestamp > tenMinutesAgo : true);
    }
    exportPrometheusMetrics() {
        let output = '';
        Object.entries(this.counters).forEach(([name, value]) => {
            output += `# TYPE ${name.replace(/\./g, '_')} counter\n`;
            output += `${name.replace(/\./g, '_')} ${value}\n`;
        });
        Object.entries(this.histograms).forEach(([name, values]) => {
            if (values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                const metricName = name.replace(/\./g, '_');
                output += `# TYPE ${metricName} histogram\n`;
                output += `${metricName}_count ${values.length}\n`;
                output += `${metricName}_sum ${values.reduce((sum, val) => sum + val, 0)}\n`;
                const percentiles = [0.5, 0.9, 0.95, 0.99];
                percentiles.forEach(p => {
                    const index = Math.floor(sorted.length * p);
                    output += `${metricName}_bucket{le="${p}"} ${sorted[index] || 0}\n`;
                });
            }
        });
        return output;
    }
};
exports.PerformanceMetricsService = PerformanceMetricsService;
exports.PerformanceMetricsService = PerformanceMetricsService = __decorate([
    (0, common_1.Injectable)()
], PerformanceMetricsService);
//# sourceMappingURL=performance-metrics.service.js.map