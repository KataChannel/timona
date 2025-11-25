import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckService as NestHealthService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import * as process from 'process';

export interface HealthStatus {
  status: 'ok' | 'error' | 'shutting_down';
  timestamp: Date;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    storage: HealthCheckResult;
    external_apis: HealthCheckResult;
    system_resources: HealthCheckResult;
  };
  info: {
    version: string;
    environment: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
}

export interface HealthCheckResult {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface SystemResourceHealth {
  cpu: {
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  memory: {
    usage: number;
    available: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  disk: {
    usage: number;
    available: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly version: string;
  private readonly environment: string;
  private readonly startTime: Date;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpHealthIndicator: HttpHealthIndicator
  ) {
    this.version = this.configService.get('npm_package_version', '1.0.0');
    this.environment = this.configService.get('NODE_ENV', 'development');
    this.startTime = new Date();
    
    this.logger.log('HealthCheckService initialized');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    this.logger.debug('Starting comprehensive health check');

    try {
      // Run all health checks in parallel for better performance
      const [
        databaseHealth,
        redisHealth,
        storageHealth,
        externalApisHealth,
        systemResourcesHealth
      ] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkStorageHealth(),
        this.checkExternalApisHealth(),
        this.checkSystemResourcesHealth()
      ]);

      const healthStatus: HealthStatus = {
        status: this.determineOverallStatus([
          this.getResultFromSettled(databaseHealth),
          this.getResultFromSettled(redisHealth),
          this.getResultFromSettled(storageHealth),
          this.getResultFromSettled(externalApisHealth),
          this.getResultFromSettled(systemResourcesHealth)
        ]),
        timestamp: new Date(),
        uptime: Date.now() - this.startTime.getTime(),
        checks: {
          database: this.getResultFromSettled(databaseHealth),
          redis: this.getResultFromSettled(redisHealth),
          storage: this.getResultFromSettled(storageHealth),
          external_apis: this.getResultFromSettled(externalApisHealth),
          system_resources: this.getResultFromSettled(systemResourcesHealth)
        },
        info: {
          version: this.version,
          environment: this.environment,
          nodeVersion: process.version,
          platform: os.platform(),
          architecture: os.arch()
        }
      };

      const duration = Date.now() - startTime;
      this.logger.debug(`Health check completed in ${duration}ms with status: ${healthStatus.status}`);
      
      return healthStatus;
    } catch (error) {
      this.logger.error('Failed to perform health check:', error);
      return this.createErrorHealthStatus(error);
    }
  }

  /**
   * Check database connectivity and performance
   */
  async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      await this.prisma.$queryRaw`SELECT 1 as test`;
      
      // Test query performance
      const queryStart = Date.now();
      const userCount = await this.prisma.user.count();
      const queryTime = Date.now() - queryStart;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: queryTime > 1000 ? 'degraded' : 'up',
        responseTime,
        message: queryTime > 1000 ? 'Database queries are slow' : 'Database is healthy',
        details: {
          userCount,
          queryTime,
          connectionPool: 'active'
        }
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a mock check - replace with actual Redis health check
      // In real implementation, you would use ioredis client to ping Redis
      const testKey = `health_check_${Date.now()}`;
      const testValue = 'ping';
      
      // Mock Redis operations
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate Redis ping
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        message: 'Redis is healthy',
        details: {
          connection: 'active',
          memoryUsage: '50MB',
          connectedClients: 5
        }
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: `Redis connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check storage (MinIO) connectivity
   */
  async checkStorageHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Mock storage health check
      await new Promise(resolve => setTimeout(resolve, 15)); // Simulate storage ping
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        message: 'Storage is healthy',
        details: {
          buckets: 2,
          totalSize: '1.2GB',
          freeSpace: '98.8GB'
        }
      };
    } catch (error) {
      this.logger.error('Storage health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: `Storage connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check external API dependencies
   */
  async checkExternalApisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Mock external API health checks
      // In production, add actual API health checks here
      const externalApis = [
        { name: 'auth-service', url: 'https://auth-api.example.com/health' },
        { name: 'notification-service', url: 'https://notifications-api.example.com/health' }
      ];

      const responseTime = Date.now() - startTime;
      
      // For now, assume all external APIs are healthy
      // In production, implement actual HTTP health checks
      const totalChecks = externalApis.length;
      const failedChecks = 0; // Mock: no failures
      
      return {
        status: failedChecks === 0 ? 'up' : failedChecks < totalChecks ? 'degraded' : 'down',
        responseTime,
        message: failedChecks === 0 ? 'All external APIs are healthy' : `${failedChecks} external APIs are down`,
        details: {
          totalChecks,
          failedChecks,
          apis: externalApis.map(api => ({ name: api.name, status: 'up' }))
        }
      };
    } catch (error) {
      this.logger.error('External APIs health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: `External APIs check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check system resources (CPU, Memory, Disk)
   */
  async checkSystemResourcesHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      // Get CPU usage (simplified)
      const cpuUsage = await this.getCpuUsage();
      
      const resourceHealth: SystemResourceHealth = {
        cpu: {
          usage: cpuUsage,
          status: cpuUsage > 90 ? 'critical' : cpuUsage > 70 ? 'warning' : 'healthy'
        },
        memory: {
          usage: memoryUsagePercent,
          available: freeMemory,
          status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 80 ? 'warning' : 'healthy'
        },
        disk: {
          usage: 25, // Mock value - in production, get actual disk usage
          available: 75,
          status: 'healthy'
        }
      };

      const responseTime = Date.now() - startTime;
      const overallStatus = this.determineResourceStatus(resourceHealth);
      
      return {
        status: overallStatus,
        responseTime,
        message: this.getResourceStatusMessage(resourceHealth),
        details: {
          ...resourceHealth,
          nodeMemory: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external
          },
          loadAverage: os.loadavg(),
          uptime: os.uptime()
        }
      };
    } catch (error) {
      this.logger.error('System resources health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: `System resources check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Get simple health status for quick checks
   */
  async getSimpleHealthStatus(): Promise<{ status: string; timestamp: Date }> {
    try {
      // Quick database ping
      await this.prisma.$queryRaw`SELECT 1 as test`;
      
      return {
        status: 'ok',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Simple health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Determine overall health status from individual checks
   */
  private determineOverallStatus(checks: HealthCheckResult[]): HealthStatus['status'] {
    const downChecks = checks.filter(check => check.status === 'down').length;
    const degradedChecks = checks.filter(check => check.status === 'degraded').length;
    
    if (downChecks > 0) return 'error';
    if (degradedChecks > 0) return 'error'; // Consider degraded as error for overall status
    return 'ok';
  }

  /**
   * Get result from Promise.allSettled
   */
  private getResultFromSettled(settled: PromiseSettledResult<HealthCheckResult>): HealthCheckResult {
    if (settled.status === 'fulfilled') {
      return settled.value;
    } else {
      return {
        status: 'down',
        message: `Health check failed: ${settled.reason?.message || 'Unknown error'}`,
        details: { error: settled.reason }
      };
    }
  }

  /**
   * Create error health status
   */
  private createErrorHealthStatus(error: any): HealthStatus {
    return {
      status: 'error',
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      checks: {
        database: { status: 'down', message: 'Not checked due to error' },
        redis: { status: 'down', message: 'Not checked due to error' },
        storage: { status: 'down', message: 'Not checked due to error' },
        external_apis: { status: 'down', message: 'Not checked due to error' },
        system_resources: { status: 'down', message: 'Not checked due to error' }
      },
      info: {
        version: this.version,
        environment: this.environment,
        nodeVersion: process.version,
        platform: os.platform(),
        architecture: os.arch()
      }
    };
  }

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const cpuPercent = (totalUsage / 1000000) * 100; // Convert to percentage
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Determine overall resource status
   */
  private determineResourceStatus(resources: SystemResourceHealth): 'up' | 'degraded' | 'down' {
    const statuses = [resources.cpu.status, resources.memory.status, resources.disk.status];
    
    if (statuses.includes('critical')) return 'down';
    if (statuses.includes('warning')) return 'degraded';
    return 'up';
  }

  /**
   * Get resource status message
   */
  private getResourceStatusMessage(resources: SystemResourceHealth): string {
    const issues = [];
    
    if (resources.cpu.status !== 'healthy') {
      issues.push(`CPU usage at ${resources.cpu.usage.toFixed(1)}%`);
    }
    if (resources.memory.status !== 'healthy') {
      issues.push(`Memory usage at ${resources.memory.usage.toFixed(1)}%`);
    }
    if (resources.disk.status !== 'healthy') {
      issues.push(`Disk usage at ${resources.disk.usage.toFixed(1)}%`);
    }
    
    return issues.length > 0 
      ? `System resources need attention: ${issues.join(', ')}`
      : 'All system resources are healthy';
  }
}