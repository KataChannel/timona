import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

export interface CacheLayer {
  name: string;
  ttl: number;
  maxKeys?: number;
  compressionEnabled?: boolean;
}

export interface CacheOptions {
  layer?: string;
  ttl?: number;
  compress?: boolean;
  tags?: string[];
}

@Injectable()
export class AdvancedCacheService implements OnModuleInit {
  private readonly redisCluster: { [key: string]: Redis } = {};
  private readonly cacheStats: { [layer: string]: { hits: number; misses: number; sets: number } } = {};
  
  // Overall statistics
  private readonly stats = {
    hits: 0,
    misses: 0,
    operations: 0,
    evictions: 0
  };

  // Per-layer statistics
  private readonly layerStats: { [key: string]: { hits: number; misses: number } } = {
    L1_FAST: { hits: 0, misses: 0 },
    L2_MEDIUM: { hits: 0, misses: 0 },
    L3_SLOW: { hits: 0, misses: 0 },
    L4_PERSISTENT: { hits: 0, misses: 0 }
  };

  // Define cache layers with different strategies
  private readonly cacheLayers: CacheLayer[] = [
    {
      name: 'L1_FAST',
      ttl: 60000,           // 1 minute - Hot data
      maxKeys: 10000,
      compressionEnabled: false
    },
    {
      name: 'L2_MEDIUM',
      ttl: 300000,          // 5 minutes - Warm data
      maxKeys: 50000,
      compressionEnabled: true
    },
    {
      name: 'L3_SLOW',
      ttl: 3600000,         // 1 hour - Cold data
      maxKeys: 100000,
      compressionEnabled: true
    },
    {
      name: 'L4_PERSISTENT',
      ttl: 86400000,        // 24 hours - Static/computed data
      maxKeys: 200000,
      compressionEnabled: true
    }
  ];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedisConnections();
    await this.setupCacheWarming();
  }

  private async initializeRedisConnections() {
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
    
    const baseConfig = {
      host,
      port,
      password: this.configService.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    };

    // Create separate Redis connections for each cache layer
    this.cacheLayers.forEach((layer, index) => {
      this.redisCluster[layer.name] = new Redis({
        ...baseConfig,
        db: index + 2, // Use separate DB for each layer (2-5)
        keyPrefix: `${layer.name.toLowerCase()}:`,
      });

      // Initialize stats
      this.cacheStats[layer.name] = { hits: 0, misses: 0, sets: 0 };
    });
  }

  /**
   * Get value from cache with multi-layer lookup
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const layerName = options.layer || this.selectOptimalLayer(key);
    const layer = this.cacheLayers.find(l => l.name === layerName);
    
    if (!layer) {
      console.warn(`Cache layer ${layerName} not found`);
      return null;
    }

    const redis = this.redisCluster[layer.name];
    if (!redis) return null;

    try {
      const cached = await redis.get(key);
      
      if (cached) {
        // Update statistics
        this.cacheStats[layer.name].hits++;
        this.stats.hits++;
        this.stats.operations++;
        this.layerStats[layer.name].hits++;
        
        // Decompress if needed
        const data = layer.compressionEnabled 
          ? await this.decompress(cached)
          : cached;
          
        return JSON.parse(data);
      } else {
        // Update statistics
        this.cacheStats[layer.name].misses++;
        this.stats.misses++;
        this.stats.operations++;
        this.layerStats[layer.name].misses++;
        
        // Try next cache layer
        const nextLayer = this.getNextCacheLayer(layer.name);
        if (nextLayer) {
          const result = await this.get<T>(key, { ...options, layer: nextLayer });
          
          // Promote to faster layer if found
          if (result !== null) {
            await this.set(key, result, { ...options, layer: layer.name, ttl: layer.ttl });
          }
          
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Cache get error for layer ${layer.name}:`, error);
      return null;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    const layerName = options.layer || this.selectOptimalLayer(key);
    const layer = this.cacheLayers.find(l => l.name === layerName);
    
    if (!layer) return false;

    const redis = this.redisCluster[layer.name];
    if (!redis) return false;

    try {
      const result = await redis.del(key);
      this.stats.operations++;
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for layer ${layer.name}:`, error);
      return false;
    }
  }
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const layerName = options.layer || this.selectOptimalLayer(key, value);
    const layer = this.cacheLayers.find(l => l.name === layerName);
    
    if (!layer) {
      console.warn(`Cache layer ${layerName} not found`);
      return;
    }

    const redis = this.redisCluster[layer.name];
    if (!redis) return;

    try {
      const ttl = options.ttl || layer.ttl;
      let data = JSON.stringify(value);
      
      // Compress large data
      if (layer.compressionEnabled && data.length > 1024) {
        data = await this.compress(data);
      }

      await redis.setex(key, Math.floor(ttl / 1000), data);
      
      // Update statistics
      this.cacheStats[layer.name].sets++;
      this.stats.operations++;

      // Set cache tags for invalidation
      if (options.tags && options.tags.length > 0) {
        await this.setCacheTags(key, options.tags, layer.name);
      }

    } catch (error) {
      console.error(`Cache set error for layer ${layer.name}:`, error);
    }
  }

  /**
   * Intelligent cache invalidation by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const invalidationPromises: Promise<void>[] = [];

    for (const tag of tags) {
      for (const layerName of Object.keys(this.redisCluster)) {
        invalidationPromises.push(this.invalidateTagInLayer(tag, layerName));
      }
    }

    await Promise.all(invalidationPromises);
  }

  private async invalidateTagInLayer(tag: string, layerName: string): Promise<void> {
    const redis = this.redisCluster[layerName];
    if (!redis) return;

    try {
      const tagKey = `tag:${tag}`;
      const keys = await redis.smembers(tagKey);
      
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach(key => pipeline.del(key));
        pipeline.del(tagKey);
        await pipeline.exec();
      }
    } catch (error) {
      console.error(`Tag invalidation error in layer ${layerName}:`, error);
    }
  }

  /**
   * Cache warming for common queries
   */
  private async setupCacheWarming(): Promise<void> {
    // This could be expanded to warm up cache with common queries
    console.log('Cache warming system initialized');
  }

  /**
   * Warm cache with specific data
   */
  async warmCache(warmingData: { key: string; fetcher: () => Promise<any>; options?: CacheOptions }[]): Promise<void> {
    const warmingPromises = warmingData.map(async ({ key, fetcher, options }) => {
      try {
        const existingData = await this.get(key, options);
        if (existingData === null) {
          const data = await fetcher();
          await this.set(key, data, options);
        }
      } catch (error) {
        console.error(`Cache warming error for key ${key}:`, error);
      }
    });

    await Promise.all(warmingPromises);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    layers: { [layer: string]: { hits: number; misses: number; sets: number; hitRate: number } };
    totalKeys: number;
    memoryUsage: { [layer: string]: number };
  }> {
    const layersStats: { [layer: string]: { hits: number; misses: number; sets: number; hitRate: number } } = {};
    let totalKeys = 0;
    const memoryUsage: { [layer: string]: number } = {};

    for (const layerName of Object.keys(this.cacheStats)) {
      const stats = this.cacheStats[layerName];
      const hitRate = stats.hits + stats.misses > 0 
        ? (stats.hits / (stats.hits + stats.misses)) * 100 
        : 0;

      layersStats[layerName] = {
        ...stats,
        hitRate: Math.round(hitRate * 100) / 100
      };

      // Get key count for this layer
      try {
        const redis = this.redisCluster[layerName];
        if (redis) {
          const keys = await redis.keys('*');
          totalKeys += keys.length;
          memoryUsage[layerName] = keys.length; // Simplified - could use MEMORY USAGE command
        }
      } catch (error) {
        console.error(`Error getting stats for layer ${layerName}:`, error);
      }
    }

    return {
      layers: layersStats,
      totalKeys,
      memoryUsage
    };
  }

  /**
   * Select optimal cache layer based on key patterns and data size
   */
  private selectOptimalLayer(key: string, value?: any): string {
    // User profile data - medium term
    if (key.includes('user:') || key.includes('profile:')) {
      return 'L2_MEDIUM';
    }
    
    // Task lists - fast access
    if (key.includes('tasks:') || key.includes('gettasks')) {
      return 'L1_FAST';
    }
    
    // Individual tasks - medium term
    if (key.includes('task:') && key.includes('gettaskbyid')) {
      return 'L2_MEDIUM';
    }
    
    // Comments - fast access
    if (key.includes('comment')) {
      return 'L1_FAST';
    }
    
    // Computed/aggregated data - long term
    if (key.includes('stats:') || key.includes('analytics:') || key.includes('count:')) {
      return 'L3_SLOW';
    }
    
    // Configuration/static data - persistent
    if (key.includes('config:') || key.includes('settings:')) {
      return 'L4_PERSISTENT';
    }

    // Large data objects - slower layer with compression
    if (value && JSON.stringify(value).length > 10240) { // > 10KB
      return 'L3_SLOW';
    }
    
    // Default to medium layer
    return 'L2_MEDIUM';
  }

  private getNextCacheLayer(currentLayer: string): string | null {
    const currentIndex = this.cacheLayers.findIndex(l => l.name === currentLayer);
    if (currentIndex < this.cacheLayers.length - 1) {
      return this.cacheLayers[currentIndex + 1].name;
    }
    return null;
  }

  private async setCacheTags(key: string, tags: string[], layerName: string): Promise<void> {
    const redis = this.redisCluster[layerName];
    if (!redis) return;

    for (const tag of tags) {
      try {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, 86400); // Tag expires in 24 hours
      } catch (error) {
        console.error(`Error setting cache tag ${tag}:`, error);
      }
    }
  }

  private async compress(data: string): Promise<string> {
    // Simple base64 compression - could be replaced with gzip
    return Buffer.from(data).toString('base64');
  }

  private async decompress(data: string): Promise<string> {
    try {
      return Buffer.from(data, 'base64').toString('utf8');
    } catch {
      return data; // Return as-is if not compressed
    }
  }

  /**
   * Health check for all cache layers
   */
  async healthCheck(): Promise<{ [layer: string]: boolean }> {
    const healthStatus: { [layer: string]: boolean } = {};

    for (const layerName of Object.keys(this.redisCluster)) {
      try {
        const redis = this.redisCluster[layerName];
        const result = await redis.ping();
        healthStatus[layerName] = result === 'PONG';
      } catch {
        healthStatus[layerName] = false;
      }
    }

    return healthStatus;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    const promises = Object.values(this.redisCluster).map(async redis => {
      try {
        if (redis.status === 'ready') {
          await redis.quit();
        }
      } catch (error) {
        // Ignore errors during cleanup
        console.warn('Error during Redis cleanup:', error.message);
      }
    });
    await Promise.all(promises);
  }

  /**
   * Get comprehensive cache statistics
   */
  async getStatistics(): Promise<{
    hits: number;
    misses: number;
    operations: number;
    totalSize: number;
    evictions: number;
    layerStats: { [key: string]: { hits: number; misses: number; size: number } };
  }> {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      operations: this.stats.operations,
      totalSize: this.getTotalCacheSize(),
      evictions: this.stats.evictions,
      layerStats: {
        L1_FAST: {
          hits: this.layerStats.L1_FAST.hits,
          misses: this.layerStats.L1_FAST.misses,
          size: this.getLayerSize('L1_FAST')
        },
        L2_MEDIUM: {
          hits: this.layerStats.L2_MEDIUM.hits,
          misses: this.layerStats.L2_MEDIUM.misses,
          size: this.getLayerSize('L2_MEDIUM')
        },
        L3_SLOW: {
          hits: this.layerStats.L3_SLOW.hits,
          misses: this.layerStats.L3_SLOW.misses,
          size: this.getLayerSize('L3_SLOW')
        },
        L4_PERSISTENT: {
          hits: this.layerStats.L4_PERSISTENT.hits,
          misses: this.layerStats.L4_PERSISTENT.misses,
          size: this.getLayerSize('L4_PERSISTENT')
        }
      }
    };
  }

  private getTotalCacheSize(): number {
    // Estimate cache size (would be more accurate with real Redis data)
    return this.getLayerSize('L1_FAST') + 
           this.getLayerSize('L2_MEDIUM') + 
           this.getLayerSize('L3_SLOW') + 
           this.getLayerSize('L4_PERSISTENT');
  }

  private getLayerSize(layer: string): number {
    // Mock implementation - would use Redis MEMORY USAGE commands in production
    const layerMultiplier = {
      'L1_FAST': 100,
      'L2_MEDIUM': 500, 
      'L3_SLOW': 1000,
      'L4_PERSISTENT': 2000
    };
    
    const operations = this.layerStats[layer]?.hits + this.layerStats[layer]?.misses || 0;
    return operations * (layerMultiplier[layer] || 500); // Rough size estimate in bytes
  }
}