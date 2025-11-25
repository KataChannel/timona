import { AnalyticsDashboardService, CustomDashboard } from '../services/analytics-dashboard.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsDashboardService);
    getDashboardData(): Promise<{
        currentMetrics: import("../services/analytics-dashboard.service").AnalyticsData;
        historicalData: import("../services/analytics-dashboard.service").AnalyticsData[];
        insights: any[];
        alerts: any[];
        summary: any;
    }>;
    getWidgetData(widgetId: string, timeRange?: string): Promise<any>;
    getDashboards(): CustomDashboard[];
    getDashboard(id: string): CustomDashboard;
    createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>): {
        id: string;
        message: string;
    };
    updateDashboard(id: string, updates: Partial<CustomDashboard>): {
        success: boolean;
        message: string;
    };
    deleteDashboard(id: string): {
        success: boolean;
        message: string;
    };
    getPerformanceInsights(): Promise<{
        recommendations: string[];
        trends: any[];
        anomalies: any[];
        predictions: any[];
    }>;
    generateReport(timeRange?: '24h' | '7d' | '30d'): Promise<{
        period: string;
        summary: any;
        performance: any;
        availability: any;
        optimization: any;
        recommendations: string[];
    }>;
    getMetricsSummary(): Promise<{
        timestamp: number;
        summary: any;
        keyMetrics: {
            performance: {
                responseTime: number;
                throughput: number;
                errorRate: number;
                availability: number;
            };
            cache: {
                hitRate: number;
                operations: number;
                size: number;
                evictions: number;
            };
            subscriptions: {
                activeConnections: number;
                eventsPerSecond: number;
                subscriptionCount: number;
            };
            mobile: {
                mobileTraffic: number;
                compressionSavings: number;
                optimizationRate: number;
            };
            system: {
                memoryUsage: number;
                cpuUsage: number;
                diskUsage: number;
            };
        };
        trends: {
            performance: "up" | "down" | "stable";
            cache: "up" | "down" | "stable";
            subscriptions: "up" | "down" | "stable";
            mobile: "up" | "down" | "stable";
        };
        activeAlerts: number;
    }>;
    getHistoricalMetrics(timeRange?: '1h' | '6h' | '24h' | '7d', metrics?: string): Promise<any[]>;
    getSystemHealth(): Promise<{
        status: "critical" | "healthy" | "warning";
        score: number;
        timestamp: number;
        components: {
            performance: {
                status: string;
                responseTime: number;
                errorRate: number;
            };
            cache: {
                status: string;
                hitRate: number;
                operations: number;
            };
            subscriptions: {
                status: string;
                activeConnections: number;
                eventsPerSecond: number;
            };
            mobile: {
                status: string;
                trafficPercentage: number;
                optimizationRate: number;
            };
        };
        alerts: any[];
        recommendations: any[];
    }>;
    getAnalyticsConfig(): {
        refreshRates: number[];
        timeRanges: string[];
        chartTypes: string[];
        widgetTypes: string[];
        thresholds: {
            responseTime: {
                warning: number;
                critical: number;
            };
            errorRate: {
                warning: number;
                critical: number;
            };
            cacheHitRate: {
                warning: number;
                critical: number;
            };
            memoryUsage: {
                warning: number;
                critical: number;
            };
        };
    };
    exportAnalytics(format?: 'json' | 'csv', timeRange?: '24h' | '7d' | '30d'): Promise<{
        contentType: string;
        filename: string;
        data: string;
    } | {
        contentType: string;
        filename: string;
        data: {
            period: string;
            summary: any;
            performance: any;
            availability: any;
            optimization: any;
            recommendations: string[];
        };
    }>;
    getPerformanceComparison(period1?: '24h' | '7d', period2?: '24h' | '7d'): Promise<{
        period1: {
            period: "24h" | "7d";
            data: {
                period: string;
                summary: any;
                performance: any;
                availability: any;
                optimization: any;
                recommendations: string[];
            };
        };
        period2: {
            period: "24h" | "7d";
            data: {
                period: string;
                summary: any;
                performance: any;
                availability: any;
                optimization: any;
                recommendations: string[];
            };
        };
        comparison: {
            responseTime: {
                change: number;
                trend: string;
            };
            errorRate: {
                change: number;
                trend: string;
            };
            cacheHitRate: {
                change: number;
                trend: string;
            };
        };
    }>;
    private calculateHealthScore;
    private getHealthStatus;
    private convertToCSV;
    private calculateChange;
}
