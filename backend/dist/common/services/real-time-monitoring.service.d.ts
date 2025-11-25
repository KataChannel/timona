import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PerformanceMetricsService } from './performance-metrics.service';
import { AdvancedCacheService } from './advanced-cache.service';
export interface RealTimeMetricsData {
    timestamp: number;
    performance: {
        activeConnections: number;
        requestsPerSecond: number;
        averageResponseTime: number;
        errorRate: number;
        cacheHitRate: number;
    };
    system: {
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
        cpuUsage?: NodeJS.CpuUsage;
    };
    cache: {
        hitRate: number;
        operations: number;
        size: number;
        evictions: number;
    };
    graphql: {
        queriesPerSecond: number;
        mutationsPerSecond: number;
        subscriptionsActive: number;
        complexityAverage: number;
    };
}
export interface AlertRule {
    id: string;
    name: string;
    metric: string;
    operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
    threshold: number;
    duration: number;
    enabled: boolean;
    lastTriggered?: number;
}
export declare class RealTimeMonitoringService implements OnModuleInit, OnModuleDestroy {
    private readonly performanceMetricsService;
    private readonly cacheService;
    private metricsInterval;
    private alertsInterval;
    private isCollectingMetrics;
    private latestMetrics;
    private alertRules;
    private alertHistory;
    constructor(performanceMetricsService: PerformanceMetricsService, cacheService: AdvancedCacheService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private startMetricsCollection;
    private stopMetricsCollection;
    private startAlertMonitoring;
    private collectRealTimeMetrics;
    getLatestMetrics(): RealTimeMetricsData | null;
    private checkAlertRules;
    private extractMetricValue;
    private evaluateAlertCondition;
    private triggerAlert;
    getRecentAlerts(): {
        ruleId: string;
        ruleName: string;
        value: number;
        threshold: number;
        timestamp: number;
        resolved?: number;
    }[];
    getAlertRules(): AlertRule[];
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean;
    addAlertRule(rule: Omit<AlertRule, 'id'>): string;
    removeAlertRule(ruleId: string): boolean;
    getDashboardData(): Promise<{
        realTimeMetrics: RealTimeMetricsData;
        performanceStats: any;
        queryInsights: any;
        alertRules: AlertRule[];
        recentAlerts: any[];
    }>;
    getHistoricalMetrics(timeRange?: '1h' | '6h' | '24h' | '7d'): Promise<{
        timestamps: number[];
        responseTime: number[];
        requestsPerSecond: number[];
        cacheHitRate: number[];
        errorRate: number[];
        memoryUsage: number[];
    }>;
}
