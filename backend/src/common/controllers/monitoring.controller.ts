import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RealTimeMonitoringService, AlertRule } from '../services/real-time-monitoring.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: RealTimeMonitoringService,
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  /**
   * Get real-time metrics
   */
  @Get('metrics/realtime')
  getRealTimeMetrics() {
    return this.monitoringService.getLatestMetrics();
  }

  /**
   * Get comprehensive dashboard data
   */
  @Get('dashboard')
  async getDashboardData() {
    return this.monitoringService.getDashboardData();
  }

  /**
   * Get performance statistics
   */
  @Get('performance/stats')
  getPerformanceStats() {
    return this.performanceMetricsService.getPerformanceStats();
  }

  /**
   * Get query insights
   */
  @Get('performance/queries')
  getQueryInsights() {
    return this.performanceMetricsService.getQueryInsights();
  }

  /**
   * Get historical metrics
   */
  @Get('metrics/historical')
  async getHistoricalMetrics(@Query('range') range: '1h' | '6h' | '24h' | '7d' = '1h') {
    return this.monitoringService.getHistoricalMetrics(range);
  }

  /**
   * Export Prometheus metrics
   */
  @Get('metrics/prometheus')
  exportPrometheusMetrics() {
    return {
      contentType: 'text/plain',
      data: this.performanceMetricsService.exportPrometheusMetrics()
    };
  }

  /**
   * Get alert rules
   */
  @Get('alerts/rules')
  getAlertRules() {
    return this.monitoringService.getAlertRules();
  }

  /**
   * Create new alert rule
   */
  @Post('alerts/rules')
  createAlertRule(@Body() rule: Omit<AlertRule, 'id'>) {
    const ruleId = this.monitoringService.addAlertRule(rule);
    return { id: ruleId, message: 'Alert rule created successfully' };
  }

  /**
   * Update alert rule
   */
  @Put('alerts/rules/:id')
  updateAlertRule(
    @Param('id') id: string,
    @Body() updates: Partial<AlertRule>
  ) {
    const success = this.monitoringService.updateAlertRule(id, updates);
    return { 
      success, 
      message: success ? 'Alert rule updated successfully' : 'Alert rule not found' 
    };
  }

  /**
   * Delete alert rule
   */
  @Delete('alerts/rules/:id')
  deleteAlertRule(@Param('id') id: string) {
    const success = this.monitoringService.removeAlertRule(id);
    return { 
      success, 
      message: success ? 'Alert rule deleted successfully' : 'Alert rule not found' 
    };
  }

  /**
   * Get recent alerts
   */
  @Get('alerts/history')
  getRecentAlerts() {
    return this.monitoringService.getRecentAlerts();
  }

  /**
   * Get system health
   */
  @Get('health')
  async getSystemHealth() {
    const metrics = this.monitoringService.getLatestMetrics();
    const perfStats = this.performanceMetricsService.getPerformanceStats();
    
    if (!metrics) {
      return {
        status: 'starting',
        message: 'Monitoring service is starting up'
      };
    }

    // Determine overall health based on key metrics
    const issues: string[] = [];
    
    if (metrics.performance.averageResponseTime > 2000) {
      issues.push('High response time');
    }
    
    if (metrics.performance.errorRate > 5) {
      issues.push('High error rate');
    }
    
    if (metrics.performance.cacheHitRate < 70) {
      issues.push('Low cache hit rate');
    }
    
    if (metrics.system.memoryUsage.heapUsed > 800 * 1024 * 1024) {
      issues.push('High memory usage');
    }

    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 2 ? 'warning' : 'critical';

    return {
      status,
      issues,
      timestamp: Date.now(),
      uptime: metrics.system.uptime,
      metrics: {
        responseTime: metrics.performance.averageResponseTime,
        errorRate: metrics.performance.errorRate,
        cacheHitRate: metrics.performance.cacheHitRate,
        memoryUsageMB: Math.round(metrics.system.memoryUsage.heapUsed / 1024 / 1024),
        activeConnections: metrics.performance.activeConnections,
        requestsPerSecond: metrics.performance.requestsPerSecond
      }
    };
  }

  /**
   * Trigger manual metrics collection (for testing)
   */
  @Post('metrics/collect')
  async triggerMetricsCollection() {
    // This would trigger immediate metrics collection
    return { message: 'Metrics collection triggered' };
  }
}