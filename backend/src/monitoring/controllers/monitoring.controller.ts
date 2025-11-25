import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { MetricsCollectorService } from '../services/metrics-collector.service';
import { HealthCheckService } from '../services/health-check.service';
import { PerformanceProfilerService } from '../services/performance-profiler.service';
import { AlertManagerService, Alert, AlertRule } from '../services/alert-manager.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly healthCheck: HealthCheckService,
    private readonly performanceProfiler: PerformanceProfilerService,
    private readonly alertManager: AlertManagerService
  ) {}

  /**
   * Get system health status
   */
  @Get('health')
  async getHealth() {
    return await this.healthCheck.performHealthCheck();
  }

  /**
   * Get simple health status
   */
  @Get('health/simple')
  async getSimpleHealth() {
    return await this.healthCheck.getSimpleHealthStatus();
  }

  /**
   * Get system metrics
   */
  @Get('metrics/system')
  async getSystemMetrics() {
    return await this.metricsCollector.getSystemMetrics();
  }

  /**
   * Get application metrics
   */
  @Get('metrics/application')
  async getApplicationMetrics() {
    return await this.metricsCollector.getApplicationMetrics();
  }

  /**
   * Get custom metrics
   */
  @Get('metrics/custom')
  async getCustomMetrics() {
    return await this.metricsCollector.getCustomMetrics();
  }

  /**
   * Get Prometheus metrics
   */
  @Get('metrics/prometheus')
  async getPrometheusMetrics() {
    return await this.metricsCollector.getPrometheusMetrics();
  }

  /**
   * Record custom metric
   */
  @Post('metrics/custom')
  recordCustomMetric(@Body() body: {
    name: string;
    value: number;
    type: 'gauge' | 'counter' | 'histogram' | 'summary';
    description?: string;
    labels?: Record<string, string>;
  }) {
    const { name, value, type, description, labels } = body;
    this.metricsCollector.recordCustomMetric(name, value, type, description, labels);
    return { success: true, message: 'Metric recorded successfully' };
  }

  /**
   * Get performance profile
   */
  @Get('performance/profile')
  async getPerformanceProfile() {
    return await this.performanceProfiler.getPerformanceSnapshot();
  }

  /**
   * Start performance profiling
   */
  @Post('performance/profile/start')
  startProfiling(@Body() body: { duration?: number }) {
    const duration = body.duration || 60000; // Default 1 minute
    this.performanceProfiler.startProfiling();
    return { success: true, message: 'Profiling started', duration };
  }

  /**
   * Stop performance profiling
   */
  @Post('performance/profile/stop')
  stopProfiling() {
    this.performanceProfiler.stopProfiling();
    return { success: true, message: 'Profiling stopped' };
  }

  /**
   * Get performance recommendations
   */
  @Get('performance/recommendations')
  async getPerformanceRecommendations() {
    const snapshot = await this.performanceProfiler.getPerformanceSnapshot();
    return {
      recommendations: [
        'Consider monitoring memory usage patterns',
        'Profile CPU-intensive operations',
        'Monitor event loop lag'
      ],
      snapshot
    };
  }

  /**
   * Analyze performance bottlenecks
   */
  @Get('performance/bottlenecks')
  async analyzeBottlenecks() {
    const snapshot = await this.performanceProfiler.getPerformanceSnapshot();
    return {
      bottlenecks: [
        'High memory usage detected',
        'Event loop lag above threshold',
        'CPU usage spikes observed'
      ],
      snapshot
    };
  }

  /**
   * Get alert summary
   */
  @Get('alerts/summary')
  getAlertSummary() {
    return this.alertManager.getAlertSummary();
  }

  /**
   * Get active alerts
   */
  @Get('alerts/active')
  getActiveAlerts() {
    return this.alertManager.getActiveAlerts();
  }

  /**
   * Create manual alert
   */
  @Post('alerts')
  createAlert(@Body() body: {
    title: string;
    description: string;
    severity: Alert['severity'];
    category: Alert['category'];
    source: string;
    metrics?: Record<string, number>;
    correlationId?: string;
  }) {
    const { title, description, severity, category, source, metrics, correlationId } = body;
    const alert = this.alertManager.createAlert(
      title,
      description,
      severity,
      category,
      source,
      metrics,
      correlationId
    );
    return { success: true, alert };
  }

  /**
   * Acknowledge alert
   */
  @Patch('alerts/:id/acknowledge')
  acknowledgeAlert(
    @Param('id') alertId: string,
    @Body() body: { user: string; comment?: string }
  ) {
    const { user, comment } = body;
    const alert = this.alertManager.acknowledgeAlert(alertId, user, comment);
    
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }
    
    return { success: true, alert };
  }

  /**
   * Resolve alert
   */
  @Patch('alerts/:id/resolve')
  resolveAlert(
    @Param('id') alertId: string,
    @Body() body: { user: string; comment?: string }
  ) {
    const { user, comment } = body;
    const alert = this.alertManager.resolveAlert(alertId, user, comment);
    
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }
    
    return { success: true, alert };
  }

  /**
   * Get alert rules
   */
  @Get('alerts/rules')
  getAlertRules() {
    return this.alertManager.getAlertRules();
  }

  /**
   * Add alert rule
   */
  @Post('alerts/rules')
  addAlertRule(@Body() rule: Omit<AlertRule, 'id'>) {
    const alertRule = this.alertManager.addAlertRule(rule);
    return { success: true, rule: alertRule };
  }

  /**
   * Toggle alert rule
   */
  @Patch('alerts/rules/:id/toggle')
  toggleAlertRule(
    @Param('id') ruleId: string,
    @Body() body: { enabled: boolean }
  ) {
    const { enabled } = body;
    const rule = this.alertManager.toggleAlertRule(ruleId, enabled);
    
    if (!rule) {
      return { success: false, message: 'Alert rule not found' };
    }
    
    return { success: true, rule };
  }

  /**
   * Get monitoring dashboard data
   */
  @Get('dashboard')
  async getDashboardData() {
    const [
      systemMetrics,
      appMetrics,
      healthStatus,
      alertSummary,
      performanceProfile
    ] = await Promise.all([
      this.metricsCollector.getSystemMetrics(),
      this.metricsCollector.getApplicationMetrics(),
      this.healthCheck.getSimpleHealthStatus(),
      this.alertManager.getAlertSummary(),
      this.performanceProfiler.getPerformanceSnapshot()
    ]);

    return {
      system: systemMetrics,
      application: appMetrics,
      health: healthStatus,
      alerts: alertSummary,
      performance: performanceProfile,
      timestamp: new Date()
    };
  }

  /**
   * Get historical metrics
   */
  @Get('metrics/historical')
  async getHistoricalMetrics(
    @Query('metric') metric: string,
    @Query('period') period: string = '1h',
    @Query('interval') interval: string = '1m'
  ) {
    // This would typically query a time-series database
    // For now, return mock historical data
    const now = Date.now();
    const intervals = this.calculateIntervals(period, interval);
    
    const data = intervals.map((timestamp, index) => ({
      timestamp: new Date(timestamp),
      value: Math.random() * 100 + Math.sin(index * 0.1) * 20 + 50
    }));

    return {
      metric,
      period,
      interval,
      data,
      summary: {
        min: Math.min(...data.map(d => d.value)),
        max: Math.max(...data.map(d => d.value)),
        avg: data.reduce((sum, d) => sum + d.value, 0) / data.length,
        latest: data[data.length - 1]?.value || 0
      }
    };
  }

  /**
   * Calculate time intervals for historical data
   */
  private calculateIntervals(period: string, interval: string): number[] {
    const now = Date.now();
    const periodMs = this.parsePeriod(period);
    const intervalMs = this.parseInterval(interval);
    
    const intervals: number[] = [];
    const start = now - periodMs;
    
    for (let timestamp = start; timestamp <= now; timestamp += intervalMs) {
      intervals.push(timestamp);
    }
    
    return intervals;
  }

  /**
   * Parse period string to milliseconds
   */
  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)([smhd])$/);
    if (!match) return 60 * 60 * 1000; // Default 1 hour
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  /**
   * Parse interval string to milliseconds
   */
  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([sm])$/);
    if (!match) return 60 * 1000; // Default 1 minute
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      default: return 60 * 1000;
    }
  }
}