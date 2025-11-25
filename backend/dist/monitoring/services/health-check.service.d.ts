import { HttpHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export interface HealthStatus {
    status: 'ok' | 'error' | 'shutting_down';
    timestamp: Date;
    uptime: number;
    checks: {
        database: HealthCheckResult;
        redis: HealthCheckResult;
        storage: HealthCheckResult;
        external_apis: HealthCheckResult;
        system_resources: HealthCheckResult;
    };
    info: {
        version: string;
        environment: string;
        nodeVersion: string;
        platform: string;
        architecture: string;
    };
}
export interface HealthCheckResult {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    message?: string;
    details?: Record<string, any>;
}
export interface SystemResourceHealth {
    cpu: {
        usage: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    memory: {
        usage: number;
        available: number;
        status: 'healthy' | 'warning' | 'critical';
    };
    disk: {
        usage: number;
        available: number;
        status: 'healthy' | 'warning' | 'critical';
    };
}
export declare class HealthCheckService {
    private readonly prisma;
    private readonly configService;
    private readonly httpHealthIndicator;
    private readonly logger;
    private readonly version;
    private readonly environment;
    private readonly startTime;
    constructor(prisma: PrismaService, configService: ConfigService, httpHealthIndicator: HttpHealthIndicator);
    performHealthCheck(): Promise<HealthStatus>;
    checkDatabaseHealth(): Promise<HealthCheckResult>;
    checkRedisHealth(): Promise<HealthCheckResult>;
    checkStorageHealth(): Promise<HealthCheckResult>;
    checkExternalApisHealth(): Promise<HealthCheckResult>;
    checkSystemResourcesHealth(): Promise<HealthCheckResult>;
    getSimpleHealthStatus(): Promise<{
        status: string;
        timestamp: Date;
    }>;
    private determineOverallStatus;
    private getResultFromSettled;
    private createErrorHealthStatus;
    private getCpuUsage;
    private determineResourceStatus;
    private getResourceStatusMessage;
}
