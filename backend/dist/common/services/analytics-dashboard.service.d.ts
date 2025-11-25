import { PerformanceMetricsService } from './performance-metrics.service';
import { RealTimeMonitoringService } from './real-time-monitoring.service';
import { AdvancedCacheService } from './advanced-cache.service';
import { SubscriptionOptimizationService } from './subscription-optimization.service';
import { MobileOptimizationService } from './mobile-optimization.service';
export interface DashboardWidget {
    id: string;
    type: 'metric' | 'chart' | 'list' | 'gauge' | 'progress' | 'heatmap';
    title: string;
    description?: string;
    config: {
        dataSource: string;
        refreshRate: number;
        timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
        chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
        thresholds?: {
            warning: number;
            critical: number;
        };
        displayOptions?: any;
    };
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    visible: boolean;
}
export interface AnalyticsData {
    timestamp: number;
    metrics: {
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
        performance: 'up' | 'down' | 'stable';
        cache: 'up' | 'down' | 'stable';
        subscriptions: 'up' | 'down' | 'stable';
        mobile: 'up' | 'down' | 'stable';
    };
}
export interface CustomDashboard {
    id: string;
    name: string;
    description?: string;
    widgets: DashboardWidget[];
    layout: 'grid' | 'fluid';
    refreshRate: number;
    isDefault: boolean;
    createdBy?: string;
    createdAt: number;
    updatedAt: number;
}
export declare class AnalyticsDashboardService {
    private readonly performanceService;
    private readonly monitoringService;
    private readonly cacheService;
    private readonly subscriptionService;
    private readonly mobileService;
    private readonly dashboards;
    private readonly analyticsHistory;
    private readonly maxHistorySize;
    private readonly defaultWidgets;
    constructor(performanceService: PerformanceMetricsService, monitoringService: RealTimeMonitoringService, cacheService: AdvancedCacheService, subscriptionService: SubscriptionOptimizationService, mobileService: MobileOptimizationService);
    getDashboardData(): Promise<{
        currentMetrics: AnalyticsData;
        historicalData: AnalyticsData[];
        insights: any[];
        alerts: any[];
        summary: any;
    }>;
    getWidgetData(widgetId: string, timeRange?: string): Promise<any>;
    createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>): string;
    updateDashboard(id: string, updates: Partial<CustomDashboard>): boolean;
    getDashboards(): CustomDashboard[];
    getDashboard(id: string): CustomDashboard | null;
    deleteDashboard(id: string): boolean;
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
    private initializeDefaultDashboard;
    private startDataCollection;
    private collectCurrentMetrics;
    private calculateAvailability;
    private calculateTrends;
    private compareTrend;
    private getHistoricalData;
    private findWidget;
    private getChartData;
    private getGaugeData;
    private getMetricData;
    private extractMetricValue;
    private getUnitForMetric;
    private getTrendKey;
    private generateInsights;
    private generateSummary;
    private calculateOverallHealth;
    private getListData;
    private getProgressData;
    private getHeatmapData;
    private calculateTotalRequests;
    private calculateAverage;
    private calculateTrend;
    private calculateUptime;
    private countIncidents;
    private calculateMTTR;
    private generateRecommendations;
    private analyzeTrends;
    private detectAnomalies;
    private generatePredictions;
}
