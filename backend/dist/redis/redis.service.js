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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
        const host = isDockerEnv
            ? this.configService.get('DOCKER_REDIS_HOST', 'redis')
            : this.configService.get('REDIS_HOST', '116.118.49.243');
        const portConfig = isDockerEnv
            ? this.configService.get('DOCKER_REDIS_PORT', '6379')
            : this.configService.get('REDIS_PORT', '12004');
        const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
        const password = this.configService.get('REDIS_PASSWORD');
        const db = this.configService.get('REDIS_DB', 0);
        console.log(`[RedisService] Connecting to Redis: host=${host}, port=${port}, dockerEnv=${isDockerEnv}`);
        this.client = new ioredis_1.default({
            host,
            port,
            password,
            db,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            lazyConnect: true,
            enableOfflineQueue: true,
            connectTimeout: 10000,
            commandTimeout: 5000,
        });
        this.client.on('error', (err) => {
            console.warn(`[RedisService] Connection error: ${err.message}`);
        });
        this.client.on('connect', () => {
            console.log('[RedisService] ✅ Connected successfully');
        });
        this.client.on('reconnecting', () => {
            console.log('[RedisService] 🔄 Attempting to reconnect...');
        });
        try {
            await this.client.connect();
            console.log('✅ Redis connected successfully');
        }
        catch (error) {
            console.warn('⚠️ Redis connection failed, running without cache:', error.message);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    async get(key) {
        if (!this.client || this.client.status !== 'ready') {
            return null;
        }
        try {
            return await this.client.get(key);
        }
        catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.client || this.client.status !== 'ready') {
            return;
        }
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            console.error('Redis SET error:', error);
        }
    }
    async setex(key, seconds, value) {
        return this.set(key, value, seconds);
    }
    async del(key) {
        if (!this.client || this.client.status !== 'ready') {
            return;
        }
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error('Redis DEL error:', error);
        }
    }
    async delMultiple(keys) {
        if (!this.client || this.client.status !== 'ready' || keys.length === 0) {
            return;
        }
        try {
            await this.client.del(...keys);
        }
        catch (error) {
            console.error('Redis DEL error:', error);
        }
    }
    async exists(key) {
        if (!this.client || this.client.status !== 'ready') {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }
    async ttl(key) {
        if (!this.client || this.client.status !== 'ready') {
            return -1;
        }
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.error('Redis TTL error:', error);
            return -1;
        }
    }
    async incr(key) {
        if (!this.client || this.client.status !== 'ready') {
            return 0;
        }
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.error('Redis INCR error:', error);
            return 0;
        }
    }
    async incrby(key, increment) {
        if (!this.client || this.client.status !== 'ready') {
            return 0;
        }
        try {
            return await this.client.incrby(key, increment);
        }
        catch (error) {
            console.error('Redis INCRBY error:', error);
            return 0;
        }
    }
    async keys(pattern) {
        if (!this.client || this.client.status !== 'ready') {
            return [];
        }
        try {
            return await this.client.keys(pattern);
        }
        catch (error) {
            console.error('Redis KEYS error:', error);
            return [];
        }
    }
    async flushall() {
        if (!this.client || this.client.status !== 'ready') {
            return;
        }
        try {
            await this.client.flushall();
        }
        catch (error) {
            console.error('Redis FLUSHALL error:', error);
        }
    }
    getClient() {
        return this.client?.status === 'ready' ? this.client : null;
    }
    isConnected() {
        return this.client?.status === 'ready';
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map