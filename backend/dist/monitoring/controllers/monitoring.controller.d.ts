import { MetricsCollectorService } from '../services/metrics-collector.service';
import { HealthCheckService } from '../services/health-check.service';
import { PerformanceProfilerService } from '../services/performance-profiler.service';
import { AlertManagerService, Alert, AlertRule } from '../services/alert-manager.service';
export declare class MonitoringController {
    private readonly metricsCollector;
    private readonly healthCheck;
    private readonly performanceProfiler;
    private readonly alertManager;
    constructor(metricsCollector: MetricsCollectorService, healthCheck: HealthCheckService, performanceProfiler: PerformanceProfilerService, alertManager: AlertManagerService);
    getHealth(): Promise<import("../services/health-check.service").HealthStatus>;
    getSimpleHealth(): Promise<{
        status: string;
        timestamp: Date;
    }>;
    getSystemMetrics(): Promise<import("../services/metrics-collector.service").SystemMetrics>;
    getApplicationMetrics(): Promise<import("../services/metrics-collector.service").ApplicationMetrics>;
    getCustomMetrics(): Promise<import("../services/metrics-collector.service").CustomMetrics[]>;
    getPrometheusMetrics(): Promise<string>;
    recordCustomMetric(body: {
        name: string;
        value: number;
        type: 'gauge' | 'counter' | 'histogram' | 'summary';
        description?: string;
        labels?: Record<string, string>;
    }): {
        success: boolean;
        message: string;
    };
    getPerformanceProfile(): Promise<Partial<import("../services/performance-profiler.service").PerformanceProfile>>;
    startProfiling(body: {
        duration?: number;
    }): {
        success: boolean;
        message: string;
        duration: number;
    };
    stopProfiling(): {
        success: boolean;
        message: string;
    };
    getPerformanceRecommendations(): Promise<{
        recommendations: string[];
        snapshot: Partial<import("../services/performance-profiler.service").PerformanceProfile>;
    }>;
    analyzeBottlenecks(): Promise<{
        bottlenecks: string[];
        snapshot: Partial<import("../services/performance-profiler.service").PerformanceProfile>;
    }>;
    getAlertSummary(): import("../services/alert-manager.service").AlertSummary;
    getActiveAlerts(): Alert[];
    createAlert(body: {
        title: string;
        description: string;
        severity: Alert['severity'];
        category: Alert['category'];
        source: string;
        metrics?: Record<string, number>;
        correlationId?: string;
    }): {
        success: boolean;
        alert: Alert;
    };
    acknowledgeAlert(alertId: string, body: {
        user: string;
        comment?: string;
    }): {
        success: boolean;
        message: string;
        alert?: undefined;
    } | {
        success: boolean;
        alert: Alert;
        message?: undefined;
    };
    resolveAlert(alertId: string, body: {
        user: string;
        comment?: string;
    }): {
        success: boolean;
        message: string;
        alert?: undefined;
    } | {
        success: boolean;
        alert: Alert;
        message?: undefined;
    };
    getAlertRules(): AlertRule[];
    addAlertRule(rule: Omit<AlertRule, 'id'>): {
        success: boolean;
        rule: AlertRule;
    };
    toggleAlertRule(ruleId: string, body: {
        enabled: boolean;
    }): {
        success: boolean;
        message: string;
        rule?: undefined;
    } | {
        success: boolean;
        rule: AlertRule;
        message?: undefined;
    };
    getDashboardData(): Promise<{
        system: import("../services/metrics-collector.service").SystemMetrics;
        application: import("../services/metrics-collector.service").ApplicationMetrics;
        health: {
            status: string;
            timestamp: Date;
        };
        alerts: import("../services/alert-manager.service").AlertSummary;
        performance: Partial<import("../services/performance-profiler.service").PerformanceProfile>;
        timestamp: Date;
    }>;
    getHistoricalMetrics(metric: string, period?: string, interval?: string): Promise<{
        metric: string;
        period: string;
        interval: string;
        data: {
            timestamp: Date;
            value: number;
        }[];
        summary: {
            min: number;
            max: number;
            avg: number;
            latest: number;
        };
    }>;
    private calculateIntervals;
    private parsePeriod;
    private parseInterval;
}
