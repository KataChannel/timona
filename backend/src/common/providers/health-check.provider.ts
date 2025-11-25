import { Injectable } from '@nestjs/common';
import { AdvancedCacheService } from '../services/advanced-cache.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealTimeMonitoringService } from '../services/real-time-monitoring.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      latency?: number;
      message?: string;
      details?: any;
    };
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

@Injectable()
export class HealthCheckProvider {
  constructor(
    private readonly cacheService: AdvancedCacheService,
    private readonly prismaService: PrismaService,
    private readonly monitoringService: RealTimeMonitoringService,
    private readonly performanceService: PerformanceMetricsService,
  ) {}

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = Date.now();
    const checks: HealthCheckResult['checks'] = {};

    // Run all health checks in parallel
    const [
      databaseCheck,
      cacheCheck,
      memoryCheck,
      performanceCheck,
      monitoringCheck
    ] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkMemory(),
      this.checkPerformance(),
      this.checkMonitoring()
    ]);

    // Process results
    this.processCheckResult(checks, 'database', databaseCheck);
    this.processCheckResult(checks, 'cache', cacheCheck);
    this.processCheckResult(checks, 'memory', memoryCheck);
    this.processCheckResult(checks, 'performance', performanceCheck);
    this.processCheckResult(checks, 'monitoring', monitoringCheck);

    // Calculate summary
    const summary = this.calculateSummary(checks);
    const overallStatus = this.determineOverallStatus(summary);

    return {
      status: overallStatus,
      timestamp,
      checks,
      summary
    };
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<{
    status: 'pass' | 'fail' | 'warn';
    latency: number;
    message?: string;
    details?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await this.prismaService.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;
      
      // Test a simple query to tasks table
      const taskCount = await this.prismaService.task.count();
      
      const totalLatency = Date.now() - startTime;
      
      if (totalLatency > 1000) {
        return {
          status: 'warn',
          latency: totalLatency,
          message: 'Database response time is slow',
          details: { taskCount, queryLatency: totalLatency }
        };
      }
      
      return {
        status: 'pass',
        latency: totalLatency,
        details: { taskCount, connected: true }
      };
      
    } catch (error) {
      return {
        status: 'fail',
        latency: Date.now() - startTime,
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check cache system health
   */
  private async checkCache(): Promise<{
    status: 'pass' | 'fail' | 'warn';
    latency: number;
    message?: string;
    details?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Test cache write/read cycle
      const testKey = `health-check-${Date.now()}`;
      const testValue = { timestamp: Date.now(), test: true };
      
      await this.cacheService.set(testKey, testValue, { ttl: 30000 }); // 30 seconds
      const retrieved = await this.cacheService.get(testKey);
      await this.cacheService.delete(testKey); // Cleanup
      
      const latency = Date.now() - startTime;
      
      if (!retrieved || (retrieved as any).test !== testValue.test) {
        return {
          status: 'fail',
          latency,
          message: 'Cache read/write test failed',
          details: { testKey, expected: testValue, actual: retrieved }
        };
      }
      
      // Get cache statistics
      const stats = await this.cacheService.getStatistics();
      const hitRate = (stats.hits / (stats.hits + stats.misses)) * 100 || 0;
      
      if (hitRate < 50) {
        return {
          status: 'warn',
          latency,
          message: 'Cache hit rate is low',
          details: { hitRate, ...stats }
        };
      }
      
      return {
        status: 'pass',
        latency,
        details: { hitRate, ...stats }
      };
      
    } catch (error) {
      return {
        status: 'fail',
        latency: Date.now() - startTime,
        message: `Cache system error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<{
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    details?: any;
  }> {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    const details = {
      heapUsedMB: Math.round(heapUsedMB * 100) / 100,
      heapTotalMB: Math.round(heapTotalMB * 100) / 100,
      heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
    };
    
    if (heapUsedMB > 1024) { // 1GB
      return {
        status: 'fail',
        message: 'Memory usage is critically high',
        details
      };
    }
    
    if (heapUsedMB > 512) { // 512MB
      return {
        status: 'warn',
        message: 'Memory usage is high',
        details
      };
    }
    
    return {
      status: 'pass',
      details
    };
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<{
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    details?: any;
  }> {
    try {
      const performanceStats = this.performanceService.getPerformanceStats();
      const realTimeMetrics = this.performanceService.getRealTimeMetrics();
      
      const details = {
        averageResponseTime: realTimeMetrics.averageResponseTime,
        requestsPerSecond: realTimeMetrics.requestsPerSecond,
        errorRate: realTimeMetrics.errorRate,
        cacheHitRate: realTimeMetrics.cacheHitRate,
        totalQueries: performanceStats.queryStats.totalQueries
      };
      
      // Check error rate
      if (realTimeMetrics.errorRate > 10) {
        return {
          status: 'fail',
          message: 'Error rate is critically high',
          details
        };
      }
      
      // Check response time
      if (realTimeMetrics.averageResponseTime > 2000) {
        return {
          status: 'fail',
          message: 'Response time is critically slow',
          details
        };
      }
      
      if (realTimeMetrics.errorRate > 5 || realTimeMetrics.averageResponseTime > 1000) {
        return {
          status: 'warn',
          message: 'Performance metrics are degraded',
          details
        };
      }
      
      return {
        status: 'pass',
        details
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Performance check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check monitoring system
   */
  private async checkMonitoring(): Promise<{
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    details?: any;
  }> {
    try {
      const latestMetrics = this.monitoringService.getLatestMetrics();
      const recentAlerts = this.monitoringService.getRecentAlerts();
      
      if (!latestMetrics) {
        return {
          status: 'warn',
          message: 'No recent metrics available',
          details: { lastUpdate: 'never' }
        };
      }
      
      const metricsAge = Date.now() - latestMetrics.timestamp;
      const details = {
        lastUpdate: new Date(latestMetrics.timestamp).toISOString(),
        metricsAge,
        recentAlerts: recentAlerts.length,
        systemUptime: latestMetrics.system.uptime
      };
      
      // Check if metrics are stale
      if (metricsAge > 300000) { // 5 minutes
        return {
          status: 'warn',
          message: 'Metrics data is stale',
          details
        };
      }
      
      // Check for critical alerts
      const criticalAlerts = recentAlerts.filter(alert => 
        alert.ruleName.toLowerCase().includes('critical') ||
        alert.ruleName.toLowerCase().includes('high')
      );
      
      if (criticalAlerts.length > 0) {
        return {
          status: 'warn',
          message: `${criticalAlerts.length} critical alerts active`,
          details: { ...details, criticalAlerts: criticalAlerts.length }
        };
      }
      
      return {
        status: 'pass',
        details
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Monitoring check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Process check result from Promise.allSettled
   */
  private processCheckResult(
    checks: HealthCheckResult['checks'],
    checkName: string,
    result: PromiseSettledResult<any>
  ): void {
    if (result.status === 'fulfilled') {
      checks[checkName] = result.value;
    } else {
      checks[checkName] = {
        status: 'fail',
        message: `Health check failed: ${result.reason?.message || 'Unknown error'}`,
        details: { error: result.reason }
      };
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(checks: HealthCheckResult['checks']): HealthCheckResult['summary'] {
    const total = Object.keys(checks).length;
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    Object.values(checks).forEach(check => {
      switch (check.status) {
        case 'pass':
          passed++;
          break;
        case 'fail':
          failed++;
          break;
        case 'warn':
          warnings++;
          break;
      }
    });
    
    return { total, passed, failed, warnings };
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(summary: HealthCheckResult['summary']): 'healthy' | 'degraded' | 'unhealthy' {
    if (summary.failed > 0) {
      return 'unhealthy';
    }
    
    if (summary.warnings > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Get quick health status (for load balancers)
   */
  async getQuickHealthStatus(): Promise<{ status: string; timestamp: number }> {
    try {
      // Quick database ping
      await this.prismaService.$queryRaw`SELECT 1`;
      
      // Quick memory check
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > 1024) {
        return { status: 'unhealthy', timestamp: Date.now() };
      }
      
      return { status: 'healthy', timestamp: Date.now() };
      
    } catch (error) {
      return { status: 'unhealthy', timestamp: Date.now() };
    }
  }

  /**
   * Get readiness status (for Kubernetes)
   */
  async getReadinessStatus(): Promise<{ ready: boolean; timestamp: number; details?: any }> {
    try {
      // Check if all critical services are ready
      const [dbReady, cacheReady] = await Promise.all([
        this.isDatabaseReady(),
        this.isCacheReady()
      ]);
      
      const ready = dbReady && cacheReady;
      
      return {
        ready,
        timestamp: Date.now(),
        details: {
          database: dbReady,
          cache: cacheReady
        }
      };
      
    } catch (error) {
      return {
        ready: false,
        timestamp: Date.now(),
        details: { error: error.message }
      };
    }
  }

  /**
   * Check if database is ready
   */
  private async isDatabaseReady(): Promise<boolean> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if cache is ready
   */
  private async isCacheReady(): Promise<boolean> {
    try {
      const stats = await this.cacheService.getStatistics();
      return stats !== null;
    } catch {
      return false;
    }
  }
}