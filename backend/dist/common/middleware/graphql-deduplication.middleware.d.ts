import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class GraphQLDeduplicationMiddleware implements NestMiddleware {
    private readonly cache;
    private readonly defaultTTL;
    private readonly maxCacheSize;
    use(req: Request, res: Response, next: NextFunction): void;
    private isMutationOrSubscription;
    private generateCacheKey;
    private getTTLForQuery;
    private setCacheItem;
    private cleanExpiredItems;
    clearCachePattern(pattern: string): void;
    clearAllCache(): void;
    getCacheStats(): {
        size: number;
        hitRate?: number;
    };
}
