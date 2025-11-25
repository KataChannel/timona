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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let AdvancedCacheService = class AdvancedCacheService {
    constructor(configService) {
        this.configService = configService;
        this.redisCluster = {};
        this.cacheStats = {};
        this.stats = {
            hits: 0,
            misses: 0,
            operations: 0,
            evictions: 0
        };
        this.layerStats = {
            L1_FAST: { hits: 0, misses: 0 },
            L2_MEDIUM: { hits: 0, misses: 0 },
            L3_SLOW: { hits: 0, misses: 0 },
            L4_PERSISTENT: { hits: 0, misses: 0 }
        };
        this.cacheLayers = [
            {
                name: 'L1_FAST',
                ttl: 60000,
                maxKeys: 10000,
                compressionEnabled: false
            },
            {
                name: 'L2_MEDIUM',
                ttl: 300000,
                maxKeys: 50000,
                compressionEnabled: true
            },
            {
                name: 'L3_SLOW',
                ttl: 3600000,
                maxKeys: 100000,
                compressionEnabled: true
            },
            {
                name: 'L4_PERSISTENT',
                ttl: 86400000,
                maxKeys: 200000,
                compressionEnabled: true
            }
        ];
    }
    async onModuleInit() {
        await this.initializeRedisConnections();
        await this.setupCacheWarming();
    }
    async initializeRedisConnections() {
        const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
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
        this.cacheLayers.forEach((layer, index) => {
            this.redisCluster[layer.name] = new ioredis_1.default({
                ...baseConfig,
                db: index + 2,
                keyPrefix: `${layer.name.toLowerCase()}:`,
            });
            this.cacheStats[layer.name] = { hits: 0, misses: 0, sets: 0 };
        });
    }
    async get(key, options = {}) {
        const layerName = options.layer || this.selectOptimalLayer(key);
        const layer = this.cacheLayers.find(l => l.name === layerName);
        if (!layer) {
            console.warn(`Cache layer ${layerName} not found`);
            return null;
        }
        const redis = this.redisCluster[layer.name];
        if (!redis)
            return null;
        try {
            const cached = await redis.get(key);
            if (cached) {
                this.cacheStats[layer.name].hits++;
                this.stats.hits++;
                this.stats.operations++;
                this.layerStats[layer.name].hits++;
                const data = layer.compressionEnabled
                    ? await this.decompress(cached)
                    : cached;
                return JSON.parse(data);
            }
            else {
                this.cacheStats[layer.name].misses++;
                this.stats.misses++;
                this.stats.operations++;
                this.layerStats[layer.name].misses++;
                const nextLayer = this.getNextCacheLayer(layer.name);
                if (nextLayer) {
                    const result = await this.get(key, { ...options, layer: nextLayer });
                    if (result !== null) {
                        await this.set(key, result, { ...options, layer: layer.name, ttl: layer.ttl });
                    }
                    return result;
                }
            }
            return null;
        }
        catch (error) {
            console.error(`Cache get error for layer ${layer.name}:`, error);
            return null;
        }
    }
    async delete(key, options = {}) {
        const layerName = options.layer || this.selectOptimalLayer(key);
        const layer = this.cacheLayers.find(l => l.name === layerName);
        if (!layer)
            return false;
        const redis = this.redisCluster[layer.name];
        if (!redis)
            return false;
        try {
            const result = await redis.del(key);
            this.stats.operations++;
            return result > 0;
        }
        catch (error) {
            console.error(`Cache delete error for layer ${layer.name}:`, error);
            return false;
        }
    }
    async set(key, value, options = {}) {
        const layerName = options.layer || this.selectOptimalLayer(key, value);
        const layer = this.cacheLayers.find(l => l.name === layerName);
        if (!layer) {
            console.warn(`Cache layer ${layerName} not found`);
            return;
        }
        const redis = this.redisCluster[layer.name];
        if (!redis)
            return;
        try {
            const ttl = options.ttl || layer.ttl;
            let data = JSON.stringify(value);
            if (layer.compressionEnabled && data.length > 1024) {
                data = await this.compress(data);
            }
            await redis.setex(key, Math.floor(ttl / 1000), data);
            this.cacheStats[layer.name].sets++;
            this.stats.operations++;
            if (options.tags && options.tags.length > 0) {
                await this.setCacheTags(key, options.tags, layer.name);
            }
        }
        catch (error) {
            console.error(`Cache set error for layer ${layer.name}:`, error);
        }
    }
    async invalidateByTags(tags) {
        const invalidationPromises = [];
        for (const tag of tags) {
            for (const layerName of Object.keys(this.redisCluster)) {
                invalidationPromises.push(this.invalidateTagInLayer(tag, layerName));
            }
        }
        await Promise.all(invalidationPromises);
    }
    async invalidateTagInLayer(tag, layerName) {
        const redis = this.redisCluster[layerName];
        if (!redis)
            return;
        try {
            const tagKey = `tag:${tag}`;
            const keys = await redis.smembers(tagKey);
            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                keys.forEach(key => pipeline.del(key));
                pipeline.del(tagKey);
                await pipeline.exec();
            }
        }
        catch (error) {
            console.error(`Tag invalidation error in layer ${layerName}:`, error);
        }
    }
    async setupCacheWarming() {
        console.log('Cache warming system initialized');
    }
    async warmCache(warmingData) {
        const warmingPromises = warmingData.map(async ({ key, fetcher, options }) => {
            try {
                const existingData = await this.get(key, options);
                if (existingData === null) {
                    const data = await fetcher();
                    await this.set(key, data, options);
                }
            }
            catch (error) {
                console.error(`Cache warming error for key ${key}:`, error);
            }
        });
        await Promise.all(warmingPromises);
    }
    async getCacheStats() {
        const layersStats = {};
        let totalKeys = 0;
        const memoryUsage = {};
        for (const layerName of Object.keys(this.cacheStats)) {
            const stats = this.cacheStats[layerName];
            const hitRate = stats.hits + stats.misses > 0
                ? (stats.hits / (stats.hits + stats.misses)) * 100
                : 0;
            layersStats[layerName] = {
                ...stats,
                hitRate: Math.round(hitRate * 100) / 100
            };
            try {
                const redis = this.redisCluster[layerName];
                if (redis) {
                    const keys = await redis.keys('*');
                    totalKeys += keys.length;
                    memoryUsage[layerName] = keys.length;
                }
            }
            catch (error) {
                console.error(`Error getting stats for layer ${layerName}:`, error);
            }
        }
        return {
            layers: layersStats,
            totalKeys,
            memoryUsage
        };
    }
    selectOptimalLayer(key, value) {
        if (key.includes('user:') || key.includes('profile:')) {
            return 'L2_MEDIUM';
        }
        if (key.includes('tasks:') || key.includes('gettasks')) {
            return 'L1_FAST';
        }
        if (key.includes('task:') && key.includes('gettaskbyid')) {
            return 'L2_MEDIUM';
        }
        if (key.includes('comment')) {
            return 'L1_FAST';
        }
        if (key.includes('stats:') || key.includes('analytics:') || key.includes('count:')) {
            return 'L3_SLOW';
        }
        if (key.includes('config:') || key.includes('settings:')) {
            return 'L4_PERSISTENT';
        }
        if (value && JSON.stringify(value).length > 10240) {
            return 'L3_SLOW';
        }
        return 'L2_MEDIUM';
    }
    getNextCacheLayer(currentLayer) {
        const currentIndex = this.cacheLayers.findIndex(l => l.name === currentLayer);
        if (currentIndex < this.cacheLayers.length - 1) {
            return this.cacheLayers[currentIndex + 1].name;
        }
        return null;
    }
    async setCacheTags(key, tags, layerName) {
        const redis = this.redisCluster[layerName];
        if (!redis)
            return;
        for (const tag of tags) {
            try {
                await redis.sadd(`tag:${tag}`, key);
                await redis.expire(`tag:${tag}`, 86400);
            }
            catch (error) {
                console.error(`Error setting cache tag ${tag}:`, error);
            }
        }
    }
    async compress(data) {
        return Buffer.from(data).toString('base64');
    }
    async decompress(data) {
        try {
            return Buffer.from(data, 'base64').toString('utf8');
        }
        catch {
            return data;
        }
    }
    async healthCheck() {
        const healthStatus = {};
        for (const layerName of Object.keys(this.redisCluster)) {
            try {
                const redis = this.redisCluster[layerName];
                const result = await redis.ping();
                healthStatus[layerName] = result === 'PONG';
            }
            catch {
                healthStatus[layerName] = false;
            }
        }
        return healthStatus;
    }
    async onModuleDestroy() {
        const promises = Object.values(this.redisCluster).map(async (redis) => {
            try {
                if (redis.status === 'ready') {
                    await redis.quit();
                }
            }
            catch (error) {
                console.warn('Error during Redis cleanup:', error.message);
            }
        });
        await Promise.all(promises);
    }
    async getStatistics() {
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
    getTotalCacheSize() {
        return this.getLayerSize('L1_FAST') +
            this.getLayerSize('L2_MEDIUM') +
            this.getLayerSize('L3_SLOW') +
            this.getLayerSize('L4_PERSISTENT');
    }
    getLayerSize(layer) {
        const layerMultiplier = {
            'L1_FAST': 100,
            'L2_MEDIUM': 500,
            'L3_SLOW': 1000,
            'L4_PERSISTENT': 2000
        };
        const operations = this.layerStats[layer]?.hits + this.layerStats[layer]?.misses || 0;
        return operations * (layerMultiplier[layer] || 500);
    }
};
exports.AdvancedCacheService = AdvancedCacheService;
exports.AdvancedCacheService = AdvancedCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdvancedCacheService);
//# sourceMappingURL=advanced-cache.service.js.map