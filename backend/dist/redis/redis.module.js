"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const redis_health_service_1 = require("./redis-health.service");
const logger = new common_1.Logger('RedisModule');
const redisProvider = {
    provide: ioredis_1.Redis,
    useFactory: async (configService) => {
        const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
        const host = isDockerEnv
            ? configService.get('DOCKER_REDIS_HOST', 'redis')
            : configService.get('REDIS_HOST', '116.118.49.243');
        const portConfig = isDockerEnv
            ? configService.get('DOCKER_REDIS_PORT', '6379')
            : configService.get('REDIS_PORT', '12004');
        const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
        const password = configService.get('REDIS_PASSWORD');
        const db = configService.get('REDIS_DB', 0);
        logger.log(`[Redis] Connecting to Redis: host=${host}, port=${port}, dockerEnv=${isDockerEnv}`);
        const redis = new ioredis_1.Redis({
            host,
            port,
            password,
            db,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times % 5 === 0) {
                    logger.warn(`[Redis] Retry attempt ${times}, next delay ${delay}ms`);
                }
                return delay;
            },
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    logger.warn(`[Redis] ${targetError} error, will reconnect`);
                    return true;
                }
                return false;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            enableOfflineQueue: true,
            connectTimeout: 10000,
            commandTimeout: 5000,
            lazyConnect: true,
        });
        redis.on('error', (err) => {
            logger.warn(`[Redis] Connection error: ${err.message}`);
        });
        redis.on('connect', () => {
            logger.log('[Redis] ✅ Connected successfully');
        });
        redis.on('reconnecting', () => {
            logger.log('[Redis] 🔄 Attempting to reconnect...');
        });
        redis.on('ready', () => {
            logger.log('[Redis] ✅ Ready and accepting commands');
        });
        try {
            logger.log('[Redis] Attempting initial connection...');
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    logger.warn('[Redis] Initial connection attempt timeout (15s), will retry automatically...');
                    resolve();
                }, 15000);
                redis.connect().then(() => {
                    clearTimeout(timeout);
                    logger.log('[Redis] ✅ Connected on first attempt!');
                    resolve();
                }).catch((err) => {
                    clearTimeout(timeout);
                    logger.warn(`[Redis] Initial connection failed: ${err.message}, will retry automatically...`);
                    resolve();
                });
            });
        }
        catch (error) {
            logger.warn(`[Redis] Caught error during initialization: ${error.message}, continuing...`);
        }
        return redis;
    },
    inject: [config_1.ConfigService],
};
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [redisProvider, redis_health_service_1.RedisHealthService],
        exports: [redisProvider, redis_health_service_1.RedisHealthService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map