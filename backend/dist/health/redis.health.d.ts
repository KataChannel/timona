import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
export declare class RedisHealthIndicator extends HealthIndicator {
    private readonly configService;
    private redis;
    constructor(configService: ConfigService);
    isHealthy(key: string): Promise<HealthIndicatorResult>;
    onModuleDestroy(): Promise<void>;
}
