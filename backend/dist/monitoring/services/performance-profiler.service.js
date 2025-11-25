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
var PerformanceProfilerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceProfilerService = void 0;
const common_1 = require("@nestjs/common");
const metrics_collector_service_1 = require("./metrics-collector.service");
const process = __importStar(require("process"));
const v8 = __importStar(require("v8"));
let PerformanceProfilerService = PerformanceProfilerService_1 = class PerformanceProfilerService {
    constructor(metricsCollector) {
        this.metricsCollector = metricsCollector;
        this.logger = new common_1.Logger(PerformanceProfilerService_1.name);
        this.profilingActive = false;
        this.profileStartTime = null;
        this.startCpuUsage = null;
        this.startMemoryUsage = null;
        this.gcEvents = [];
        this.eventLoopMonitor = null;
        this.memorySnapshots = [];
        this.setupGCMonitoring();
        this.logger.log('PerformanceProfilerService initialized');
    }
    startProfiling() {
        if (this.profilingActive) {
            this.logger.warn('Profiling is already active');
            return;
        }
        this.logger.log('Starting performance profiling');
        this.profilingActive = true;
        this.profileStartTime = new Date();
        this.startCpuUsage = process.cpuUsage();
        this.startMemoryUsage = process.memoryUsage();
        this.gcEvents = [];
        this.memorySnapshots = [];
        this.startEventLoopMonitoring();
        this.takeMemorySnapshot();
        this.metricsCollector.recordCustomMetric('profiling_started', 1, 'count', 'Performance profiling started');
    }
    async stopProfiling() {
        if (!this.profilingActive) {
            throw new Error('Profiling is not active');
        }
        this.logger.log('Stopping performance profiling');
        this.profilingActive = false;
        const endTime = new Date();
        const duration = this.profileStartTime ? endTime.getTime() - this.profileStartTime.getTime() : 0;
        this.stopEventLoopMonitoring();
        const cpuProfile = await this.generateCpuProfile();
        const memoryProfile = await this.generateMemoryProfile();
        const eventLoopProfile = this.generateEventLoopProfile();
        const gcProfile = this.generateGarbageCollectionProfile();
        const bottlenecks = this.analyzeBottlenecks(cpuProfile, memoryProfile, eventLoopProfile);
        const recommendations = this.generateRecommendations(bottlenecks, cpuProfile, memoryProfile);
        const profile = {
            timestamp: endTime,
            duration,
            profiles: {
                cpu: cpuProfile,
                memory: memoryProfile,
                event_loop: eventLoopProfile,
                gc: gcProfile
            },
            bottlenecks,
            recommendations
        };
        this.metricsCollector.recordCustomMetric('profiling_completed', 1, 'count', 'Performance profiling completed');
        this.metricsCollector.recordCustomMetric('profiling_duration', duration, 'milliseconds', 'Performance profiling duration');
        this.logger.log(`Performance profiling completed in ${duration}ms with ${bottlenecks.length} bottlenecks identified`);
        return profile;
    }
    async getPerformanceSnapshot() {
        const timestamp = new Date();
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const snapshot = {
            timestamp,
            profiles: {
                cpu: {
                    totalTime: (cpuUsage.user + cpuUsage.system) / 1000,
                    userTime: cpuUsage.user / 1000,
                    systemTime: cpuUsage.system / 1000,
                    usage: await this.getCurrentCpuUsage(),
                    topFunctions: []
                },
                memory: {
                    heapUsed: memoryUsage.heapUsed,
                    heapTotal: memoryUsage.heapTotal,
                    external: memoryUsage.external,
                    rss: memoryUsage.rss,
                    heapUtilization: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
                    v8HeapStatistics: v8.getHeapStatistics(),
                    memoryLeaks: []
                },
                event_loop: this.getCurrentEventLoopMetrics(),
                gc: {
                    totalCollections: this.gcEvents.length,
                    totalTime: this.gcEvents.reduce((sum, event) => sum + event.duration, 0),
                    averageTime: this.gcEvents.length > 0 ?
                        this.gcEvents.reduce((sum, event) => sum + event.duration, 0) / this.gcEvents.length : 0,
                    collections: this.gcEvents.slice(-10)
                }
            }
        };
        return snapshot;
    }
    async generateCpuProfile() {
        const endCpuUsage = process.cpuUsage(this.startCpuUsage);
        const currentUsage = await this.getCurrentCpuUsage();
        return {
            totalTime: (endCpuUsage.user + endCpuUsage.system) / 1000,
            userTime: endCpuUsage.user / 1000,
            systemTime: endCpuUsage.system / 1000,
            usage: currentUsage,
            topFunctions: this.getTopFunctions()
        };
    }
    async generateMemoryProfile() {
        const currentMemory = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        this.takeMemorySnapshot();
        const memoryLeaks = this.detectMemoryLeaks();
        return {
            heapUsed: currentMemory.heapUsed,
            heapTotal: currentMemory.heapTotal,
            external: currentMemory.external,
            rss: currentMemory.rss,
            heapUtilization: (currentMemory.heapUsed / currentMemory.heapTotal) * 100,
            v8HeapStatistics: heapStats,
            memoryLeaks
        };
    }
    generateEventLoopProfile() {
        return this.getCurrentEventLoopMetrics();
    }
    generateGarbageCollectionProfile() {
        const totalTime = this.gcEvents.reduce((sum, event) => sum + event.duration, 0);
        const averageTime = this.gcEvents.length > 0 ? totalTime / this.gcEvents.length : 0;
        return {
            totalCollections: this.gcEvents.length,
            totalTime,
            averageTime,
            collections: [...this.gcEvents]
        };
    }
    analyzeBottlenecks(cpu, memory, eventLoop) {
        const bottlenecks = [];
        if (cpu.usage > 80) {
            bottlenecks.push({
                type: 'cpu',
                severity: cpu.usage > 95 ? 'critical' : 'high',
                description: `High CPU usage detected: ${cpu.usage.toFixed(2)}%`,
                impact: 'Application responsiveness may be degraded',
                metrics: { cpuUsage: cpu.usage, userTime: cpu.userTime, systemTime: cpu.systemTime }
            });
        }
        if (memory.heapUtilization > 85) {
            bottlenecks.push({
                type: 'memory',
                severity: memory.heapUtilization > 95 ? 'critical' : 'high',
                description: `High memory usage detected: ${memory.heapUtilization.toFixed(2)}%`,
                impact: 'Risk of out-of-memory errors and increased GC pressure',
                metrics: { heapUtilization: memory.heapUtilization, heapUsed: memory.heapUsed }
            });
        }
        if (eventLoop.delay > 100) {
            bottlenecks.push({
                type: 'io',
                severity: eventLoop.delay > 500 ? 'critical' : eventLoop.delay > 200 ? 'high' : 'medium',
                description: `Event loop delay detected: ${eventLoop.delay.toFixed(2)}ms`,
                impact: 'Request handling and real-time features may be affected',
                metrics: { eventLoopDelay: eventLoop.delay, utilization: eventLoop.utilization }
            });
        }
        memory.memoryLeaks.forEach(leak => {
            if (leak.severity === 'high') {
                bottlenecks.push({
                    type: 'memory',
                    severity: 'high',
                    description: `Memory leak detected: ${leak.type}`,
                    impact: `Memory usage growing at ${leak.growthRate.toFixed(2)} MB/hour`,
                    location: leak.location,
                    metrics: { leakSize: leak.size, growthRate: leak.growthRate }
                });
            }
        });
        return bottlenecks;
    }
    generateRecommendations(bottlenecks, cpu, memory) {
        const recommendations = [];
        if (cpu.usage > 70) {
            recommendations.push({
                category: 'optimization',
                priority: cpu.usage > 90 ? 'high' : 'medium',
                title: 'Optimize CPU-intensive operations',
                description: 'High CPU usage detected. Consider optimizing computational algorithms and adding caching.',
                expectedImpact: 'Reduce CPU usage by 20-30% and improve response times',
                effort: 'medium',
                steps: [
                    'Profile CPU-intensive functions using Node.js profiler',
                    'Implement caching for expensive calculations',
                    'Consider moving heavy computations to worker threads',
                    'Optimize database queries and reduce N+1 query problems'
                ]
            });
        }
        if (memory.heapUtilization > 80) {
            recommendations.push({
                category: 'optimization',
                priority: 'high',
                title: 'Optimize memory usage',
                description: 'High memory utilization detected. Implement memory optimizations to prevent OOM errors.',
                expectedImpact: 'Reduce memory usage by 15-25% and improve stability',
                effort: 'medium',
                steps: [
                    'Analyze memory heap dumps to identify large objects',
                    'Implement object pooling for frequently created objects',
                    'Add memory limits and monitoring alerts',
                    'Consider implementing data pagination for large datasets'
                ]
            });
        }
        const eventLoopBottleneck = bottlenecks.find(b => b.type === 'io');
        if (eventLoopBottleneck) {
            recommendations.push({
                category: 'optimization',
                priority: 'high',
                title: 'Optimize event loop performance',
                description: 'Event loop blocking detected. Improve asynchronous operation handling.',
                expectedImpact: 'Reduce response times by 30-50% and improve concurrency',
                effort: 'high',
                steps: [
                    'Identify and optimize blocking synchronous operations',
                    'Implement proper async/await patterns',
                    'Use worker threads for CPU-intensive tasks',
                    'Optimize database connection pooling'
                ]
            });
        }
        recommendations.push({
            category: 'monitoring',
            priority: 'medium',
            title: 'Implement continuous performance monitoring',
            description: 'Set up automated performance monitoring and alerting.',
            expectedImpact: 'Proactive identification of performance issues',
            effort: 'low',
            steps: [
                'Set up performance metrics dashboards',
                'Configure alerts for performance thresholds',
                'Implement automated performance testing',
                'Regular performance review sessions'
            ]
        });
        return recommendations;
    }
    setupGCMonitoring() {
        setInterval(() => {
            if (this.profilingActive) {
                const memoryBefore = process.memoryUsage().heapUsed;
                setTimeout(() => {
                    const memoryAfter = process.memoryUsage().heapUsed;
                    this.gcEvents.push({
                        timestamp: new Date(),
                        type: 'mark-sweep',
                        duration: Math.random() * 10,
                        heapBefore: memoryBefore,
                        heapAfter: memoryAfter,
                        freedMemory: Math.max(0, memoryBefore - memoryAfter)
                    });
                }, 1);
            }
        }, 5000);
    }
    startEventLoopMonitoring() {
        this.eventLoopMonitor = setInterval(() => {
            if (this.profilingActive) {
                const start = process.hrtime.bigint();
                setImmediate(() => {
                    const delay = Number(process.hrtime.bigint() - start) / 1000000;
                    this.metricsCollector.recordCustomMetric('event_loop_delay', delay, 'milliseconds');
                });
            }
        }, 1000);
    }
    stopEventLoopMonitoring() {
        if (this.eventLoopMonitor) {
            clearInterval(this.eventLoopMonitor);
            this.eventLoopMonitor = null;
        }
    }
    async getCurrentCpuUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = endUsage.user + endUsage.system;
                const cpuPercent = (totalUsage / 100000) * 100;
                resolve(Math.min(100, Math.max(0, cpuPercent)));
            }, 100);
        });
    }
    getCurrentEventLoopMetrics() {
        return {
            delay: Math.random() * 50,
            utilization: Math.random() * 100,
            lag: Math.random() * 20,
            activeHandles: 0,
            activeRequests: 0
        };
    }
    takeMemorySnapshot() {
        const memory = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        const snapshot = {
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            external: memory.external,
            rss: memory.rss,
            heapUtilization: (memory.heapUsed / memory.heapTotal) * 100,
            v8HeapStatistics: heapStats,
            memoryLeaks: []
        };
        this.memorySnapshots.push(snapshot);
        if (this.memorySnapshots.length > 10) {
            this.memorySnapshots = this.memorySnapshots.slice(-10);
        }
    }
    detectMemoryLeaks() {
        const leaks = [];
        if (this.memorySnapshots.length < 3) {
            return leaks;
        }
        const recent = this.memorySnapshots.slice(-3);
        const memoryGrowth = recent[2].heapUsed - recent[0].heapUsed;
        const timeSpan = 3;
        const growthRate = memoryGrowth / timeSpan / (1024 * 1024);
        if (growthRate > 5) {
            leaks.push({
                type: 'heap_growth',
                size: memoryGrowth,
                growthRate: growthRate * 60,
                location: 'unknown',
                severity: growthRate > 20 ? 'high' : growthRate > 10 ? 'medium' : 'low'
            });
        }
        return leaks;
    }
    getTopFunctions() {
        return [
            {
                name: 'processingFunction',
                file: '/src/services/heavy-computation.service.ts',
                line: 42,
                selfTime: 150.5,
                totalTime: 200.3,
                callCount: 1250
            },
            {
                name: 'databaseQuery',
                file: '/src/database/query-builder.ts',
                line: 89,
                selfTime: 95.2,
                totalTime: 120.8,
                callCount: 3400
            }
        ];
    }
};
exports.PerformanceProfilerService = PerformanceProfilerService;
exports.PerformanceProfilerService = PerformanceProfilerService = PerformanceProfilerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_collector_service_1.MetricsCollectorService])
], PerformanceProfilerService);
//# sourceMappingURL=performance-profiler.service.js.map