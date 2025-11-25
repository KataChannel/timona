import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    super();
    
    // Detect Docker environment
    const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
    
    // Use Docker Redis host/port if in Docker, otherwise use configured server
    const host = isDockerEnv
      ? this.configService.get('DOCKER_REDIS_HOST', 'redis')
      : this.configService.get('REDIS_HOST', '116.118.49.243');
    
    const portConfig = isDockerEnv
      ? this.configService.get('DOCKER_REDIS_PORT', '6379')
      : this.configService.get('REDIS_PORT', '12004');
    
    const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
    
    // Create Redis connection for health checks
    this.redis = new Redis({
      host,
      port,
      password: this.configService.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test Redis connection with ping
      const result = await this.redis.ping();
      
      if (result === 'PONG') {
        return this.getStatus(key, true, {
          redis: 'up',
          message: 'Redis connection is healthy',
          ping: result,
        });
      } else {
        throw new Error(`Unexpected ping response: ${result}`);
      }
    } catch (error) {
      const result = this.getStatus(key, false, {
        redis: 'down',
        message: error.message,
      });
      
      throw new HealthCheckError('Redis health check failed', result);
    }
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
  }
}
