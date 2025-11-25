import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

export interface GraphQLCacheOptions {
  ttl: number;
  keyPrefix: string;
}

@Injectable()
export class GraphQLCacheService {
  private readonly defaultTTL = 30000; // 30 seconds
  private readonly keyPrefix = 'gql:';

  constructor(
    @Inject(Redis) private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {}

  /**
   * Add key prefix for GraphQL cache keys
   */
  private addPrefix(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Generate cache key for GraphQL query
   */
  generateCacheKey(
    query: string,
    variables: any,
    operationName: string | undefined,
    userId: string = 'anonymous'
  ): string {
    const queryHash = crypto
      .createHash('sha256')
      .update(query.replace(/\s+/g, ' ').trim())
      .digest('hex')
      .substring(0, 16);
    
    const variablesHash = variables && Object.keys(variables).length > 0
      ? crypto.createHash('sha256').update(JSON.stringify(variables)).digest('hex').substring(0, 8)
      : 'novars';
    
    const operationPart = operationName ? `op:${operationName}` : 'noop';
    
    return `${queryHash}:${variablesHash}:${operationPart}:u:${userId}`;
  }

  /**
   * Get cached result for query
   */
  async getCachedResult(cacheKey: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(this.addPrefix(cacheKey));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Redis cache get error:', error);
      return null;
    }
  }

  /**
   * Cache query result
   */
  async setCachedResult(
    cacheKey: string,
    result: any,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      // Don't cache if there are errors
      if (result.errors && result.errors.length > 0) {
        return;
      }

      await this.redis.setex(
        this.addPrefix(cacheKey),
        Math.floor(ttl / 1000), // Convert to seconds
        JSON.stringify(result)
      );
    } catch (error) {
      console.warn('Redis cache set error:', error);
    }
  }

  /**
   * Get TTL based on query type
   */
  getTTLForQuery(query: string): number {
    const queryLower = query.toLowerCase();
    
    // User profile data - cache longer
    if (queryLower.includes('getme') || queryLower.includes('getuserbyid')) {
      return 300000; // 5 minutes
    }
    
    // Task lists - medium cache
    if (queryLower.includes('gettasks') || queryLower.includes('getsharedtasks')) {
      return 60000; // 1 minute
    }
    
    // Individual task - shorter cache since it might change
    if (queryLower.includes('gettaskbyid')) {
      return 30000; // 30 seconds
    }
    
    // Comments and media - shorter cache
    if (queryLower.includes('comments') || queryLower.includes('media')) {
      return 15000; // 15 seconds
    }
    
    // Real-time data - very short cache
    if (queryLower.includes('notification') || queryLower.includes('activity')) {
      return 5000; // 5 seconds
    }
    
    return this.defaultTTL;
  }

  /**
   * Check if query should be cached
   */
  shouldCacheQuery(query: string): boolean {
    const queryLower = query.trim().toLowerCase();
    
    // Don't cache mutations
    if (queryLower.startsWith('mutation')) {
      return false;
    }
    
    // Don't cache subscriptions
    if (queryLower.startsWith('subscription')) {
      return false;
    }
    
    // Don't cache introspection queries
    if (queryLower.includes('__schema') || queryLower.includes('__type')) {
      return false;
    }
    
    // Don't cache admin queries that need real-time data
    if (queryLower.includes('getusers') || queryLower.includes('getallusers')) {
      return false;
    }
    
    return true;
  }

  /**
   * Clear cache by pattern
   */
  async clearCacheByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*${pattern}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis cache clear error:', error);
    }
  }

  /**
   * Clear cache for specific user
   */
  async clearUserCache(userId: string): Promise<void> {
    await this.clearCacheByPattern(`u:${userId}`);
  }

  /**
   * Clear task-related cache
   */
  async clearTaskCache(): Promise<void> {
    await this.clearCacheByPattern('gettasks');
    await this.clearCacheByPattern('gettaskbyid');
    await this.clearCacheByPattern('getsharedtasks');
  }

  /**
   * Clear comment-related cache
   */
  async clearCommentCache(): Promise<void> {
    await this.clearCacheByPattern('comment');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      
      return {
        totalKeys: keys.length,
        memoryUsage: 'Redis memory usage tracking would require more complex implementation'
      };
    } catch (error) {
      return { totalKeys: 0, memoryUsage: 'error' };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.redis.status === 'ready') {
        await this.redis.quit();
      }
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Error during GraphQL cache Redis cleanup:', error.message);
    }
  }
}