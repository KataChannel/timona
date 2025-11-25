import { RealTimeMonitoringService, AlertRule } from '../services/real-time-monitoring.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly performanceMetricsService;
    constructor(monitoringService: RealTimeMonitoringService, performanceMetricsService: PerformanceMetricsService);
    getRealTimeMetrics(): import("../services/real-time-monitoring.service").RealTimeMetricsData;
    getDashboardData(): Promise<{
        realTimeMetrics: import("../services/real-time-monitoring.service").RealTimeMetricsData;
        performanceStats: any;
        queryInsights: any;
        alertRules: AlertRule[];
        recentAlerts: any[];
    }>;
    getPerformanceStats(): {
        counters: {
            [key: string]: number;
        };
        averageResponseTimes: {
            [key: string]: number;
        };
        percentiles: {
            [key: string]: {
                p50: number;
                p95: number;
                p99: number;
            };
        };
        queryStats: {
            totalQueries: number;
            averageComplexity: number;
            cacheHitRate: number;
            slowestQueries: import("../services/performance-metrics.service").QueryPerformanceData[];
        };
        systemMetrics: {
            memoryUsage: NodeJS.MemoryUsage;
            uptime: number;
        };
    };
    getQueryInsights(): {
        slowestQueries: import("../services/performance-metrics.service").QueryPerformanceData[];
        mostFrequentQueries: {
            queryHash: string;
            count: number;
            avgDuration: number;
        }[];
        cacheEfficiency: {
            operation: string;
            hitRate: number;
        }[];
        complexityAnalysis: {
            high: number;
            medium: number;
            low: number;
        };
    };
    getHistoricalMetrics(range?: '1h' | '6h' | '24h' | '7d'): Promise<{
        timestamps: number[];
        responseTime: number[];
        requestsPerSecond: number[];
        cacheHitRate: number[];
        errorRate: number[];
        memoryUsage: number[];
    }>;
    exportPrometheusMetrics(): {
        contentType: string;
        data: string;
    };
    getAlertRules(): AlertRule[];
    createAlertRule(rule: Omit<AlertRule, 'id'>): {
        id: string;
        message: string;
    };
    updateAlertRule(id: string, updates: Partial<AlertRule>): {
        success: boolean;
        message: string;
    };
    deleteAlertRule(id: string): {
        success: boolean;
        message: string;
    };
    getRecentAlerts(): {
        ruleId: string;
        ruleName: string;
        value: number;
        threshold: number;
        timestamp: number;
        resolved?: number;
    }[];
    getSystemHealth(): Promise<{
        status: string;
        message: string;
        issues?: undefined;
        timestamp?: undefined;
        uptime?: undefined;
        metrics?: undefined;
    } | {
        status: string;
        issues: string[];
        timestamp: number;
        uptime: number;
        metrics: {
            responseTime: number;
            errorRate: number;
            cacheHitRate: number;
            memoryUsageMB: number;
            activeConnections: number;
            requestsPerSecond: number;
        };
        message?: undefined;
    }>;
    triggerMetricsCollection(): Promise<{
        message: string;
    }>;
}
