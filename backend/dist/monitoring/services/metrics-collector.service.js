"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MetricsCollectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollectorService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const promClient = __importStar(require("prom-client"));
const os = __importStar(require("os"));
const process = __importStar(require("process"));
let MetricsCollectorService = MetricsCollectorService_1 = class MetricsCollectorService {
    constructor() {
        this.logger = new common_1.Logger(MetricsCollectorService_1.name);
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        this.lastNetworkStats = null;
        this.customMetrics = new Map();
        this.registry = new promClient.Registry();
        promClient.collectDefaultMetrics({ register: this.registry });
        this.httpRequestsTotal = new promClient.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry]
        });
        this.httpRequestDuration = new promClient.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route'],
            buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
            registers: [this.registry]
        });
        this.activeConnections = new promClient.Gauge({
            name: 'active_connections_total',
            help: 'Total number of active connections',
            labelNames: ['type'],
            registers: [this.registry]
        });
        this.databaseQueries = new promClient.Counter({
            name: 'database_queries_total',
            help: 'Total number of database queries',
            labelNames: ['operation', 'table'],
            registers: [this.registry]
        });
        this.databaseQueryDuration = new promClient.Histogram({
            name: 'database_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['operation', 'table'],
            buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
            registers: [this.registry]
        });
        this.cacheOperations = new promClient.Counter({
            name: 'cache_operations_total',
            help: 'Total number of cache operations',
            labelNames: ['operation', 'result'],
            registers: [this.registry]
        });
        this.systemCpuUsage = new promClient.Gauge({
            name: 'system_cpu_usage_percent',
            help: 'System CPU usage percentage',
            registers: [this.registry]
        });
        this.systemMemoryUsage = new promClient.Gauge({
            name: 'system_memory_usage_bytes',
            help: 'System memory usage in bytes',
            registers: [this.registry]
        });
        this.customMetricsGauge = new promClient.Gauge({
            name: 'custom_metrics',
            help: 'Custom application metrics',
            labelNames: ['metric_name', 'unit'],
            registers: [this.registry]
        });
        this.logger.log('MetricsCollectorService initialized with Prometheus metrics');
    }
    recordHttpRequest(method, route, statusCode, duration) {
        this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
        this.httpRequestDuration.observe({ method, route }, duration / 1000);
        this.requestCount++;
        this.responseTimes.push(duration);
        if (statusCode >= 400) {
            this.errorCount++;
        }
        if (this.responseTimes.length > 1000) {
            this.responseTimes = this.responseTimes.slice(-1000);
        }
    }
    recordDatabaseQuery(operation, table, duration, isError = false) {
        this.databaseQueries.inc({ operation, table });
        this.databaseQueryDuration.observe({ operation, table }, duration / 1000);
        if (isError) {
            this.databaseQueries.inc({ operation: `${operation}_error`, table });
        }
    }
    recordCacheOperation(operation, result) {
        this.cacheOperations.inc({ operation, result });
    }
    setActiveConnections(type, count) {
        this.activeConnections.set({ type }, count);
    }
    recordCustomMetric(name, value, unit = 'count', description = '', tags = {}) {
        const timestamp = new Date();
        const metricKey = `${timestamp.toISOString()}_${name}`;
        this.customMetrics.set(metricKey, {
            [name]: {
                value,
                unit,
                description,
                tags
            }
        });
        this.customMetricsGauge.set({ metric_name: name, unit }, value);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [key] of this.customMetrics) {
            const keyTimestamp = new Date(key.split('_')[0]);
            if (keyTimestamp < oneHourAgo) {
                this.customMetrics.delete(key);
            }
        }
    }
    async getSystemMetrics() {
        const cpuUsage = await this.getCpuUsage();
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        this.systemCpuUsage.set(cpuUsage);
        this.systemMemoryUsage.set(usedMemory);
        return {
            timestamp: new Date(),
            cpu: {
                usage: cpuUsage,
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            memory: {
                used: usedMemory,
                free: freeMemory,
                total: totalMemory,
                usage: (usedMemory / totalMemory) * 100
            },
            disk: await this.getDiskUsage(),
            network: await this.getNetworkStats()
        };
    }
    getApplicationMetrics() {
        const now = Date.now();
        const last5Minutes = this.responseTimes.filter(time => now - time < 5 * 60 * 1000);
        const averageTime = last5Minutes.length > 0
            ? last5Minutes.reduce((sum, time) => sum + time, 0) / last5Minutes.length
            : 0;
        const sortedTimes = [...last5Minutes].sort((a, b) => a - b);
        const p95Time = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
        const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
        return {
            timestamp: new Date(),
            requests: {
                total: this.requestCount,
                perSecond: last5Minutes.length / 300,
                errors: this.errorCount,
                errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
            },
            responses: {
                averageTime,
                p95Time,
                p99Time
            },
            database: {
                connections: 0,
                activeQueries: 0,
                slowQueries: 0,
                averageQueryTime: 0
            },
            cache: {
                hitRate: 0,
                missRate: 0,
                evictions: 0,
                memory: 0
            }
        };
    }
    getCustomMetrics() {
        return Array.from(this.customMetrics.values());
    }
    async getPrometheusMetrics() {
        return this.registry.metrics();
    }
    resetMetrics() {
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        this.customMetrics.clear();
        this.registry.resetMetrics();
        this.logger.log('All metrics reset');
    }
    async collectSystemMetrics() {
        try {
            const metrics = await this.getSystemMetrics();
            this.logger.debug(`System metrics collected: CPU ${metrics.cpu.usage.toFixed(2)}%, Memory ${metrics.memory.usage.toFixed(2)}%`);
            this.recordCustomMetric('system_cpu_usage', metrics.cpu.usage, 'percent', 'System CPU usage');
            this.recordCustomMetric('system_memory_usage', metrics.memory.usage, 'percent', 'System memory usage');
        }
        catch (error) {
            this.logger.error('Failed to collect system metrics:', error);
        }
    }
    async getCpuUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            const startTime = process.hrtime();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const endTime = process.hrtime(startTime);
                const totalTime = endTime[0] * 1000000 + endTime[1] / 1000;
                const totalUsage = endUsage.user + endUsage.system;
                const cpuPercent = (totalUsage / totalTime) * 100;
                resolve(Math.min(100, Math.max(0, cpuPercent)));
            }, 100);
        });
    }
    async getDiskUsage() {
        const total = 1024 * 1024 * 1024 * 100;
        const free = 1024 * 1024 * 1024 * 60;
        const used = total - free;
        return {
            total,
            free,
            used,
            usage: (used / total) * 100
        };
    }
    async getNetworkStats() {
        const networkInterfaces = os.networkInterfaces();
        let bytesReceived = 0;
        let bytesSent = 0;
        for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            if (interfaces && name !== 'lo') {
                bytesReceived += Math.floor(Math.random() * 1000000);
                bytesSent += Math.floor(Math.random() * 1000000);
            }
        }
        return { bytesReceived, bytesSent };
    }
};
exports.MetricsCollectorService = MetricsCollectorService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsCollectorService.prototype, "collectSystemMetrics", null);
exports.MetricsCollectorService = MetricsCollectorService = MetricsCollectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsCollectorService);
//# sourceMappingURL=metrics-collector.service.js.map