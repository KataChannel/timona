import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { AdvancedCacheService } from '../services/advanced-cache.service';
import { MobileOptimizationService } from '../services/mobile-optimization.service';
export declare class GraphQLPerformanceInterceptor implements NestInterceptor {
    private readonly performanceService;
    private readonly cacheService;
    private readonly mobileService;
    constructor(performanceService: PerformanceMetricsService, cacheService: AdvancedCacheService, mobileService: MobileOptimizationService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private recordPerformanceMetrics;
    private extractClientInfo;
    private detectDeviceType;
    private detectPlatform;
    private parseResolution;
    private isMobileClient;
    private handleMobileOptimization;
    private cacheResult;
    private generateQueryHash;
    private serializeFieldNode;
    private serializeValue;
    private calculateQueryComplexity;
    private calculateFieldComplexity;
    private countFields;
}
