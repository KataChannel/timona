"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const crypto = __importStar(require("crypto"));
let GraphQLCacheService = class GraphQLCacheService {
    constructor(redis, configService) {
        this.redis = redis;
        this.configService = configService;
        this.defaultTTL = 30000;
        this.keyPrefix = 'gql:';
    }
    addPrefix(key) {
        return `${this.keyPrefix}${key}`;
    }
    generateCacheKey(query, variables, operationName, userId = 'anonymous') {
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
    async getCachedResult(cacheKey) {
        try {
            const cached = await this.redis.get(this.addPrefix(cacheKey));
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.warn('Redis cache get error:', error);
            return null;
        }
    }
    async setCachedResult(cacheKey, result, ttl = this.defaultTTL) {
        try {
            if (result.errors && result.errors.length > 0) {
                return;
            }
            await this.redis.setex(this.addPrefix(cacheKey), Math.floor(ttl / 1000), JSON.stringify(result));
        }
        catch (error) {
            console.warn('Redis cache set error:', error);
        }
    }
    getTTLForQuery(query) {
        const queryLower = query.toLowerCase();
        if (queryLower.includes('getme') || queryLower.includes('getuserbyid')) {
            return 300000;
        }
        if (queryLower.includes('gettasks') || queryLower.includes('getsharedtasks')) {
            return 60000;
        }
        if (queryLower.includes('gettaskbyid')) {
            return 30000;
        }
        if (queryLower.includes('comments') || queryLower.includes('media')) {
            return 15000;
        }
        if (queryLower.includes('notification') || queryLower.includes('activity')) {
            return 5000;
        }
        return this.defaultTTL;
    }
    shouldCacheQuery(query) {
        const queryLower = query.trim().toLowerCase();
        if (queryLower.startsWith('mutation')) {
            return false;
        }
        if (queryLower.startsWith('subscription')) {
            return false;
        }
        if (queryLower.includes('__schema') || queryLower.includes('__type')) {
            return false;
        }
        if (queryLower.includes('getusers') || queryLower.includes('getallusers')) {
            return false;
        }
        return true;
    }
    async clearCacheByPattern(pattern) {
        try {
            const keys = await this.redis.keys(`${this.keyPrefix}*${pattern}*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        catch (error) {
            console.warn('Redis cache clear error:', error);
        }
    }
    async clearUserCache(userId) {
        await this.clearCacheByPattern(`u:${userId}`);
    }
    async clearTaskCache() {
        await this.clearCacheByPattern('gettasks');
        await this.clearCacheByPattern('gettaskbyid');
        await this.clearCacheByPattern('getsharedtasks');
    }
    async clearCommentCache() {
        await this.clearCacheByPattern('comment');
    }
    async getCacheStats() {
        try {
            const keys = await this.redis.keys(`${this.keyPrefix}*`);
            return {
                totalKeys: keys.length,
                memoryUsage: 'Redis memory usage tracking would require more complex implementation'
            };
        }
        catch (error) {
            return { totalKeys: 0, memoryUsage: 'error' };
        }
    }
    async healthCheck() {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        }
        catch (error) {
            return false;
        }
    }
    async onModuleDestroy() {
        try {
            if (this.redis.status === 'ready') {
                await this.redis.quit();
            }
        }
        catch (error) {
            console.warn('Error during GraphQL cache Redis cleanup:', error.message);
        }
    }
};
exports.GraphQLCacheService = GraphQLCacheService;
exports.GraphQLCacheService = GraphQLCacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ioredis_1.default)),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService])
], GraphQLCacheService);
//# sourceMappingURL=graphql-cache.service.js.map