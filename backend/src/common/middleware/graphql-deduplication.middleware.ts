import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

interface CachedRequest {
  result: any;
  timestamp: number;
  expiresAt: number;
}

@Injectable()
export class GraphQLDeduplicationMiddleware implements NestMiddleware {
  private readonly cache = new Map<string, CachedRequest>();
  private readonly defaultTTL = 10000; // 10 seconds default cache
  private readonly maxCacheSize = 1000; // Maximum number of cached items
  
  use(req: Request, res: Response, next: NextFunction) {
    // Only handle GraphQL POST requests
    if (req.method !== 'POST' || !req.url.includes('/graphql')) {
      return next();
    }

    const { query, variables, operationName } = req.body;
    
    // Skip caching for mutations and subscriptions
    if (!query || this.isMutationOrSubscription(query)) {
      return next();
    }

    // Create cache key from query, variables, and user context
    const userId = (req as any).user?.id || 'anonymous';
    const cacheKey = this.generateCacheKey(query, variables, operationName, userId);
    
    // Check if we have a cached result
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now < cached.expiresAt) {
      // Return cached result
      res.json(cached.result);
      return;
    }

    // Store original res.json to intercept the response
    const originalJson = res.json.bind(res);
    
    res.json = (result: any) => {
      // Cache successful responses only
      if (result && !result.errors) {
        this.setCacheItem(cacheKey, result, this.getTTLForQuery(query));
      }
      
      return originalJson(result);
    };

    next();
  }

  private isMutationOrSubscription(query: string): boolean {
    const trimmedQuery = query.trim().toLowerCase();
    return trimmedQuery.startsWith('mutation') || 
           trimmedQuery.startsWith('subscription') ||
           trimmedQuery.includes('createtask') ||
           trimmedQuery.includes('updatetask') ||
           trimmedQuery.includes('deletetask') ||
           trimmedQuery.includes('createtaskcomment');
  }

  private generateCacheKey(
    query: string,
    variables: any,
    operationName: string | undefined,
    userId: string
  ): string {
    const queryHash = crypto
      .createHash('md5')
      .update(query)
      .digest('hex');
    
    const variablesHash = variables
      ? crypto.createHash('md5').update(JSON.stringify(variables)).digest('hex')
      : 'no-vars';
    
    return `${queryHash}:${variablesHash}:${operationName || 'no-op'}:${userId}`;
  }

  private getTTLForQuery(query: string): number {
    // Different TTL for different query types
    if (query.includes('getTasks')) {
      return 30000; // 30 seconds for task lists
    }
    
    if (query.includes('getTaskById')) {
      return 60000; // 1 minute for individual tasks
    }
    
    if (query.includes('getMe') || query.includes('getUserById')) {
      return 120000; // 2 minutes for user data
    }
    
    return this.defaultTTL;
  }

  private setCacheItem(key: string, result: any, ttl: number): void {
    // Clean up expired items if cache is getting full
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanExpiredItems();
    }
    
    const now = Date.now();
    this.cache.set(key, {
      result,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  private cleanExpiredItems(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
      
      // Don't clean too many at once to avoid performance impact
      if (cleanedCount >= 100) {
        break;
      }
    }
    
    // If still too many items, remove oldest ones
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, Math.floor(this.maxCacheSize * 0.2)) // Remove oldest 20%
        .forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear cache for specific patterns (useful after mutations)
   */
  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size,
      // Note: Hit rate tracking would require additional counters
    };
  }
}