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
var RedisHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHealthService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisHealthService = RedisHealthService_1 = class RedisHealthService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(RedisHealthService_1.name);
        this.isConnected = false;
        this.healthCheckInterval = null;
    }
    async onModuleInit() {
        this.logger.log('🔍 Redis Health Service initializing...');
        await this.checkConnection();
        this.startHealthCheck();
    }
    onModuleDestroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
    }
    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            await this.checkConnection();
        }, 10000);
    }
    async checkConnection() {
        try {
            const pong = await this.redis.ping();
            if (pong === 'PONG') {
                if (!this.isConnected) {
                    this.logger.log('✅ Redis connection restored');
                    this.isConnected = true;
                }
            }
        }
        catch (err) {
            if (this.isConnected) {
                this.logger.error(`⚠️  Redis connection lost: ${err.message}`);
                this.isConnected = false;
            }
        }
    }
    async isHealthy() {
        try {
            await this.redis.ping();
            return true;
        }
        catch (err) {
            this.logger.warn(`Redis health check failed: ${err.message}`);
            return false;
        }
    }
    isConnectedNow() {
        return this.isConnected;
    }
    async executeWithFallback(operation, fallback) {
        try {
            return await operation();
        }
        catch (err) {
            this.logger.warn(`Redis operation failed, using fallback: ${err.message}`);
            return fallback;
        }
    }
};
exports.RedisHealthService = RedisHealthService;
exports.RedisHealthService = RedisHealthService = RedisHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], RedisHealthService);
//# sourceMappingURL=redis-health.service.js.map