import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisHealthService } from './redis-health.service';

const logger = new Logger('RedisModule');

const redisProvider = {
  provide: Redis,
  useFactory: async (configService: ConfigService) => {
    // Detect Docker environment
    const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
    
    // Use Docker Redis host/port if in Docker, otherwise use configured server
    const host = isDockerEnv
      ? configService.get('DOCKER_REDIS_HOST', 'redis')
      : configService.get('REDIS_HOST', '116.118.49.243');
    
    // Always use configured port from .env
    const portConfig = isDockerEnv
      ? configService.get('DOCKER_REDIS_PORT', '6379')
      : configService.get('REDIS_PORT', '12004');
    
    const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
    
    const password = configService.get('REDIS_PASSWORD');
    const db = configService.get('REDIS_DB', 0);
    
    logger.log(`[Redis] Connecting to Redis: host=${host}, port=${port}, dockerEnv=${isDockerEnv}`);
    
    const redis = new Redis({
      host,
      port,
      password,
      db,
      // Connection retry configuration - critical for resilience
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        if (times % 5 === 0) {
          logger.warn(`[Redis] Retry attempt ${times}, next delay ${delay}ms`);
        }
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          logger.warn(`[Redis] ${targetError} error, will reconnect`);
          return true;
        }
        return false;
      },
      // Connection settings
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      // Timeout settings
      connectTimeout: 10000,
      commandTimeout: 5000,
      // CRITICAL: Use lazy connect to prevent immediate crash
      lazyConnect: true,
    });

    // Set up error handlers - these should NOT crash the app
    redis.on('error', (err) => {
      logger.warn(`[Redis] Connection error: ${err.message}`);
      // Don't throw - just log and let retry strategy handle it
    });

    redis.on('connect', () => {
      logger.log('[Redis] ✅ Connected successfully');
    });

    redis.on('reconnecting', () => {
      logger.log('[Redis] 🔄 Attempting to reconnect...');
    });

    redis.on('ready', () => {
      logger.log('[Redis] ✅ Ready and accepting commands');
    });

    // Attempt initial connection with timeout
    // If it fails, the redis instance will keep retrying automatically
    try {
      logger.log('[Redis] Attempting initial connection...');
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn('[Redis] Initial connection attempt timeout (15s), will retry automatically...');
          resolve(); // Resolve to continue - redis will retry on its own
        }, 15000);

        redis.connect().then(() => {
          clearTimeout(timeout);
          logger.log('[Redis] ✅ Connected on first attempt!');
          resolve();
        }).catch((err) => {
          clearTimeout(timeout);
          logger.warn(`[Redis] Initial connection failed: ${err.message}, will retry automatically...`);
          resolve(); // Resolve anyway - let redis retry
        });
      });
    } catch (error) {
      logger.warn(`[Redis] Caught error during initialization: ${error.message}, continuing...`);
      // Continue anyway - redis will retry on demand
    }

    return redis;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisProvider, RedisHealthService],
  exports: [redisProvider, RedisHealthService],
})
export class RedisModule {}