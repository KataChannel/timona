import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
export declare class MinioHealthIndicator extends HealthIndicator {
    private readonly configService;
    private minioClient;
    private readonly logger;
    constructor(configService: ConfigService);
    isHealthy(key: string): Promise<HealthIndicatorResult>;
}
