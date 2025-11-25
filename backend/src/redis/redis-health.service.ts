import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis Health & Recovery Service
 * Handles Redis connection issues with graceful degradation
 * Monitors Redis connectivity and provides fallback mechanisms
 */
@Injectable()
export class RedisHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisHealthService.name);
  private isConnected = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(private redis: Redis) {}

  async onModuleInit() {
    this.logger.log('🔍 Redis Health Service initializing...');
    await this.checkConnection();
    this.startHealthCheck();
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval!);
    }
  }

  private startHealthCheck() {
    // Health check every 10 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.checkConnection();
    }, 10000);
  }

  private async checkConnection(): Promise<void> {
    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        if (!this.isConnected) {
          this.logger.log('✅ Redis connection restored');
          this.isConnected = true;
        }
      }
    } catch (err: any) {
      if (this.isConnected) {
        this.logger.error(`⚠️  Redis connection lost: ${err.message}`);
        this.isConnected = false;
      }
    }
  }

  public async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (err: any) {
      this.logger.warn(`Redis health check failed: ${err.message}`);
      return false;
    }
  }

  public isConnectedNow(): boolean {
    return this.isConnected;
  }

  /**
   * Execute Redis operation with fallback for disconnections
   * If Redis fails, returns null/default value
   */
  public async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
  ): Promise<T> {
    try {
      return await operation();
    } catch (err: any) {
      this.logger.warn(`Redis operation failed, using fallback: ${err.message}`);
      return fallback;
    }
  }
}
