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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLDeduplicationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let GraphQLDeduplicationMiddleware = class GraphQLDeduplicationMiddleware {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 10000;
        this.maxCacheSize = 1000;
    }
    use(req, res, next) {
        if (req.method !== 'POST' || !req.url.includes('/graphql')) {
            return next();
        }
        const { query, variables, operationName } = req.body;
        if (!query || this.isMutationOrSubscription(query)) {
            return next();
        }
        const userId = req.user?.id || 'anonymous';
        const cacheKey = this.generateCacheKey(query, variables, operationName, userId);
        const cached = this.cache.get(cacheKey);
        const now = Date.now();
        if (cached && now < cached.expiresAt) {
            res.json(cached.result);
            return;
        }
        const originalJson = res.json.bind(res);
        res.json = (result) => {
            if (result && !result.errors) {
                this.setCacheItem(cacheKey, result, this.getTTLForQuery(query));
            }
            return originalJson(result);
        };
        next();
    }
    isMutationOrSubscription(query) {
        const trimmedQuery = query.trim().toLowerCase();
        return trimmedQuery.startsWith('mutation') ||
            trimmedQuery.startsWith('subscription') ||
            trimmedQuery.includes('createtask') ||
            trimmedQuery.includes('updatetask') ||
            trimmedQuery.includes('deletetask') ||
            trimmedQuery.includes('createtaskcomment');
    }
    generateCacheKey(query, variables, operationName, userId) {
        const queryHash = crypto
            .createHash('md5')
            .update(query)
            .digest('hex');
        const variablesHash = variables
            ? crypto.createHash('md5').update(JSON.stringify(variables)).digest('hex')
            : 'no-vars';
        return `${queryHash}:${variablesHash}:${operationName || 'no-op'}:${userId}`;
    }
    getTTLForQuery(query) {
        if (query.includes('getTasks')) {
            return 30000;
        }
        if (query.includes('getTaskById')) {
            return 60000;
        }
        if (query.includes('getMe') || query.includes('getUserById')) {
            return 120000;
        }
        return this.defaultTTL;
    }
    setCacheItem(key, result, ttl) {
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
    cleanExpiredItems() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, item] of this.cache.entries()) {
            if (now >= item.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
            if (cleanedCount >= 100) {
                break;
            }
        }
        if (this.cache.size >= this.maxCacheSize) {
            const entries = Array.from(this.cache.entries());
            entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)
                .slice(0, Math.floor(this.maxCacheSize * 0.2))
                .forEach(([key]) => this.cache.delete(key));
        }
    }
    clearCachePattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
    clearAllCache() {
        this.cache.clear();
    }
    getCacheStats() {
        return {
            size: this.cache.size,
        };
    }
};
exports.GraphQLDeduplicationMiddleware = GraphQLDeduplicationMiddleware;
exports.GraphQLDeduplicationMiddleware = GraphQLDeduplicationMiddleware = __decorate([
    (0, common_1.Injectable)()
], GraphQLDeduplicationMiddleware);
//# sourceMappingURL=graphql-deduplication.middleware.js.map