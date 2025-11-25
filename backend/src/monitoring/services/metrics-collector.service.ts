import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as promClient from 'prom-client';
import * as os from 'os';
import * as process from 'process';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
  };
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    perSecond: number;
    errors: number;
    errorRate: number;
  };
  responses: {
    averageTime: number;
    p95Time: number;
    p99Time: number;
  };
  database: {
    connections: number;
    activeQueries: number;
    slowQueries: number;
    averageQueryTime: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    memory: number;
  };
}

export interface CustomMetrics {
  [key: string]: {
    value: number;
    unit: string;
    description: string;
    tags?: Record<string, string>;
  };
}

@Injectable()
export class MetricsCollectorService {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private readonly registry: promClient.Registry;
  
  // Prometheus metrics
  private readonly httpRequestsTotal: promClient.Counter<string>;
  private readonly httpRequestDuration: promClient.Histogram<string>;
  private readonly activeConnections: promClient.Gauge<string>;
  private readonly databaseQueries: promClient.Counter<string>;
  private readonly databaseQueryDuration: promClient.Histogram<string>;
  private readonly cacheOperations: promClient.Counter<string>;
  private readonly systemCpuUsage: promClient.Gauge;
  private readonly systemMemoryUsage: promClient.Gauge;
  private readonly customMetricsGauge: promClient.Gauge<string>;

  // Internal tracking
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private lastNetworkStats: any = null;
  private customMetrics: Map<string, CustomMetrics> = new Map();

  constructor() {
    // Initialize Prometheus registry
    this.registry = new promClient.Registry();
    promClient.collectDefaultMetrics({ register: this.registry });

    // Initialize custom metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry]
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.registry]
    });

    this.activeConnections = new promClient.Gauge({
      name: 'active_connections_total',
      help: 'Total number of active connections',
      labelNames: ['type'],
      registers: [this.registry]
    });

    this.databaseQueries = new promClient.Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
      registers: [this.registry]
    });

    this.databaseQueryDuration = new promClient.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry]
    });

    this.cacheOperations = new promClient.Counter({
      name: 'cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'result'],
      registers: [this.registry]
    });

    this.systemCpuUsage = new promClient.Gauge({
      name: 'system_cpu_usage_percent',
      help: 'System CPU usage percentage',
      registers: [this.registry]
    });

    this.systemMemoryUsage = new promClient.Gauge({
      name: 'system_memory_usage_bytes',
      help: 'System memory usage in bytes',
      registers: [this.registry]
    });

    this.customMetricsGauge = new promClient.Gauge({
      name: 'custom_metrics',
      help: 'Custom application metrics',
      labelNames: ['metric_name', 'unit'],
      registers: [this.registry]
    });

    this.logger.log('MetricsCollectorService initialized with Prometheus metrics');
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration / 1000);
    
    this.requestCount++;
    this.responseTimes.push(duration);
    
    if (statusCode >= 400) {
      this.errorCount++;
    }

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    isError: boolean = false
  ): void {
    this.databaseQueries.inc({ operation, table });
    this.databaseQueryDuration.observe({ operation, table }, duration / 1000);
    
    if (isError) {
      this.databaseQueries.inc({ operation: `${operation}_error`, table });
    }
  }

  /**
   * Record cache operation metrics
   */
  recordCacheOperation(operation: 'get' | 'set' | 'del', result: 'hit' | 'miss' | 'success'): void {
    this.cacheOperations.inc({ operation, result });
  }

  /**
   * Record active connections
   */
  setActiveConnections(type: string, count: number): void {
    this.activeConnections.set({ type }, count);
  }

  /**
   * Record custom metric
   */
  recordCustomMetric(
    name: string,
    value: number,
    unit: string = 'count',
    description: string = '',
    tags: Record<string, string> = {}
  ): void {
    const timestamp = new Date();
    const metricKey = `${timestamp.toISOString()}_${name}`;
    
    this.customMetrics.set(metricKey, {
      [name]: {
        value,
        unit,
        description,
        tags
      }
    });

    // Update Prometheus gauge
    this.customMetricsGauge.set({ metric_name: name, unit }, value);

    // Clean old custom metrics (keep last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [key] of this.customMetrics) {
      const keyTimestamp = new Date(key.split('_')[0]);
      if (keyTimestamp < oneHourAgo) {
        this.customMetrics.delete(key);
      }
    }
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Update Prometheus gauges
    this.systemCpuUsage.set(cpuUsage);
    this.systemMemoryUsage.set(usedMemory);

    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        used: usedMemory,
        free: freeMemory,
        total: totalMemory,
        usage: (usedMemory / totalMemory) * 100
      },
      disk: await this.getDiskUsage(),
      network: await this.getNetworkStats()
    };
  }

  /**
   * Get current application metrics
   */
  getApplicationMetrics(): ApplicationMetrics {
    const now = Date.now();
    const last5Minutes = this.responseTimes.filter(time => 
      now - time < 5 * 60 * 1000
    );

    const averageTime = last5Minutes.length > 0 
      ? last5Minutes.reduce((sum, time) => sum + time, 0) / last5Minutes.length
      : 0;

    const sortedTimes = [...last5Minutes].sort((a, b) => a - b);
    const p95Time = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

    return {
      timestamp: new Date(),
      requests: {
        total: this.requestCount,
        perSecond: last5Minutes.length / 300, // 5 minutes = 300 seconds
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
      },
      responses: {
        averageTime,
        p95Time,
        p99Time
      },
      database: {
        connections: 0, // Will be updated by database service
        activeQueries: 0,
        slowQueries: 0,
        averageQueryTime: 0
      },
      cache: {
        hitRate: 0, // Will be updated by cache service
        missRate: 0,
        evictions: 0,
        memory: 0
      }
    };
  }

  /**
   * Get all custom metrics
   */
  getCustomMetrics(): CustomMetrics[] {
    return Array.from(this.customMetrics.values());
  }

  /**
   * Get Prometheus metrics in text format
   */
  async getPrometheusMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.customMetrics.clear();
    this.registry.resetMetrics();
    this.logger.log('All metrics reset');
  }

  /**
   * Scheduled task to collect system metrics every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();
      this.logger.debug(`System metrics collected: CPU ${metrics.cpu.usage.toFixed(2)}%, Memory ${metrics.memory.usage.toFixed(2)}%`);
      
      // Store metrics for historical analysis
      this.recordCustomMetric('system_cpu_usage', metrics.cpu.usage, 'percent', 'System CPU usage');
      this.recordCustomMetric('system_memory_usage', metrics.memory.usage, 'percent', 'System memory usage');
    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime(startTime);
        
        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // microseconds
        const totalUsage = endUsage.user + endUsage.system;
        
        const cpuPercent = (totalUsage / totalTime) * 100;
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Get disk usage (simplified - in production, use proper disk monitoring)
   */
  private async getDiskUsage(): Promise<SystemMetrics['disk']> {
    // Simplified implementation - in production, use proper disk monitoring library
    const total = 1024 * 1024 * 1024 * 100; // 100GB mock
    const free = 1024 * 1024 * 1024 * 60;   // 60GB free mock
    const used = total - free;

    return {
      total,
      free,
      used,
      usage: (used / total) * 100
    };
  }

  /**
   * Get network statistics
   */
  private async getNetworkStats(): Promise<SystemMetrics['network']> {
    // Simplified implementation - in production, use proper network monitoring
    const networkInterfaces = os.networkInterfaces();
    let bytesReceived = 0;
    let bytesSent = 0;

    // This is a mock - real implementation would track actual network I/O
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
      if (interfaces && name !== 'lo') {
        bytesReceived += Math.floor(Math.random() * 1000000);
        bytesSent += Math.floor(Math.random() * 1000000);
      }
    }

    return { bytesReceived, bytesSent };
  }
}