import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Redis } from 'ioredis';
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message?: string;
    keyGenerator?: (req: Request, context: ExecutionContext) => string;
}
export declare class RateLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly redis;
    constructor(reflector: Reflector, redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getRequest;
    private getResponse;
    private generateKey;
    private getEndpointName;
}
export declare const RateLimit: (config: RateLimitConfig) => (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export {};
