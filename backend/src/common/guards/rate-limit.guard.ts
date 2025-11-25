import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request, context: ExecutionContext) => string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get<RateLimitConfig>('rateLimit', context.getHandler());
    
    if (!rateLimitConfig) {
      return true; // No rate limiting configured
    }

    const request = this.getRequest(context);
    const key = this.generateKey(request, context, rateLimitConfig);
    
    const current = await this.redis.get(key);
    const requests = current ? parseInt(current, 10) : 0;

    if (requests >= rateLimitConfig.maxRequests) {
      const ttl = await this.redis.ttl(key);
      throw new HttpException(
        {
          message: rateLimitConfig.message || 'Rate limit exceeded',
          retryAfter: ttl > 0 ? ttl : rateLimitConfig.windowMs / 1000,
          limit: rateLimitConfig.maxRequests,
          remaining: 0,
          reset: new Date(Date.now() + (ttl > 0 ? ttl * 1000 : rateLimitConfig.windowMs))
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment counter
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000));
    await pipeline.exec();

    // Add headers for GraphQL responses
    const response = this.getResponse(context);
    if (response && response.setHeader) {
      response.setHeader('X-RateLimit-Limit', rateLimitConfig.maxRequests);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitConfig.maxRequests - requests - 1));
      response.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitConfig.windowMs));
    }

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    // Handle GraphQL context
    if (context.getType<any>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }
    
    // Handle HTTP context
    return context.switchToHttp().getRequest<Request>();
  }

  private getResponse(context: ExecutionContext): any {
    // Handle GraphQL context
    if (context.getType<any>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().res;
    }
    
    // Handle HTTP context
    return context.switchToHttp().getResponse();
  }

  private generateKey(request: Request, context: ExecutionContext, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request, context);
    }

    // Default key generation
    const userId = (request as any).user?.id || 'anonymous';
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const endpoint = this.getEndpointName(context);
    
    return `rate_limit:${endpoint}:${userId}:${ip}`;
  }

  private getEndpointName(context: ExecutionContext): string {
    if (context.getType<any>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      return `${info.operation.operation}:${info.fieldName}`;
    }
    
    const handler = context.getHandler();
    const controller = context.getClass();
    return `${controller.name}:${handler.name}`;
  }
}

// Decorator for easy rate limiting setup
export const RateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', config, descriptor.value);
    return descriptor;
  };
};