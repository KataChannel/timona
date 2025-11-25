import { Injectable } from '@nestjs/common';
import { GraphQLCacheService } from './graphql-cache.service';

@Injectable()
export class CacheInvalidationService {
  constructor(private readonly cacheService: GraphQLCacheService) {}

  /**
   * Invalidate cache after task mutations
   */
  async invalidateTaskCache(taskId?: string, userId?: string): Promise<void> {
    const promises: Promise<void>[] = [
      this.cacheService.clearTaskCache(),
    ];

    if (userId) {
      promises.push(this.cacheService.clearUserCache(userId));
    }

    // Clear specific task cache if taskId provided
    if (taskId) {
      promises.push(
        this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`)
      );
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate cache after comment mutations
   */
  async invalidateCommentCache(taskId: string, userId?: string): Promise<void> {
    const promises: Promise<void>[] = [
      this.cacheService.clearCommentCache(),
      // Comments affect task data (counts)
      this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`)
    ];

    if (userId) {
      promises.push(this.cacheService.clearUserCache(userId));
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate cache after media mutations
   */
  async invalidateMediaCache(taskId: string, userId?: string): Promise<void> {
    const promises: Promise<void>[] = [
      // Media affects task data (counts and media lists)
      this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`),
      this.cacheService.clearCacheByPattern('media')
    ];

    if (userId) {
      promises.push(this.cacheService.clearUserCache(userId));
    }

    await Promise.all(promises);
  }

  /**
   * Invalidate user-related cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.cacheService.clearUserCache(userId),
      // User changes might affect task author data
      this.cacheService.clearCacheByPattern('gettasks'),
      this.cacheService.clearCacheByPattern('gettaskbyid')
    ]);
  }

  /**
   * Warm up cache with common queries
   * This could be called after cache invalidation or during low-traffic periods
   */
  async warmupCache(userId: string): Promise<void> {
    // This would be implemented based on your most common queries
    // For now, we'll just log the intention
    console.log(`Cache warmup requested for user: ${userId}`);
    
    // Example: Pre-cache user's recent tasks
    // const tasks = await this.taskService.findByUserId(userId, { limit: 10 });
    // Cache these results...
  }

  /**
   * Clear all GraphQL cache (use with caution)
   */
  async clearAllCache(): Promise<void> {
    // This would clear all GraphQL cache - use only in emergencies or during deployments
    await this.cacheService.clearCacheByPattern('*');
    console.warn('All GraphQL cache has been cleared');
  }

  /**
   * Get cache health metrics
   */
  async getCacheHealth(): Promise<{
    isHealthy: boolean;
    stats: { totalKeys: number; memoryUsage: string };
  }> {
    const isHealthy = await this.cacheService.healthCheck();
    const stats = await this.cacheService.getCacheStats();
    
    return {
      isHealthy,
      stats
    };
  }
}