import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AnalyticsDashboardService, CustomDashboard, DashboardWidget } from '../services/analytics-dashboard.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsDashboardService,
  ) {}

  /**
   * Get main dashboard data
   */
  @Get('dashboard')
  async getDashboardData() {
    return this.analyticsService.getDashboardData();
  }

  /**
   * Get widget data
   */
  @Get('widgets/:widgetId/data')
  async getWidgetData(
    @Param('widgetId') widgetId: string,
    @Query('timeRange') timeRange?: string
  ) {
    return this.analyticsService.getWidgetData(widgetId, timeRange);
  }

  /**
   * Get all dashboards
   */
  @Get('dashboards')
  getDashboards() {
    return this.analyticsService.getDashboards();
  }

  /**
   * Get specific dashboard
   */
  @Get('dashboards/:id')
  getDashboard(@Param('id') id: string) {
    const dashboard = this.analyticsService.getDashboard(id);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    return dashboard;
  }

  /**
   * Create new dashboard
   */
  @Post('dashboards')
  createDashboard(@Body() dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = this.analyticsService.createDashboard(dashboard);
    return { id, message: 'Dashboard created successfully' };
  }

  /**
   * Update dashboard
   */
  @Put('dashboards/:id')
  updateDashboard(
    @Param('id') id: string,
    @Body() updates: Partial<CustomDashboard>
  ) {
    const success = this.analyticsService.updateDashboard(id, updates);
    return {
      success,
      message: success ? 'Dashboard updated successfully' : 'Dashboard not found'
    };
  }

  /**
   * Delete dashboard
   */
  @Delete('dashboards/:id')
  deleteDashboard(@Param('id') id: string) {
    const success = this.analyticsService.deleteDashboard(id);
    return {
      success,
      message: success ? 'Dashboard deleted successfully' : 'Dashboard not found'
    };
  }

  /**
   * Get performance insights
   */
  @Get('insights')
  async getPerformanceInsights() {
    return this.analyticsService.getPerformanceInsights();
  }

  /**
   * Generate performance report
   */
  @Get('reports')
  async generateReport(@Query('timeRange') timeRange: '24h' | '7d' | '30d' = '24h') {
    return this.analyticsService.generateReport(timeRange);
  }

  /**
   * Get real-time metrics summary
   */
  @Get('metrics/summary')
  async getMetricsSummary() {
    const dashboardData = await this.analyticsService.getDashboardData();
    return {
      timestamp: Date.now(),
      summary: dashboardData.summary,
      keyMetrics: dashboardData.currentMetrics.metrics,
      trends: dashboardData.currentMetrics.trends,
      activeAlerts: dashboardData.alerts.length
    };
  }

  /**
   * Get historical metrics for charts
   */
  @Get('metrics/historical')
  async getHistoricalMetrics(
    @Query('timeRange') timeRange: '1h' | '6h' | '24h' | '7d' = '24h',
    @Query('metrics') metrics?: string
  ) {
    const dashboardData = await this.analyticsService.getDashboardData();
    
    // Filter metrics if specified
    if (metrics) {
      const requestedMetrics = metrics.split(',');
      const filteredData = dashboardData.historicalData.map(data => {
        const filtered: any = { timestamp: data.timestamp };
        
        requestedMetrics.forEach(metric => {
          const keys = metric.split('.');
          let source = data.metrics;
          let target = filtered;
          
          // Navigate through the nested structure
          keys.forEach((key, index) => {
            if (index === keys.length - 1) {
              target[key] = source?.[key];
            } else {
              if (!target[key]) target[key] = {};
              target = target[key];
              source = source?.[key];
            }
          });
        });
        
        return filtered;
      });
      
      return filteredData;
    }
    
    return dashboardData.historicalData;
  }

  /**
   * Get system health overview
   */
  @Get('health')
  async getSystemHealth() {
    const dashboardData = await this.analyticsService.getDashboardData();
    const current = dashboardData.currentMetrics;
    
    const healthScore = this.calculateHealthScore(current);
    const status = this.getHealthStatus(healthScore);
    
    return {
      status,
      score: healthScore,
      timestamp: current.timestamp,
      components: {
        performance: {
          status: current.metrics.performance.responseTime < 1000 ? 'healthy' : 'warning',
          responseTime: current.metrics.performance.responseTime,
          errorRate: current.metrics.performance.errorRate
        },
        cache: {
          status: current.metrics.cache.hitRate > 70 ? 'healthy' : 'warning',
          hitRate: current.metrics.cache.hitRate,
          operations: current.metrics.cache.operations
        },
        subscriptions: {
          status: 'healthy',
          activeConnections: current.metrics.subscriptions.activeConnections,
          eventsPerSecond: current.metrics.subscriptions.eventsPerSecond
        },
        mobile: {
          status: current.metrics.mobile.optimizationRate > 60 ? 'healthy' : 'info',
          trafficPercentage: current.metrics.mobile.mobileTraffic,
          optimizationRate: current.metrics.mobile.optimizationRate
        }
      },
      alerts: dashboardData.alerts.slice(0, 5), // Recent alerts
      recommendations: dashboardData.insights.slice(0, 3) // Top recommendations
    };
  }

  /**
   * Get analytics configuration
   */
  @Get('config')
  getAnalyticsConfig() {
    return {
      refreshRates: [1000, 5000, 10000, 30000, 60000],
      timeRanges: ['1h', '6h', '24h', '7d', '30d'],
      chartTypes: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'],
      widgetTypes: ['metric', 'chart', 'list', 'gauge', 'progress', 'heatmap'],
      thresholds: {
        responseTime: { warning: 500, critical: 1000 },
        errorRate: { warning: 2, critical: 5 },
        cacheHitRate: { warning: 70, critical: 50 },
        memoryUsage: { warning: 512, critical: 768 }
      }
    };
  }

  /**
   * Export analytics data
   */
  @Get('export')
  async exportAnalytics(
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('timeRange') timeRange: '24h' | '7d' | '30d' = '24h'
  ) {
    const report = await this.analyticsService.generateReport(timeRange);
    
    if (format === 'csv') {
      return {
        contentType: 'text/csv',
        filename: `rausachcore-analytics-${timeRange}-${Date.now()}.csv`,
        data: this.convertToCSV(report)
      };
    }
    
    return {
      contentType: 'application/json',
      filename: `rausachcore-analytics-${timeRange}-${Date.now()}.json`,
      data: report
    };
  }

  /**
   * Get performance comparison
   */
  @Get('compare')
  async getPerformanceComparison(
    @Query('period1') period1: '24h' | '7d' = '24h',
    @Query('period2') period2: '24h' | '7d' = '7d'
  ) {
    const [report1, report2] = await Promise.all([
      this.analyticsService.generateReport(period1),
      this.analyticsService.generateReport(period2)
    ]);
    
    return {
      period1: {
        period: period1,
        data: report1
      },
      period2: {
        period: period2,
        data: report2
      },
      comparison: {
        responseTime: {
          change: this.calculateChange(
            report1.summary.averageResponseTime,
            report2.summary.averageResponseTime
          ),
          trend: report1.summary.averageResponseTime < report2.summary.averageResponseTime ? 'improved' : 'degraded'
        },
        errorRate: {
          change: this.calculateChange(
            report1.summary.errorRate,
            report2.summary.errorRate
          ),
          trend: report1.summary.errorRate < report2.summary.errorRate ? 'improved' : 'degraded'
        },
        cacheHitRate: {
          change: this.calculateChange(
            report1.performance.cacheHitRate,
            report2.performance.cacheHitRate
          ),
          trend: report1.performance.cacheHitRate > report2.performance.cacheHitRate ? 'improved' : 'degraded'
        }
      }
    };
  }

  /**
   * Calculate health score from metrics
   */
  private calculateHealthScore(metrics: any): number {
    let score = 100;
    
    // Response time impact
    if (metrics.metrics.performance.responseTime > 500) score -= 15;
    if (metrics.metrics.performance.responseTime > 1000) score -= 25;
    
    // Error rate impact
    if (metrics.metrics.performance.errorRate > 1) score -= 10;
    if (metrics.metrics.performance.errorRate > 5) score -= 20;
    
    // Cache hit rate impact
    if (metrics.metrics.cache.hitRate < 80) score -= 10;
    if (metrics.metrics.cache.hitRate < 60) score -= 20;
    
    // System resources
    if (metrics.metrics.system.memoryUsage > 512) score -= 10;
    if (metrics.metrics.system.memoryUsage > 768) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get health status from score
   */
  private getHealthStatus(score: number): 'healthy' | 'warning' | 'critical' {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  /**
   * Convert report to CSV format
   */
  private convertToCSV(report: any): string {
    const headers = ['Metric', 'Value', 'Unit'];
    const rows = [
      ['Average Response Time', report.summary.averageResponseTime, 'ms'],
      ['Error Rate', report.summary.errorRate, '%'],
      ['Cache Hit Rate', report.performance.cacheHitRate, '%'],
      ['Uptime', report.availability.uptime, '%'],
      ['Total Requests', report.summary.totalRequests, 'count']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Calculate percentage change between two values
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}