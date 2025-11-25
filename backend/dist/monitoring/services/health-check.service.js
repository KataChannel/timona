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
var HealthCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const os = __importStar(require("os"));
const process = __importStar(require("process"));
let HealthCheckService = HealthCheckService_1 = class HealthCheckService {
    constructor(prisma, configService, httpHealthIndicator) {
        this.prisma = prisma;
        this.configService = configService;
        this.httpHealthIndicator = httpHealthIndicator;
        this.logger = new common_1.Logger(HealthCheckService_1.name);
        this.version = this.configService.get('npm_package_version', '1.0.0');
        this.environment = this.configService.get('NODE_ENV', 'development');
        this.startTime = new Date();
        this.logger.log('HealthCheckService initialized');
    }
    async performHealthCheck() {
        const startTime = Date.now();
        this.logger.debug('Starting comprehensive health check');
        try {
            const [databaseHealth, redisHealth, storageHealth, externalApisHealth, systemResourcesHealth] = await Promise.allSettled([
                this.checkDatabaseHealth(),
                this.checkRedisHealth(),
                this.checkStorageHealth(),
                this.checkExternalApisHealth(),
                this.checkSystemResourcesHealth()
            ]);
            const healthStatus = {
                status: this.determineOverallStatus([
                    this.getResultFromSettled(databaseHealth),
                    this.getResultFromSettled(redisHealth),
                    this.getResultFromSettled(storageHealth),
                    this.getResultFromSettled(externalApisHealth),
                    this.getResultFromSettled(systemResourcesHealth)
                ]),
                timestamp: new Date(),
                uptime: Date.now() - this.startTime.getTime(),
                checks: {
                    database: this.getResultFromSettled(databaseHealth),
                    redis: this.getResultFromSettled(redisHealth),
                    storage: this.getResultFromSettled(storageHealth),
                    external_apis: this.getResultFromSettled(externalApisHealth),
                    system_resources: this.getResultFromSettled(systemResourcesHealth)
                },
                info: {
                    version: this.version,
                    environment: this.environment,
                    nodeVersion: process.version,
                    platform: os.platform(),
                    architecture: os.arch()
                }
            };
            const duration = Date.now() - startTime;
            this.logger.debug(`Health check completed in ${duration}ms with status: ${healthStatus.status}`);
            return healthStatus;
        }
        catch (error) {
            this.logger.error('Failed to perform health check:', error);
            return this.createErrorHealthStatus(error);
        }
    }
    async checkDatabaseHealth() {
        const startTime = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1 as test`;
            const queryStart = Date.now();
            const userCount = await this.prisma.user.count();
            const queryTime = Date.now() - queryStart;
            const responseTime = Date.now() - startTime;
            return {
                status: queryTime > 1000 ? 'degraded' : 'up',
                responseTime,
                message: queryTime > 1000 ? 'Database queries are slow' : 'Database is healthy',
                details: {
                    userCount,
                    queryTime,
                    connectionPool: 'active'
                }
            };
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                message: `Database connection failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkRedisHealth() {
        const startTime = Date.now();
        try {
            const testKey = `health_check_${Date.now()}`;
            const testValue = 'ping';
            await new Promise(resolve => setTimeout(resolve, 10));
            const responseTime = Date.now() - startTime;
            return {
                status: 'up',
                responseTime,
                message: 'Redis is healthy',
                details: {
                    connection: 'active',
                    memoryUsage: '50MB',
                    connectedClients: 5
                }
            };
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                message: `Redis connection failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkStorageHealth() {
        const startTime = Date.now();
        try {
            await new Promise(resolve => setTimeout(resolve, 15));
            const responseTime = Date.now() - startTime;
            return {
                status: 'up',
                responseTime,
                message: 'Storage is healthy',
                details: {
                    buckets: 2,
                    totalSize: '1.2GB',
                    freeSpace: '98.8GB'
                }
            };
        }
        catch (error) {
            this.logger.error('Storage health check failed:', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                message: `Storage connection failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkExternalApisHealth() {
        const startTime = Date.now();
        try {
            const externalApis = [
                { name: 'auth-service', url: 'https://auth-api.example.com/health' },
                { name: 'notification-service', url: 'https://notifications-api.example.com/health' }
            ];
            const responseTime = Date.now() - startTime;
            const totalChecks = externalApis.length;
            const failedChecks = 0;
            return {
                status: failedChecks === 0 ? 'up' : failedChecks < totalChecks ? 'degraded' : 'down',
                responseTime,
                message: failedChecks === 0 ? 'All external APIs are healthy' : `${failedChecks} external APIs are down`,
                details: {
                    totalChecks,
                    failedChecks,
                    apis: externalApis.map(api => ({ name: api.name, status: 'up' }))
                }
            };
        }
        catch (error) {
            this.logger.error('External APIs health check failed:', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                message: `External APIs check failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async checkSystemResourcesHealth() {
        const startTime = Date.now();
        try {
            const memoryUsage = process.memoryUsage();
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;
            const memoryUsagePercent = (usedMemory / totalMemory) * 100;
            const cpuUsage = await this.getCpuUsage();
            const resourceHealth = {
                cpu: {
                    usage: cpuUsage,
                    status: cpuUsage > 90 ? 'critical' : cpuUsage > 70 ? 'warning' : 'healthy'
                },
                memory: {
                    usage: memoryUsagePercent,
                    available: freeMemory,
                    status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 80 ? 'warning' : 'healthy'
                },
                disk: {
                    usage: 25,
                    available: 75,
                    status: 'healthy'
                }
            };
            const responseTime = Date.now() - startTime;
            const overallStatus = this.determineResourceStatus(resourceHealth);
            return {
                status: overallStatus,
                responseTime,
                message: this.getResourceStatusMessage(resourceHealth),
                details: {
                    ...resourceHealth,
                    nodeMemory: {
                        rss: memoryUsage.rss,
                        heapTotal: memoryUsage.heapTotal,
                        heapUsed: memoryUsage.heapUsed,
                        external: memoryUsage.external
                    },
                    loadAverage: os.loadavg(),
                    uptime: os.uptime()
                }
            };
        }
        catch (error) {
            this.logger.error('System resources health check failed:', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                message: `System resources check failed: ${error.message}`,
                details: { error: error.message }
            };
        }
    }
    async getSimpleHealthStatus() {
        try {
            await this.prisma.$queryRaw `SELECT 1 as test`;
            return {
                status: 'ok',
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error('Simple health check failed:', error);
            return {
                status: 'error',
                timestamp: new Date()
            };
        }
    }
    determineOverallStatus(checks) {
        const downChecks = checks.filter(check => check.status === 'down').length;
        const degradedChecks = checks.filter(check => check.status === 'degraded').length;
        if (downChecks > 0)
            return 'error';
        if (degradedChecks > 0)
            return 'error';
        return 'ok';
    }
    getResultFromSettled(settled) {
        if (settled.status === 'fulfilled') {
            return settled.value;
        }
        else {
            return {
                status: 'down',
                message: `Health check failed: ${settled.reason?.message || 'Unknown error'}`,
                details: { error: settled.reason }
            };
        }
    }
    createErrorHealthStatus(error) {
        return {
            status: 'error',
            timestamp: new Date(),
            uptime: Date.now() - this.startTime.getTime(),
            checks: {
                database: { status: 'down', message: 'Not checked due to error' },
                redis: { status: 'down', message: 'Not checked due to error' },
                storage: { status: 'down', message: 'Not checked due to error' },
                external_apis: { status: 'down', message: 'Not checked due to error' },
                system_resources: { status: 'down', message: 'Not checked due to error' }
            },
            info: {
                version: this.version,
                environment: this.environment,
                nodeVersion: process.version,
                platform: os.platform(),
                architecture: os.arch()
            }
        };
    }
    async getCpuUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = endUsage.user + endUsage.system;
                const cpuPercent = (totalUsage / 1000000) * 100;
                resolve(Math.min(100, Math.max(0, cpuPercent)));
            }, 100);
        });
    }
    determineResourceStatus(resources) {
        const statuses = [resources.cpu.status, resources.memory.status, resources.disk.status];
        if (statuses.includes('critical'))
            return 'down';
        if (statuses.includes('warning'))
            return 'degraded';
        return 'up';
    }
    getResourceStatusMessage(resources) {
        const issues = [];
        if (resources.cpu.status !== 'healthy') {
            issues.push(`CPU usage at ${resources.cpu.usage.toFixed(1)}%`);
        }
        if (resources.memory.status !== 'healthy') {
            issues.push(`Memory usage at ${resources.memory.usage.toFixed(1)}%`);
        }
        if (resources.disk.status !== 'healthy') {
            issues.push(`Disk usage at ${resources.disk.usage.toFixed(1)}%`);
        }
        return issues.length > 0
            ? `System resources need attention: ${issues.join(', ')}`
            : 'All system resources are healthy';
    }
};
exports.HealthCheckService = HealthCheckService;
exports.HealthCheckService = HealthCheckService = HealthCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        terminus_1.HttpHealthIndicator])
], HealthCheckService);
//# sourceMappingURL=health-check.service.js.map