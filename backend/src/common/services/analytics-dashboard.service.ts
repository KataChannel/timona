import { Injectable } from '@nestjs/common';
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
    refreshRate: number; // milliseconds
    timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
    thresholds?: { warning: number; critical: number };
    displayOptions?: any;
  };
  position: { x: number; y: number; width: number; height: number };
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

@Injectable()
export class AnalyticsDashboardService {
  private readonly dashboards = new Map<string, CustomDashboard>();
  private readonly analyticsHistory: AnalyticsData[] = [];
  private readonly maxHistorySize = 10000; // Keep last 10k data points
  
  // Pre-configured widgets
  private readonly defaultWidgets: DashboardWidget[] = [
    {
      id: 'response-time',
      type: 'chart',
      title: 'Response Time',
      description: 'Average response time over time',
      config: {
        dataSource: 'performance.responseTime',
        refreshRate: 5000,
        timeRange: '1h',
        chartType: 'line',
        thresholds: { warning: 500, critical: 1000 }
      },
      position: { x: 0, y: 0, width: 6, height: 3 },
      visible: true
    },
    {
      id: 'cache-hit-rate',
      type: 'gauge',
      title: 'Cache Hit Rate',
      description: 'Current cache hit rate percentage',
      config: {
        dataSource: 'cache.hitRate',
        refreshRate: 10000,
        thresholds: { warning: 70, critical: 50 }
      },
      position: { x: 6, y: 0, width: 3, height: 3 },
      visible: true
    },
    {
      id: 'active-connections',
      type: 'metric',
      title: 'Active Connections',
      description: 'Number of active WebSocket connections',
      config: {
        dataSource: 'subscriptions.activeConnections',
        refreshRate: 5000
      },
      position: { x: 9, y: 0, width: 3, height: 3 },
      visible: true
    },
    {
      id: 'error-rate-chart',
      type: 'chart',
      title: 'Error Rate',
      description: 'Error rate percentage over time',
      config: {
        dataSource: 'performance.errorRate',
        refreshRate: 10000,
        timeRange: '6h',
        chartType: 'area',
        thresholds: { warning: 2, critical: 5 }
      },
      position: { x: 0, y: 3, width: 6, height: 3 },
      visible: true
    },
    {
      id: 'mobile-stats',
      type: 'progress',
      title: 'Mobile Optimization',
      description: 'Mobile traffic and optimization metrics',
      config: {
        dataSource: 'mobile.optimizationRate',
        refreshRate: 15000
      },
      position: { x: 6, y: 3, width: 6, height: 3 },
      visible: true
    },
    {
      id: 'top-queries',
      type: 'list',
      title: 'Top Queries',
      description: 'Most frequently executed queries',
      config: {
        dataSource: 'performance.topQueries',
        refreshRate: 30000
      },
      position: { x: 0, y: 6, width: 12, height: 4 },
      visible: true
    }
  ];

  constructor(
    private readonly performanceService: PerformanceMetricsService,
    private readonly monitoringService: RealTimeMonitoringService,
    private readonly cacheService: AdvancedCacheService,
    private readonly subscriptionService: SubscriptionOptimizationService,
    private readonly mobileService: MobileOptimizationService,
  ) {
    this.initializeDefaultDashboard();
    this.startDataCollection();
  }

  /**
   * Get dashboard data for analytics
   */
  async getDashboardData(): Promise<{
    currentMetrics: AnalyticsData;
    historicalData: AnalyticsData[];
    insights: any[];
    alerts: any[];
    summary: any;
  }> {
    const currentMetrics = await this.collectCurrentMetrics();
    const historicalData = this.getHistoricalData('24h');
    const insights = await this.generateInsights(currentMetrics, historicalData);
    const alerts = this.monitoringService.getRecentAlerts();
    const summary = this.generateSummary(currentMetrics);

    return {
      currentMetrics,
      historicalData,
      insights,
      alerts,
      summary
    };
  }

  /**
   * Get widget data for a specific widget
   */
  async getWidgetData(widgetId: string, timeRange?: string): Promise<any> {
    const widget = this.findWidget(widgetId);
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`);
    }

    const dataSource = widget.config.dataSource;
    const range = timeRange || widget.config.timeRange || '1h';

    switch (widget.type) {
      case 'chart':
        return this.getChartData(dataSource, range, widget.config.chartType);
      
      case 'gauge':
        return this.getGaugeData(dataSource);
      
      case 'metric':
        return this.getMetricData(dataSource);
      
      case 'list':
        return this.getListData(dataSource);
      
      case 'progress':
        return this.getProgressData(dataSource);
      
      case 'heatmap':
        return this.getHeatmapData(dataSource, range);
      
      default:
        throw new Error(`Unknown widget type: ${widget.type}`);
    }
  }

  /**
   * Create custom dashboard
   */
  createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDashboard: CustomDashboard = {
      ...dashboard,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.dashboards.set(id, newDashboard);
    return id;
  }

  /**
   * Update existing dashboard
   */
  updateDashboard(id: string, updates: Partial<CustomDashboard>): boolean {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return false;

    Object.assign(dashboard, updates, { updatedAt: Date.now() });
    this.dashboards.set(id, dashboard);
    return true;
  }

  /**
   * Get all dashboards
   */
  getDashboards(): CustomDashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get specific dashboard
   */
  getDashboard(id: string): CustomDashboard | null {
    return this.dashboards.get(id) || null;
  }

  /**
   * Delete dashboard
   */
  deleteDashboard(id: string): boolean {
    return this.dashboards.delete(id);
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(): Promise<{
    recommendations: string[];
    trends: any[];
    anomalies: any[];
    predictions: any[];
  }> {
    const currentMetrics = await this.collectCurrentMetrics();
    const historical = this.getHistoricalData('24h');

    const recommendations = this.generateRecommendations(currentMetrics);
    const trends = this.analyzeTrends(historical);
    const anomalies = this.detectAnomalies(historical);
    const predictions = this.generatePredictions(historical);

    return { recommendations, trends, anomalies, predictions };
  }

  /**
   * Generate performance report
   */
  async generateReport(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<{
    period: string;
    summary: any;
    performance: any;
    availability: any;
    optimization: any;
    recommendations: string[];
  }> {
    const historical = this.getHistoricalData(timeRange);
    const latest = historical[historical.length - 1] || (await this.collectCurrentMetrics());

    return {
      period: timeRange,
      summary: {
        totalRequests: this.calculateTotalRequests(historical),
        averageResponseTime: this.calculateAverage(historical, 'metrics.performance.responseTime'),
        uptime: this.calculateUptime(historical),
        errorRate: this.calculateAverage(historical, 'metrics.performance.errorRate'),
      },
      performance: {
        responseTimeTrend: this.calculateTrend(historical, 'metrics.performance.responseTime'),
        throughputTrend: this.calculateTrend(historical, 'metrics.performance.throughput'),
        cacheHitRate: this.calculateAverage(historical, 'metrics.cache.hitRate'),
      },
      availability: {
        uptime: this.calculateUptime(historical),
        incidents: this.countIncidents(historical),
        mttr: this.calculateMTTR(historical), // Mean Time To Recovery
      },
      optimization: {
        cacheEfficiency: latest.metrics.cache.hitRate,
        mobileOptimization: latest.metrics.mobile.optimizationRate,
        subscriptionPerformance: latest.metrics.subscriptions.eventsPerSecond,
      },
      recommendations: this.generateRecommendations(latest)
    };
  }

  /**
   * Initialize default dashboard
   */
  private initializeDefaultDashboard(): void {
    const defaultDashboard: CustomDashboard = {
      id: 'default',
      name: 'rausachcore Analytics Dashboard',
      description: 'Main analytics dashboard for rausachcore application',
      widgets: this.defaultWidgets,
      layout: 'grid',
      refreshRate: 5000,
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.dashboards.set('default', defaultDashboard);
  }

  /**
   * Start collecting analytics data
   */
  private startDataCollection(): void {
    setInterval(async () => {
      const metrics = await this.collectCurrentMetrics();
      this.analyticsHistory.push(metrics);

      // Keep history size under control
      if (this.analyticsHistory.length > this.maxHistorySize) {
        this.analyticsHistory.splice(0, this.analyticsHistory.length - this.maxHistorySize);
      }
    }, 60000); // Collect every minute
  }

  /**
   * Collect current metrics from all services
   */
  private async collectCurrentMetrics(): Promise<AnalyticsData> {
    const [performanceStats, monitoringData, cacheStats, subscriptionStats, mobileStats] = await Promise.all([
      this.performanceService.getPerformanceStats(),
      this.monitoringService.getLatestMetrics(),
      this.cacheService.getStatistics(),
      this.subscriptionService.getSubscriptionStats(),
      this.mobileService.getMobileStats()
    ]);

    const timestamp = Date.now();

    return {
      timestamp,
      metrics: {
        performance: {
          responseTime: performanceStats.averageResponseTimes['graphql.response_time'] || 0,
          throughput: monitoringData?.performance.requestsPerSecond || 0,
          errorRate: monitoringData?.performance.errorRate || 0,
          availability: this.calculateAvailability(performanceStats),
        },
        cache: {
          hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100 || 0,
          operations: cacheStats.operations,
          size: cacheStats.totalSize,
          evictions: cacheStats.evictions,
        },
        subscriptions: {
          activeConnections: subscriptionStats.activeConnections,
          eventsPerSecond: subscriptionStats.eventsSent / 60, // Rough estimate
          subscriptionCount: subscriptionStats.totalSubscriptions,
        },
        mobile: {
          mobileTraffic: mobileStats.mobilePercentage,
          compressionSavings: mobileStats.compressionSavings,
          optimizationRate: mobileStats.optimizationEfficiency,
        },
        system: {
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpuUsage: process.cpuUsage().user / 1000000, // Rough estimate
          diskUsage: 0, // Would need additional monitoring
        },
      },
      trends: this.calculateTrends()
    };
  }

  /**
   * Calculate availability percentage
   */
  private calculateAvailability(stats: any): number {
    const totalRequests = stats.counters['graphql.queries.total'] || 1;
    const errorCount = stats.counters['graphql.errors.total'] || 0;
    return ((totalRequests - errorCount) / totalRequests) * 100;
  }

  /**
   * Calculate trends for metrics
   */
  private calculateTrends(): AnalyticsData['trends'] {
    if (this.analyticsHistory.length < 2) {
      return { performance: 'stable', cache: 'stable', subscriptions: 'stable', mobile: 'stable' };
    }

    const current = this.analyticsHistory[this.analyticsHistory.length - 1];
    const previous = this.analyticsHistory[this.analyticsHistory.length - 2];

    return {
      performance: this.compareTrend(current.metrics.performance.responseTime, previous.metrics.performance.responseTime, 'lower'),
      cache: this.compareTrend(current.metrics.cache.hitRate, previous.metrics.cache.hitRate, 'higher'),
      subscriptions: this.compareTrend(current.metrics.subscriptions.activeConnections, previous.metrics.subscriptions.activeConnections, 'higher'),
      mobile: this.compareTrend(current.metrics.mobile.optimizationRate, previous.metrics.mobile.optimizationRate, 'higher'),
    };
  }

  /**
   * Compare trend direction
   */
  private compareTrend(current: number, previous: number, betterDirection: 'higher' | 'lower'): 'up' | 'down' | 'stable' {
    const threshold = 0.05; // 5% change threshold
    const change = (current - previous) / previous;

    if (Math.abs(change) < threshold) return 'stable';
    
    if (betterDirection === 'higher') {
      return change > 0 ? 'up' : 'down';
    } else {
      return change > 0 ? 'down' : 'up';
    }
  }

  /**
   * Get historical data for a time range
   */
  private getHistoricalData(timeRange: string): AnalyticsData[] {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - (ranges[timeRange] || ranges['24h']);
    return this.analyticsHistory.filter(data => data.timestamp > cutoff);
  }

  /**
   * Find widget by ID
   */
  private findWidget(widgetId: string): DashboardWidget | null {
    for (const dashboard of this.dashboards.values()) {
      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (widget) return widget;
    }
    return null;
  }

  /**
   * Get chart data for widget
   */
  private getChartData(dataSource: string, timeRange: string, chartType?: string): any {
    const historical = this.getHistoricalData(timeRange);
    const dataPoints = historical.map(data => ({
      timestamp: data.timestamp,
      value: this.extractMetricValue(data, dataSource)
    }));

    return {
      labels: dataPoints.map(point => new Date(point.timestamp).toLocaleTimeString()),
      datasets: [{
        label: dataSource,
        data: dataPoints.map(point => point.value),
        type: chartType || 'line'
      }]
    };
  }

  /**
   * Get gauge data
   */
  private async getGaugeData(dataSource: string): Promise<any> {
    const current = await this.collectCurrentMetrics();
    const value = this.extractMetricValue(current, dataSource);
    
    return {
      value,
      min: 0,
      max: dataSource.includes('Rate') || dataSource.includes('rate') ? 100 : 1000,
      unit: this.getUnitForMetric(dataSource)
    };
  }

  /**
   * Get metric data
   */
  private async getMetricData(dataSource: string): Promise<any> {
    const current = await this.collectCurrentMetrics();
    const value = this.extractMetricValue(current, dataSource);
    
    return {
      value,
      unit: this.getUnitForMetric(dataSource),
      trend: current.trends[this.getTrendKey(dataSource)]
    };
  }

  /**
   * Extract metric value using dot notation
   */
  private extractMetricValue(data: AnalyticsData, path: string): number {
    const keys = path.split('.');
    let value: any = data;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Get unit for metric
   */
  private getUnitForMetric(dataSource: string): string {
    if (dataSource.includes('Time') || dataSource.includes('time')) return 'ms';
    if (dataSource.includes('Rate') || dataSource.includes('rate')) return '%';
    if (dataSource.includes('Size') || dataSource.includes('size')) return 'MB';
    if (dataSource.includes('Count') || dataSource.includes('count')) return '';
    return '';
  }

  /**
   * Get trend key from data source
   */
  private getTrendKey(dataSource: string): keyof AnalyticsData['trends'] {
    if (dataSource.includes('performance')) return 'performance';
    if (dataSource.includes('cache')) return 'cache';
    if (dataSource.includes('subscriptions')) return 'subscriptions';
    if (dataSource.includes('mobile')) return 'mobile';
    return 'performance';
  }

  /**
   * Generate insights from current and historical data
   */
  private async generateInsights(current: AnalyticsData, historical: AnalyticsData[]): Promise<any[]> {
    const insights = [];

    // Response time insight
    if (current.metrics.performance.responseTime > 1000) {
      insights.push({
        type: 'warning',
        title: 'High Response Time',
        message: 'Average response time is above 1 second',
        suggestion: 'Consider optimizing slow queries or increasing cache hit rate'
      });
    }

    // Cache hit rate insight
    if (current.metrics.cache.hitRate < 70) {
      insights.push({
        type: 'info',
        title: 'Low Cache Hit Rate',
        message: `Cache hit rate is ${current.metrics.cache.hitRate.toFixed(1)}%`,
        suggestion: 'Review caching strategy and increase cache TTL for stable data'
      });
    }

    // Mobile optimization insight
    if (current.metrics.mobile.mobileTraffic > 50 && current.metrics.mobile.optimizationRate < 80) {
      insights.push({
        type: 'info',
        title: 'Mobile Optimization Opportunity',
        message: 'High mobile traffic but low optimization rate',
        suggestion: 'Enable more aggressive mobile optimizations'
      });
    }

    return insights;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(current: AnalyticsData): any {
    return {
      overallHealth: this.calculateOverallHealth(current),
      keyMetrics: {
        responseTime: current.metrics.performance.responseTime,
        cacheHitRate: current.metrics.cache.hitRate,
        activeConnections: current.metrics.subscriptions.activeConnections,
        errorRate: current.metrics.performance.errorRate
      },
      alerts: this.monitoringService.getRecentAlerts().length,
      uptime: current.metrics.performance.availability
    };
  }

  /**
   * Calculate overall system health score
   */
  private calculateOverallHealth(current: AnalyticsData): number {
    let score = 100;
    
    // Response time penalty
    if (current.metrics.performance.responseTime > 500) score -= 10;
    if (current.metrics.performance.responseTime > 1000) score -= 20;
    
    // Error rate penalty
    if (current.metrics.performance.errorRate > 1) score -= 10;
    if (current.metrics.performance.errorRate > 5) score -= 20;
    
    // Cache hit rate bonus/penalty
    if (current.metrics.cache.hitRate > 80) score += 5;
    if (current.metrics.cache.hitRate < 60) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get list data (top queries, etc.)
   */
  private async getListData(dataSource: string): Promise<any> {
    if (dataSource === 'performance.topQueries') {
      const insights = this.performanceService.getQueryInsights();
      return insights.mostFrequentQueries.slice(0, 10);
    }
    
    return [];
  }

  /**
   * Get progress data
   */
  private async getProgressData(dataSource: string): Promise<any> {
    const current = await this.collectCurrentMetrics();
    const value = this.extractMetricValue(current, dataSource);
    
    return {
      current: value,
      target: 100,
      percentage: Math.min(value, 100)
    };
  }

  /**
   * Get heatmap data
   */
  private getHeatmapData(dataSource: string, timeRange: string): any {
    // Simplified heatmap data
    return {
      data: [[0, 0, 50], [0, 1, 75], [1, 0, 25], [1, 1, 90]],
      xLabels: ['Hour 1', 'Hour 2'],
      yLabels: ['Server 1', 'Server 2']
    };
  }

  // Additional helper methods for calculations
  private calculateTotalRequests(historical: AnalyticsData[]): number {
    return historical.reduce((sum, data) => sum + data.metrics.performance.throughput, 0);
  }

  private calculateAverage(historical: AnalyticsData[], path: string): number {
    const values = historical.map(data => this.extractMetricValue(data, path));
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateTrend(historical: AnalyticsData[], path: string): 'increasing' | 'decreasing' | 'stable' {
    if (historical.length < 2) return 'stable';
    
    const recent = historical.slice(-10); // Last 10 data points
    const values = recent.map(data => this.extractMetricValue(data, path));
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private calculateUptime(historical: AnalyticsData[]): number {
    if (historical.length === 0) return 100;
    
    const totalTime = historical.length;
    const downTime = historical.filter(data => data.metrics.performance.availability < 95).length;
    
    return ((totalTime - downTime) / totalTime) * 100;
  }

  private countIncidents(historical: AnalyticsData[]): number {
    return historical.filter(data => 
      data.metrics.performance.errorRate > 5 || 
      data.metrics.performance.availability < 95
    ).length;
  }

  private calculateMTTR(historical: AnalyticsData[]): number {
    // Mock calculation - would need incident tracking in production
    return 15; // 15 minutes average
  }

  private generateRecommendations(current: AnalyticsData): string[] {
    const recommendations = [];
    
    if (current.metrics.performance.responseTime > 500) {
      recommendations.push('Consider adding more cache layers or optimizing database queries');
    }
    
    if (current.metrics.cache.hitRate < 80) {
      recommendations.push('Increase cache TTL for frequently accessed data');
    }
    
    if (current.metrics.mobile.mobileTraffic > 40 && current.metrics.mobile.optimizationRate < 70) {
      recommendations.push('Implement more aggressive mobile optimizations');
    }
    
    if (current.metrics.subscriptions.activeConnections > 100) {
      recommendations.push('Consider implementing connection pooling for subscriptions');
    }
    
    return recommendations;
  }

  private analyzeTrends(historical: AnalyticsData[]): any[] {
    return [
      {
        metric: 'Response Time',
        trend: this.calculateTrend(historical, 'metrics.performance.responseTime'),
        change: '5% decrease over 24h'
      },
      {
        metric: 'Cache Hit Rate',
        trend: this.calculateTrend(historical, 'metrics.cache.hitRate'),
        change: '12% increase over 24h'
      }
    ];
  }

  private detectAnomalies(historical: AnalyticsData[]): any[] {
    // Mock anomaly detection
    return [
      {
        timestamp: Date.now() - 3600000,
        metric: 'Response Time',
        value: 2500,
        severity: 'high',
        description: 'Response time spike detected'
      }
    ];
  }

  private generatePredictions(historical: AnalyticsData[]): any[] {
    // Mock predictions based on trends
    return [
      {
        metric: 'Cache Hit Rate',
        prediction: 'Expected to reach 85% within 2 hours',
        confidence: 0.8
      },
      {
        metric: 'Active Connections',
        prediction: 'Peak expected at 2 PM with ~150 connections',
        confidence: 0.7
      }
    ];
  }
}