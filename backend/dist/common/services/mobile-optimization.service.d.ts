import { AdvancedCacheService } from './advanced-cache.service';
import { PerformanceMetricsService } from './performance-metrics.service';
export interface MobileQueryOptimization {
    fieldSelection: string[];
    maxDepth: number;
    compressionEnabled: boolean;
    batchRequests: boolean;
    cacheStrategy: 'aggressive' | 'normal' | 'minimal';
}
export interface MobileClientInfo {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    platform: 'ios' | 'android' | 'web';
    version: string;
    screenResolution?: {
        width: number;
        height: number;
    };
    connectionType?: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
    batteryLevel?: number;
}
export interface OptimizedResponse {
    data: any;
    compressed: boolean;
    size: number;
    originalSize: number;
    compressionRatio: number;
    cacheHit: boolean;
    executionTime: number;
    metadata: {
        fieldsSelected: number;
        totalFields: number;
        compressionSavings: number;
    };
}
export declare class MobileOptimizationService {
    private readonly cacheService;
    private readonly performanceService;
    private readonly mobileQueries;
    private readonly optimizationPresets;
    private stats;
    constructor(cacheService: AdvancedCacheService, performanceService: PerformanceMetricsService);
    optimizeQuery(query: string, variables: any, clientInfo: MobileClientInfo, context: any): Promise<OptimizedResponse>;
    batchQueries(queries: Array<{
        query: string;
        variables: any;
    }>, clientInfo: MobileClientInfo, context: any): Promise<OptimizedResponse[]>;
    getMobileFieldSelection(query: string, clientInfo: MobileClientInfo): {
        optimizedQuery: string;
        selectedFields: string[];
    };
    getMobileStats(): {
        totalRequests: number;
        mobileRequests: number;
        mobilePercentage: number;
        compressionSavings: number;
        cacheSavings: number;
        averageResponseSize: number;
        optimizationEfficiency: number;
    };
    private isMobileClient;
    private getOptimizationForClient;
    private getConnectionScore;
    private generateMobileCacheKey;
    private hashQuery;
    private optimizeQueryForMobile;
    private removeHeavyFields;
    private optimizeVariablesForMobile;
    private executeOptimizedQuery;
    private transformDataForMobile;
    private simplifyNestedObjects;
    private compressResponse;
    private getCompressionThreshold;
    private extractMobileOptimizedFields;
    private buildOptimizedQuery;
    private countSelectedFields;
    private getCacheTtlForClient;
    private updatePerformanceMetrics;
}
