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
exports.RateLimit = exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const ioredis_1 = require("ioredis");
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        const rateLimitConfig = this.reflector.get('rateLimit', context.getHandler());
        if (!rateLimitConfig) {
            return true;
        }
        const request = this.getRequest(context);
        const key = this.generateKey(request, context, rateLimitConfig);
        const current = await this.redis.get(key);
        const requests = current ? parseInt(current, 10) : 0;
        if (requests >= rateLimitConfig.maxRequests) {
            const ttl = await this.redis.ttl(key);
            throw new common_1.HttpException({
                message: rateLimitConfig.message || 'Rate limit exceeded',
                retryAfter: ttl > 0 ? ttl : rateLimitConfig.windowMs / 1000,
                limit: rateLimitConfig.maxRequests,
                remaining: 0,
                reset: new Date(Date.now() + (ttl > 0 ? ttl * 1000 : rateLimitConfig.windowMs))
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const pipeline = this.redis.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000));
        await pipeline.exec();
        const response = this.getResponse(context);
        if (response && response.setHeader) {
            response.setHeader('X-RateLimit-Limit', rateLimitConfig.maxRequests);
            response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitConfig.maxRequests - requests - 1));
            response.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitConfig.windowMs));
        }
        return true;
    }
    getRequest(context) {
        if (context.getType() === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            return gqlContext.getContext().req;
        }
        return context.switchToHttp().getRequest();
    }
    getResponse(context) {
        if (context.getType() === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            return gqlContext.getContext().res;
        }
        return context.switchToHttp().getResponse();
    }
    generateKey(request, context, config) {
        if (config.keyGenerator) {
            return config.keyGenerator(request, context);
        }
        const userId = request.user?.id || 'anonymous';
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const endpoint = this.getEndpointName(context);
        return `rate_limit:${endpoint}:${userId}:${ip}`;
    }
    getEndpointName(context) {
        if (context.getType() === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            return `${info.operation.operation}:${info.fieldName}`;
        }
        const handler = context.getHandler();
        const controller = context.getClass();
        return `${controller.name}:${handler.name}`;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        ioredis_1.Redis])
], RateLimitGuard);
const RateLimit = (config) => {
    return (target, propertyName, descriptor) => {
        Reflect.defineMetadata('rateLimit', config, descriptor.value);
        return descriptor;
    };
};
exports.RateLimit = RateLimit;
//# sourceMappingURL=rate-limit.guard.js.map