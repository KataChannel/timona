import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export interface GraphQLCacheOptions {
    ttl: number;
    keyPrefix: string;
}
export declare class GraphQLCacheService {
    private readonly redis;
    private readonly configService;
    private readonly defaultTTL;
    private readonly keyPrefix;
    constructor(redis: Redis, configService: ConfigService);
    private addPrefix;
    generateCacheKey(query: string, variables: any, operationName: string | undefined, userId?: string): string;
    getCachedResult(cacheKey: string): Promise<any | null>;
    setCachedResult(cacheKey: string, result: any, ttl?: number): Promise<void>;
    getTTLForQuery(query: string): number;
    shouldCacheQuery(query: string): boolean;
    clearCacheByPattern(pattern: string): Promise<void>;
    clearUserCache(userId: string): Promise<void>;
    clearTaskCache(): Promise<void>;
    clearCommentCache(): Promise<void>;
    getCacheStats(): Promise<{
        totalKeys: number;
        memoryUsage: string;
    }>;
    healthCheck(): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
