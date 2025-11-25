import { AdvancedCacheService } from '../services/advanced-cache.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealTimeMonitoringService } from '../services/real-time-monitoring.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: number;
    checks: {
        [key: string]: {
            status: 'pass' | 'fail' | 'warn';
            latency?: number;
            message?: string;
            details?: any;
        };
    };
    summary: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
    };
}
export declare class HealthCheckProvider {
    private readonly cacheService;
    private readonly prismaService;
    private readonly monitoringService;
    private readonly performanceService;
    constructor(cacheService: AdvancedCacheService, prismaService: PrismaService, monitoringService: RealTimeMonitoringService, performanceService: PerformanceMetricsService);
    performHealthCheck(): Promise<HealthCheckResult>;
    private checkDatabase;
    private checkCache;
    private checkMemory;
    private checkPerformance;
    private checkMonitoring;
    private processCheckResult;
    private calculateSummary;
    private determineOverallStatus;
    getQuickHealthStatus(): Promise<{
        status: string;
        timestamp: number;
    }>;
    getReadinessStatus(): Promise<{
        ready: boolean;
        timestamp: number;
        details?: any;
    }>;
    private isDatabaseReady;
    private isCacheReady;
}
