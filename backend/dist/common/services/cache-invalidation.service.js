"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const graphql_cache_service_1 = require("./graphql-cache.service");
let CacheInvalidationService = class CacheInvalidationService {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async invalidateTaskCache(taskId, userId) {
        const promises = [
            this.cacheService.clearTaskCache(),
        ];
        if (userId) {
            promises.push(this.cacheService.clearUserCache(userId));
        }
        if (taskId) {
            promises.push(this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`));
        }
        await Promise.all(promises);
    }
    async invalidateCommentCache(taskId, userId) {
        const promises = [
            this.cacheService.clearCommentCache(),
            this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`)
        ];
        if (userId) {
            promises.push(this.cacheService.clearUserCache(userId));
        }
        await Promise.all(promises);
    }
    async invalidateMediaCache(taskId, userId) {
        const promises = [
            this.cacheService.clearCacheByPattern(`gettaskbyid:*:${taskId}`),
            this.cacheService.clearCacheByPattern('media')
        ];
        if (userId) {
            promises.push(this.cacheService.clearUserCache(userId));
        }
        await Promise.all(promises);
    }
    async invalidateUserCache(userId) {
        await Promise.all([
            this.cacheService.clearUserCache(userId),
            this.cacheService.clearCacheByPattern('gettasks'),
            this.cacheService.clearCacheByPattern('gettaskbyid')
        ]);
    }
    async warmupCache(userId) {
        console.log(`Cache warmup requested for user: ${userId}`);
    }
    async clearAllCache() {
        await this.cacheService.clearCacheByPattern('*');
        console.warn('All GraphQL cache has been cleared');
    }
    async getCacheHealth() {
        const isHealthy = await this.cacheService.healthCheck();
        const stats = await this.cacheService.getCacheStats();
        return {
            isHealthy,
            stats
        };
    }
};
exports.CacheInvalidationService = CacheInvalidationService;
exports.CacheInvalidationService = CacheInvalidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graphql_cache_service_1.GraphQLCacheService])
], CacheInvalidationService);
//# sourceMappingURL=cache-invalidation.service.js.map