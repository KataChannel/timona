import { OnModuleInit } from '@nestjs/common';
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    tags?: {
        [key: string]: string;
    };
    unit?: 'ms' | 'count' | 'bytes' | 'percent';
}
export interface QueryPerformanceData {
    operationName?: string;
    queryHash: string;
    duration: number;
    cacheHit: boolean;
    complexity?: number;
    fieldCount?: number;
    userId?: string;
}
export declare class PerformanceMetricsService implements OnModuleInit {
    private metrics;
    private queryMetrics;
    private readonly maxMetricsInMemory;
    private readonly maxQueryMetrics;
    private counters;
    private histograms;
    onModuleInit(): Promise<void>;
    recordMetric(metric: PerformanceMetric): void;
    recordQueryPerformance(data: QueryPerformanceData): void;
    incrementCounter(name: string, value?: number): void;
    recordHistogram(name: string, value: number): void;
    startTiming(operationName: string): () => number;
    measureAsync<T>(operationName: string, operation: () => Promise<T>, tags?: {
        [key: string]: string;
    }): Promise<T>;
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
            slowestQueries: QueryPerformanceData[];
        };
        systemMetrics: {
            memoryUsage: NodeJS.MemoryUsage;
            uptime: number;
        };
    };
    getRealTimeMetrics(): {
        activeConnections: number;
        requestsPerSecond: number;
        averageResponseTime: number;
        errorRate: number;
        cacheHitRate: number;
    };
    getQueryInsights(): {
        slowestQueries: QueryPerformanceData[];
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
    private calculateAverageResponseTimes;
    private calculatePercentiles;
    private getQueryStats;
    private collectSystemMetrics;
    private cleanupOldMetrics;
    exportPrometheusMetrics(): string;
}
