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
exports.RedisHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisHealthIndicator = class RedisHealthIndicator extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
        const host = isDockerEnv
            ? this.configService.get('DOCKER_REDIS_HOST', 'redis')
            : this.configService.get('REDIS_HOST', '116.118.49.243');
        const portConfig = isDockerEnv
            ? this.configService.get('DOCKER_REDIS_PORT', '6379')
            : this.configService.get('REDIS_PORT', '12004');
        const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
        this.redis = new ioredis_1.default({
            host,
            port,
            password: this.configService.get('REDIS_PASSWORD'),
            maxRetriesPerRequest: 1,
            lazyConnect: true,
        });
    }
    async isHealthy(key) {
        try {
            const result = await this.redis.ping();
            if (result === 'PONG') {
                return this.getStatus(key, true, {
                    redis: 'up',
                    message: 'Redis connection is healthy',
                    ping: result,
                });
            }
            else {
                throw new Error(`Unexpected ping response: ${result}`);
            }
        }
        catch (error) {
            const result = this.getStatus(key, false, {
                redis: 'down',
                message: error.message,
            });
            throw new terminus_1.HealthCheckError('Redis health check failed', result);
        }
    }
    async onModuleDestroy() {
        await this.redis.disconnect();
    }
};
exports.RedisHealthIndicator = RedisHealthIndicator;
exports.RedisHealthIndicator = RedisHealthIndicator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisHealthIndicator);
//# sourceMappingURL=redis.health.js.map