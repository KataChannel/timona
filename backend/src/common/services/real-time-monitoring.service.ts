import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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
  duration: number; // seconds
  enabled: boolean;
  lastTriggered?: number;
}

@Injectable()
export class RealTimeMonitoringService implements OnModuleInit, OnModuleDestroy {
  private metricsInterval: NodeJS.Timeout;
  private alertsInterval: NodeJS.Timeout;
  private isCollectingMetrics = false;
  private latestMetrics: RealTimeMetricsData | null = null;
  
  // Alert system
  private alertRules: AlertRule[] = [
    {
      id: 'high-response-time',
      name: 'High Response Time',
      metric: 'averageResponseTime',
      operator: '>',
      threshold: 1000, // 1 second
      duration: 30,
      enabled: true
    },
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      metric: 'errorRate',
      operator: '>',
      threshold: 5, // 5%
      duration: 60,
      enabled: true
    },
    {
      id: 'low-cache-hit-rate',
      name: 'Low Cache Hit Rate',
      metric: 'cacheHitRate',
      operator: '<',
      threshold: 50, // 50%
      duration: 120,
      enabled: true
    },
    {
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      metric: 'memoryUsage.heapUsed',
      operator: '>',
      threshold: 500 * 1024 * 1024, // 500MB
      duration: 60,
      enabled: true
    }
  ];

  private alertHistory: Array<{
    ruleId: string;
    ruleName: string;
    value: number;
    threshold: number;
    timestamp: number;
    resolved?: number;
  }> = [];

  constructor(
    private readonly performanceMetricsService: PerformanceMetricsService,
    private readonly cacheService: AdvancedCacheService,
  ) {}

  async onModuleInit() {
    this.startMetricsCollection();
    this.startAlertMonitoring();
  }

  async onModuleDestroy() {
    this.stopMetricsCollection();
    if (this.alertsInterval) {
      clearInterval(this.alertsInterval);
    }
  }

  /**
   * Start collecting and storing metrics
   */
  private startMetricsCollection(): void {
    if (this.isCollectingMetrics) return;
    
    this.isCollectingMetrics = true;
    
    // Collect metrics every 5 seconds
    this.metricsInterval = setInterval(async () => {
      this.latestMetrics = await this.collectRealTimeMetrics();
    }, 5000);
  }

  /**
   * Stop collecting metrics
   */
  private stopMetricsCollection(): void {
    this.isCollectingMetrics = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  /**
   * Start alert monitoring
   */
  private startAlertMonitoring(): void {
    this.alertsInterval = setInterval(async () => {
      await this.checkAlertRules();
    }, 10000); // Check alerts every 10 seconds
  }

  /**
   * Collect comprehensive real-time metrics
   */
  private async collectRealTimeMetrics(): Promise<RealTimeMetricsData> {
    const performanceStats = this.performanceMetricsService.getPerformanceStats();
    const realTimeMetrics = this.performanceMetricsService.getRealTimeMetrics();
    const cacheStats = await this.cacheService.getStatistics();

    return {
      timestamp: Date.now(),
      performance: realTimeMetrics,
      system: {
        memoryUsage: performanceStats.systemMetrics.memoryUsage,
        uptime: performanceStats.systemMetrics.uptime,
        cpuUsage: process.cpuUsage()
      },
      cache: {
        hitRate: (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 || 0,
        operations: cacheStats.operations,
        size: cacheStats.totalSize,
        evictions: cacheStats.evictions
      },
      graphql: {
        queriesPerSecond: realTimeMetrics.requestsPerSecond,
        mutationsPerSecond: performanceStats.counters['graphql.mutations.total'] || 0,
        subscriptionsActive: performanceStats.counters['graphql.subscriptions.total'] || 0,
        complexityAverage: performanceStats.queryStats.averageComplexity
      }
    };
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): RealTimeMetricsData | null {
    return this.latestMetrics;
  }

  /**
   * Check alert rules and trigger alerts
   */
  private async checkAlertRules(): Promise<void> {
    if (this.alertRules.length === 0 || !this.latestMetrics) return;

    try {
      const now = Date.now();

      for (const rule of this.alertRules) {
        if (!rule.enabled) continue;

        const value = this.extractMetricValue(this.latestMetrics, rule.metric);
        if (value === undefined) continue;

        const isTriggered = this.evaluateAlertCondition(value, rule.operator, rule.threshold);

        if (isTriggered) {
          // Check if alert was recently triggered (avoid spam)
          if (!rule.lastTriggered || (now - rule.lastTriggered) > (rule.duration * 1000)) {
            await this.triggerAlert(rule, value);
          }
        }
      }
    } catch (error) {
      console.error('Error checking alert rules:', error);
    }
  }

  /**
   * Extract metric value from metrics data
   */
  private extractMetricValue(metricsData: RealTimeMetricsData, metricPath: string): number | undefined {
    const keys = metricPath.split('.');
    let value: any = metricsData;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return typeof value === 'number' ? value : undefined;
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      value,
      threshold: rule.threshold,
      timestamp: Date.now()
    };

    // Add to alert history
    this.alertHistory.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(0, 100);
    }

    // Update rule last triggered time
    rule.lastTriggered = alert.timestamp;

    console.warn(`ALERT TRIGGERED: ${rule.name} - Value: ${value}, Threshold: ${rule.threshold}`);
  }

  /**
   * Get recent alerts (last 24 hours)
   */
  getRecentAlerts() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.alertHistory.filter(alert => alert.timestamp > oneDayAgo);
  }

  /**
   * Public API methods for managing alerts
   */
  
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    return true;
  }

  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.alertRules.push(newRule);
    return newRule.id;
  }

  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.alertRules.splice(index, 1);
    return true;
  }

  /**
   * Get comprehensive monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    realTimeMetrics: RealTimeMetricsData;
    performanceStats: any;
    queryInsights: any;
    alertRules: AlertRule[];
    recentAlerts: any[];
  }> {
    const [realTimeMetrics, performanceStats, queryInsights] = await Promise.all([
      this.collectRealTimeMetrics(),
      this.performanceMetricsService.getPerformanceStats(),
      this.performanceMetricsService.getQueryInsights()
    ]);

    return {
      realTimeMetrics,
      performanceStats,
      queryInsights,
      alertRules: this.alertRules,
      recentAlerts: this.getRecentAlerts()
    };
  }

  /**
   * Get historical metrics for charts
   */
  async getHistoricalMetrics(timeRange: '1h' | '6h' | '24h' | '7d' = '1h'): Promise<{
    timestamps: number[];
    responseTime: number[];
    requestsPerSecond: number[];
    cacheHitRate: number[];
    errorRate: number[];
    memoryUsage: number[];
  }> {
    // This is a simplified implementation
    // In production, you would store metrics in a time-series database
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const range = ranges[timeRange];
    const points = timeRange === '7d' ? 168 : timeRange === '24h' ? 144 : 60; // Points to return
    const interval = range / points;
    
    const timestamps: number[] = [];
    const responseTime: number[] = [];
    const requestsPerSecond: number[] = [];
    const cacheHitRate: number[] = [];
    const errorRate: number[] = [];
    const memoryUsage: number[] = [];
    
    // Generate mock historical data (replace with real data from time-series DB)
    for (let i = 0; i < points; i++) {
      const timestamp = now - range + (i * interval);
      timestamps.push(timestamp);
      
      // Mock data with some realistic patterns
      const timeOfDay = new Date(timestamp).getHours();
      const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 17;
      const multiplier = isBusinessHours ? 1.5 : 0.8;
      
      responseTime.push(Math.random() * 200 * multiplier + 100);
      requestsPerSecond.push(Math.random() * 50 * multiplier + 10);
      cacheHitRate.push(Math.random() * 30 + 70); // 70-100%
      errorRate.push(Math.random() * 3); // 0-3%
      memoryUsage.push(Math.random() * 200 + 100); // MB
    }
    
    return {
      timestamps,
      responseTime,
      requestsPerSecond,
      cacheHitRate,
      errorRate,
      memoryUsage
    };
  }
}