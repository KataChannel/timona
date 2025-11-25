import { Injectable, OnModuleInit } from '@nestjs/common';
import { performance } from 'perf_hooks';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: { [key: string]: string };
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

@Injectable()
export class PerformanceMetricsService implements OnModuleInit {
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryPerformanceData[] = [];
  private readonly maxMetricsInMemory = 10000;
  private readonly maxQueryMetrics = 5000;

  // Performance counters
  private counters: { [key: string]: number } = {
    'graphql.queries.total': 0,
    'graphql.mutations.total': 0,
    'graphql.subscriptions.total': 0,
    'graphql.errors.total': 0,
    'cache.hits.total': 0,
    'cache.misses.total': 0,
    'database.queries.total': 0,
    'auth.logins.total': 0,
    'auth.failures.total': 0,
  };

  // Histogram buckets for response times
  private histograms: { [key: string]: number[] } = {
    'graphql.response_time': [],
    'database.query_time': [],
    'cache.operation_time': [],
  };

  async onModuleInit() {
    // Setup periodic metrics collection
    setInterval(() => this.collectSystemMetrics(), 30000); // Every 30 seconds
    setInterval(() => this.cleanupOldMetrics(), 300000);   // Every 5 minutes
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || Date.now()
    });

    // Keep metrics array size under control
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetricsInMemory * 0.8));
    }
  }

  /**
   * Record GraphQL query performance
   */
  recordQueryPerformance(data: QueryPerformanceData): void {
    this.queryMetrics.push(data);

    // Update counters
    this.incrementCounter('graphql.queries.total');
    
    if (data.cacheHit) {
      this.incrementCounter('cache.hits.total');
    } else {
      this.incrementCounter('cache.misses.total');
    }

    // Record response time histogram
    this.recordHistogram('graphql.response_time', data.duration);

    // Keep query metrics under control
    if (this.queryMetrics.length > this.maxQueryMetrics) {
      this.queryMetrics = this.queryMetrics.slice(-Math.floor(this.maxQueryMetrics * 0.8));
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value: number = 1): void {
    this.counters[name] = (this.counters[name] || 0) + value;
  }

  /**
   * Record histogram value
   */
  recordHistogram(name: string, value: number): void {
    if (!this.histograms[name]) {
      this.histograms[name] = [];
    }
    
    this.histograms[name].push(value);
    
    // Keep histogram size manageable
    if (this.histograms[name].length > 1000) {
      this.histograms[name] = this.histograms[name].slice(-800);
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(operationName: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name: `operation.${operationName}.duration`,
        value: duration,
        timestamp: Date.now(),
        unit: 'ms'
      });
      return duration;
    };
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(
    operationName: string, 
    operation: () => Promise<T>,
    tags?: { [key: string]: string }
  ): Promise<T> {
    const endTiming = this.startTiming(operationName);
    
    try {
      const result = await operation();
      const duration = endTiming();
      
      this.recordMetric({
        name: `${operationName}.success`,
        value: duration,
        timestamp: Date.now(),
        tags: { ...tags, status: 'success' },
        unit: 'ms'
      });
      
      return result;
    } catch (error) {
      const duration = endTiming();
      
      this.recordMetric({
        name: `${operationName}.error`,
        value: duration,
        timestamp: Date.now(),
        tags: { ...tags, status: 'error', error: error.message },
        unit: 'ms'
      });
      
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    counters: { [key: string]: number };
    averageResponseTimes: { [key: string]: number };
    percentiles: { [key: string]: { p50: number; p95: number; p99: number } };
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
  } {
    const stats = {
      counters: { ...this.counters },
      averageResponseTimes: this.calculateAverageResponseTimes(),
      percentiles: this.calculatePercentiles(),
      queryStats: this.getQueryStats(),
      systemMetrics: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    return stats;
  }

  /**
   * Get real-time metrics (last minute)
   */
  getRealTimeMetrics(): {
    activeConnections: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  } {
    const oneMinuteAgo = Date.now() - 60000;
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneMinuteAgo);
    const recentQueries = this.queryMetrics.filter(q => 
      (q as any).timestamp ? (q as any).timestamp > oneMinuteAgo : true
    );

    const requestsPerSecond = recentQueries.length / 60;
    const averageResponseTime = recentQueries.length > 0
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
      : 0;

    const cacheHits = recentQueries.filter(q => q.cacheHit).length;
    const cacheHitRate = recentQueries.length > 0
      ? (cacheHits / recentQueries.length) * 100
      : 0;

    // Mock active connections (would be real in production)
    const activeConnections = Math.floor(Math.random() * 50) + 10;

    // Calculate error rate from recent metrics
    const errorMetrics = recentMetrics.filter(m => m.name.includes('error'));
    const totalRequests = recentQueries.length;
    const errorRate = totalRequests > 0 ? (errorMetrics.length / totalRequests) * 100 : 0;

    return {
      activeConnections,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Get query performance insights
   */
  getQueryInsights(): {
    slowestQueries: QueryPerformanceData[];
    mostFrequentQueries: { queryHash: string; count: number; avgDuration: number }[];
    cacheEfficiency: { operation: string; hitRate: number }[];
    complexityAnalysis: { high: number; medium: number; low: number };
  } {
    const queryGroups: { [key: string]: QueryPerformanceData[] } = {};
    
    // Group queries by hash
    this.queryMetrics.forEach(query => {
      if (!queryGroups[query.queryHash]) {
        queryGroups[query.queryHash] = [];
      }
      queryGroups[query.queryHash].push(query);
    });

    // Most frequent queries
    const mostFrequentQueries = Object.entries(queryGroups)
      .map(([queryHash, queries]) => ({
        queryHash,
        count: queries.length,
        avgDuration: queries.reduce((sum, q) => sum + q.duration, 0) / queries.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Slowest queries
    const slowestQueries = [...this.queryMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Cache efficiency by operation
    const operationGroups: { [key: string]: { hits: number; total: number } } = {};
    this.queryMetrics.forEach(query => {
      const operation = query.operationName || 'unknown';
      if (!operationGroups[operation]) {
        operationGroups[operation] = { hits: 0, total: 0 };
      }
      operationGroups[operation].total++;
      if (query.cacheHit) {
        operationGroups[operation].hits++;
      }
    });

    const cacheEfficiency = Object.entries(operationGroups)
      .map(([operation, data]) => ({
        operation,
        hitRate: data.total > 0 ? (data.hits / data.total) * 100 : 0
      }))
      .sort((a, b) => b.hitRate - a.hitRate);

    // Complexity analysis
    const complexityAnalysis = this.queryMetrics
      .filter(q => q.complexity !== undefined)
      .reduce(
        (acc, q) => {
          if (q.complexity! > 100) acc.high++;
          else if (q.complexity! > 50) acc.medium++;
          else acc.low++;
          return acc;
        },
        { high: 0, medium: 0, low: 0 }
      );

    return {
      slowestQueries,
      mostFrequentQueries,
      cacheEfficiency,
      complexityAnalysis
    };
  }

  private calculateAverageResponseTimes(): { [key: string]: number } {
    const averages: { [key: string]: number } = {};
    
    Object.entries(this.histograms).forEach(([name, values]) => {
      if (values.length > 0) {
        averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    return averages;
  }

  private calculatePercentiles(): { [key: string]: { p50: number; p95: number; p99: number } } {
    const percentiles: { [key: string]: { p50: number; p95: number; p99: number } } = {};
    
    Object.entries(this.histograms).forEach(([name, values]) => {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const length = sorted.length;
        
        percentiles[name] = {
          p50: sorted[Math.floor(length * 0.5)],
          p95: sorted[Math.floor(length * 0.95)],
          p99: sorted[Math.floor(length * 0.99)]
        };
      }
    });
    
    return percentiles;
  }

  private getQueryStats(): {
    totalQueries: number;
    averageComplexity: number;
    cacheHitRate: number;
    slowestQueries: QueryPerformanceData[];
  } {
    const totalQueries = this.queryMetrics.length;
    const cacheHits = this.queryMetrics.filter(q => q.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    
    const complexities = this.queryMetrics
      .filter(q => q.complexity !== undefined)
      .map(q => q.complexity!);
    const averageComplexity = complexities.length > 0
      ? complexities.reduce((sum, c) => sum + c, 0) / complexities.length
      : 0;

    const slowestQueries = [...this.queryMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      totalQueries,
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      slowestQueries
    };
  }

  private async collectSystemMetrics(): Promise<void> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Record system metrics
    this.recordMetric({
      name: 'system.memory.heap_used',
      value: memoryUsage.heapUsed,
      timestamp: Date.now(),
      unit: 'bytes'
    });

    this.recordMetric({
      name: 'system.memory.heap_total',
      value: memoryUsage.heapTotal,
      timestamp: Date.now(),
      unit: 'bytes'
    });

    this.recordMetric({
      name: 'system.uptime',
      value: uptime,
      timestamp: Date.now(),
      unit: 'ms'
    });
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 3600000; // 1 hour ago
    
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    // Keep only recent query metrics
    const tenMinutesAgo = Date.now() - 600000; // 10 minutes ago
    this.queryMetrics = this.queryMetrics.filter(q => 
      (q as any).timestamp ? (q as any).timestamp > tenMinutesAgo : true
    );
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(): string {
    let output = '';
    
    // Counters
    Object.entries(this.counters).forEach(([name, value]) => {
      output += `# TYPE ${name.replace(/\./g, '_')} counter\n`;
      output += `${name.replace(/\./g, '_')} ${value}\n`;
    });
    
    // Histograms
    Object.entries(this.histograms).forEach(([name, values]) => {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const metricName = name.replace(/\./g, '_');
        
        output += `# TYPE ${metricName} histogram\n`;
        output += `${metricName}_count ${values.length}\n`;
        output += `${metricName}_sum ${values.reduce((sum, val) => sum + val, 0)}\n`;
        
        // Add percentile buckets
        const percentiles = [0.5, 0.9, 0.95, 0.99];
        percentiles.forEach(p => {
          const index = Math.floor(sorted.length * p);
          output += `${metricName}_bucket{le="${p}"} ${sorted[index] || 0}\n`;
        });
      }
    });
    
    return output;
  }
}