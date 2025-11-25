import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export declare class AdvancedCacheService implements OnModuleInit {
    private readonly configService;
    private readonly redisCluster;
    private readonly cacheStats;
    private readonly stats;
    private readonly layerStats;
    private readonly cacheLayers;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeRedisConnections;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    delete(key: string, options?: CacheOptions): Promise<boolean>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    invalidateByTags(tags: string[]): Promise<void>;
    private invalidateTagInLayer;
    private setupCacheWarming;
    warmCache(warmingData: {
        key: string;
        fetcher: () => Promise<any>;
        options?: CacheOptions;
    }[]): Promise<void>;
    getCacheStats(): Promise<{
        layers: {
            [layer: string]: {
                hits: number;
                misses: number;
                sets: number;
                hitRate: number;
            };
        };
        totalKeys: number;
        memoryUsage: {
            [layer: string]: number;
        };
    }>;
    private selectOptimalLayer;
    private getNextCacheLayer;
    private setCacheTags;
    private compress;
    private decompress;
    healthCheck(): Promise<{
        [layer: string]: boolean;
    }>;
    onModuleDestroy(): Promise<void>;
    getStatistics(): Promise<{
        hits: number;
        misses: number;
        operations: number;
        totalSize: number;
        evictions: number;
        layerStats: {
            [key: string]: {
                hits: number;
                misses: number;
                size: number;
            };
        };
    }>;
    private getTotalCacheSize;
    private getLayerSize;
}
