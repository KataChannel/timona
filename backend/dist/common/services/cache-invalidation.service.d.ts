import { GraphQLCacheService } from './graphql-cache.service';
export declare class CacheInvalidationService {
    private readonly cacheService;
    constructor(cacheService: GraphQLCacheService);
    invalidateTaskCache(taskId?: string, userId?: string): Promise<void>;
    invalidateCommentCache(taskId: string, userId?: string): Promise<void>;
    invalidateMediaCache(taskId: string, userId?: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
    warmupCache(userId: string): Promise<void>;
    clearAllCache(): Promise<void>;
    getCacheHealth(): Promise<{
        isHealthy: boolean;
        stats: {
            totalKeys: number;
            memoryUsage: string;
        };
    }>;
}
