import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
export declare class RedisHealthService implements OnModuleInit, OnModuleDestroy {
    private redis;
    private readonly logger;
    private isConnected;
    private healthCheckInterval;
    constructor(redis: Redis);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private startHealthCheck;
    private checkConnection;
    isHealthy(): Promise<boolean>;
    isConnectedNow(): boolean;
    executeWithFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T>;
}
