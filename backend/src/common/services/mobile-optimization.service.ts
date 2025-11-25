import { Injectable } from '@nestjs/common';
import { AdvancedCacheService } from './advanced-cache.service';
import { PerformanceMetricsService } from './performance-metrics.service';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

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
  screenResolution?: { width: number; height: number };
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

@Injectable()
export class MobileOptimizationService {
  private readonly mobileQueries = new Map<string, MobileQueryOptimization>();
  
  // Mobile optimization presets
  private readonly optimizationPresets = {
    'low-end-mobile': {
      maxImageSize: 50 * 1024, // 50KB
      maxResponseSize: 100 * 1024, // 100KB
      compressionThreshold: 1024, // 1KB
      maxComplexity: 50,
      batchSize: 3,
      cacheStrategy: 'aggressive' as const
    },
    'mid-range-mobile': {
      maxImageSize: 200 * 1024, // 200KB
      maxResponseSize: 500 * 1024, // 500KB
      compressionThreshold: 2048, // 2KB
      maxComplexity: 100,
      batchSize: 5,
      cacheStrategy: 'normal' as const
    },
    'high-end-mobile': {
      maxImageSize: 500 * 1024, // 500KB
      maxResponseSize: 1024 * 1024, // 1MB
      compressionThreshold: 4096, // 4KB
      maxComplexity: 200,
      batchSize: 10,
      cacheStrategy: 'normal' as const
    },
    'tablet': {
      maxImageSize: 1024 * 1024, // 1MB
      maxResponseSize: 2 * 1024 * 1024, // 2MB
      compressionThreshold: 8192, // 8KB
      maxComplexity: 300,
      batchSize: 15,
      cacheStrategy: 'minimal' as const
    }
  };

  // Stats tracking
  private stats = {
    totalRequests: 0,
    mobileRequests: 0,
    compressionSavings: 0,
    cacheSavings: 0,
    averageResponseSize: 0,
    optimizationHits: 0,
  };

  constructor(
    private readonly cacheService: AdvancedCacheService,
    private readonly performanceService: PerformanceMetricsService,
  ) {}

  /**
   * Optimize GraphQL query for mobile clients
   */
  async optimizeQuery(
    query: string,
    variables: any,
    clientInfo: MobileClientInfo,
    context: any
  ): Promise<OptimizedResponse> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    if (this.isMobileClient(clientInfo)) {
      this.stats.mobileRequests++;
    }

    // Get optimization settings based on client
    const optimization = this.getOptimizationForClient(clientInfo);
    
    // Generate cache key
    const cacheKey = this.generateMobileCacheKey(query, variables, clientInfo);
    
    // Check cache first
    const cached = await this.cacheService.get<OptimizedResponse>(
      cacheKey,
      { 
        layer: optimization.cacheStrategy === 'aggressive' ? 'L1_FAST' : 'L2_MEDIUM',
        tags: ['mobile', `platform:${clientInfo.platform}`, `device:${clientInfo.deviceType}`]
      }
    );

    if (cached) {
      this.stats.cacheSavings++;
      cached.cacheHit = true;
      return cached;
    }

    // Process query with mobile optimizations
    const optimizedQuery = this.optimizeQueryForMobile(query, optimization);
    const optimizedVariables = this.optimizeVariablesForMobile(variables, clientInfo);

    // Execute query (mock implementation - replace with actual GraphQL execution)
    const queryResult = await this.executeOptimizedQuery(
      optimizedQuery,
      optimizedVariables,
      context
    );

    // Apply mobile-specific data transformations
    const transformedData = this.transformDataForMobile(queryResult, clientInfo, optimization);
    
    // Prepare response
    const originalSize = JSON.stringify(queryResult).length;
    let responseData = JSON.stringify(transformedData);
    let compressed = false;
    let compressionRatio = 1;

    // Apply compression for mobile clients
    if (optimization.compressionEnabled && responseData.length > this.getCompressionThreshold(clientInfo)) {
      const compressedData = await this.compressResponse(responseData);
      if (compressedData.length < responseData.length * 0.8) { // Only use if >20% savings
        responseData = compressedData.toString('base64');
        compressed = true;
        compressionRatio = originalSize / compressedData.length;
        this.stats.compressionSavings += (originalSize - compressedData.length);
      }
    }

    const response: OptimizedResponse = {
      data: compressed ? responseData : transformedData,
      compressed,
      size: responseData.length,
      originalSize,
      compressionRatio,
      cacheHit: false,
      executionTime: Date.now() - startTime,
      metadata: {
        fieldsSelected: this.countSelectedFields(optimizedQuery),
        totalFields: this.countSelectedFields(query),
        compressionSavings: compressed ? originalSize - responseData.length : 0
      }
    };

    // Cache the response
    const cacheOptions = {
      layer: optimization.cacheStrategy === 'aggressive' ? 'L1_FAST' : 'L2_MEDIUM',
      ttl: this.getCacheTtlForClient(clientInfo),
      tags: ['mobile', `platform:${clientInfo.platform}`, `device:${clientInfo.deviceType}`]
    };

    await this.cacheService.set(cacheKey, response, cacheOptions);

    // Update performance metrics
    this.updatePerformanceMetrics(response, clientInfo);

    return response;
  }

  /**
   * Batch multiple queries for mobile clients
   */
  async batchQueries(
    queries: Array<{ query: string; variables: any }>,
    clientInfo: MobileClientInfo,
    context: any
  ): Promise<OptimizedResponse[]> {
    const optimization = this.getOptimizationForClient(clientInfo);
    const batchSize = Math.min(queries.length, optimization.batchSize || 5);
    
    const results: OptimizedResponse[] = [];
    
    // Process in batches
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      
      const batchPromises = batch.map(({ query, variables }) =>
        this.optimizeQuery(query, variables, clientInfo, context)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get optimized field selection for mobile
   */
  getMobileFieldSelection(
    query: string,
    clientInfo: MobileClientInfo
  ): { optimizedQuery: string; selectedFields: string[] } {
    const optimization = this.getOptimizationForClient(clientInfo);
    const mobileFields = this.extractMobileOptimizedFields(query, clientInfo);
    
    return {
      optimizedQuery: this.buildOptimizedQuery(query, mobileFields),
      selectedFields: mobileFields
    };
  }

  /**
   * Get mobile optimization statistics
   */
  getMobileStats(): {
    totalRequests: number;
    mobileRequests: number;
    mobilePercentage: number;
    compressionSavings: number;
    cacheSavings: number;
    averageResponseSize: number;
    optimizationEfficiency: number;
  } {
    return {
      totalRequests: this.stats.totalRequests,
      mobileRequests: this.stats.mobileRequests,
      mobilePercentage: this.stats.totalRequests > 0 
        ? (this.stats.mobileRequests / this.stats.totalRequests) * 100 
        : 0,
      compressionSavings: this.stats.compressionSavings,
      cacheSavings: this.stats.cacheSavings,
      averageResponseSize: this.stats.averageResponseSize,
      optimizationEfficiency: this.stats.optimizationHits / Math.max(this.stats.mobileRequests, 1) * 100
    };
  }

  /**
   * Check if client is mobile
   */
  private isMobileClient(clientInfo: MobileClientInfo): boolean {
    return clientInfo.deviceType === 'mobile' || 
           (clientInfo.deviceType === 'tablet' && clientInfo.screenResolution && 
            clientInfo.screenResolution.width < 768);
  }

  /**
   * Get optimization settings for client
   */
  private getOptimizationForClient(clientInfo: MobileClientInfo): any {
    if (clientInfo.deviceType === 'tablet') {
      return this.optimizationPresets['tablet'];
    }
    
    if (clientInfo.deviceType === 'mobile') {
      // Detect device tier based on multiple factors
      const connectionScore = this.getConnectionScore(clientInfo.connectionType);
      const batteryScore = clientInfo.batteryLevel ? clientInfo.batteryLevel / 100 : 1;
      const overallScore = connectionScore * batteryScore;
      
      if (overallScore < 0.3) return this.optimizationPresets['low-end-mobile'];
      if (overallScore < 0.7) return this.optimizationPresets['mid-range-mobile'];
      return this.optimizationPresets['high-end-mobile'];
    }
    
    return this.optimizationPresets['high-end-mobile']; // Default for desktop
  }

  /**
   * Get connection quality score
   */
  private getConnectionScore(connectionType?: string): number {
    switch (connectionType) {
      case 'wifi': return 1.0;
      case '4g': return 0.8;
      case '3g': return 0.5;
      case '2g': return 0.2;
      default: return 0.7; // Unknown, assume moderate
    }
  }

  /**
   * Generate mobile-specific cache key
   */
  private generateMobileCacheKey(query: string, variables: any, clientInfo: MobileClientInfo): string {
    const key = `mobile:${clientInfo.platform}:${clientInfo.deviceType}:${clientInfo.connectionType || 'unknown'}`;
    const queryHash = this.hashQuery(query + JSON.stringify(variables));
    return `${key}:${queryHash}`;
  }

  /**
   * Hash query for caching
   */
  private hashQuery(input: string): string {
    // Simple hash function - replace with crypto.createHash in production
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Optimize query for mobile
   */
  private optimizeQueryForMobile(query: string, optimization: any): string {
    // Simplified optimization - in production, use proper GraphQL AST manipulation
    let optimizedQuery = query;
    
    // Remove unnecessary fields for mobile
    if (optimization.cacheStrategy === 'aggressive') {
      optimizedQuery = this.removeHeavyFields(optimizedQuery);
    }
    
    return optimizedQuery;
  }

  /**
   * Remove heavy fields from query
   */
  private removeHeavyFields(query: string): string {
    // Remove fields that are not mobile-friendly
    const heavyFields = ['fullDescription', 'largeImages', 'metadata', 'auditLogs'];
    let result = query;
    
    heavyFields.forEach(field => {
      const fieldRegex = new RegExp(`\\s*${field}\\s*`, 'g');
      result = result.replace(fieldRegex, '');
    });
    
    return result;
  }

  /**
   * Optimize variables for mobile
   */
  private optimizeVariablesForMobile(variables: any, clientInfo: MobileClientInfo): any {
    const optimized = { ...variables };
    const preset = this.getOptimizationForClient(clientInfo);
    
    // Reduce pagination limits for mobile
    if (optimized.limit && optimized.limit > 20) {
      optimized.limit = Math.min(optimized.limit, 20);
    }
    
    // Optimize image sizes
    if (optimized.imageSize) {
      optimized.imageSize = Math.min(optimized.imageSize, preset.maxImageSize);
    }
    
    return optimized;
  }

  /**
   * Execute optimized query (mock implementation)
   */
  private async executeOptimizedQuery(query: string, variables: any, context: any): Promise<any> {
    // Mock execution - replace with actual GraphQL execution
    return {
      todos: [
        { id: '1', title: 'Sample Todo', completed: false },
        { id: '2', title: 'Another Todo', completed: true }
      ]
    };
  }

  /**
   * Transform data for mobile clients
   */
  private transformDataForMobile(data: any, clientInfo: MobileClientInfo, optimization: any): any {
    if (!data) return data;
    
    // Apply mobile-specific transformations
    const transformed = JSON.parse(JSON.stringify(data)); // Deep clone
    
    // Simplify nested objects for mobile
    if (clientInfo.deviceType === 'mobile') {
      this.simplifyNestedObjects(transformed, 3); // Max depth 3
    }
    
    return transformed;
  }

  /**
   * Simplify nested objects by limiting depth
   */
  private simplifyNestedObjects(obj: any, maxDepth: number, currentDepth = 0): void {
    if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') {
      return;
    }
    
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        // Limit array sizes
        if (obj[key].length > 10) {
          obj[key] = obj[key].slice(0, 10);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.simplifyNestedObjects(obj[key], maxDepth, currentDepth + 1);
      }
    });
  }

  /**
   * Compress response for mobile
   */
  private async compressResponse(data: string): Promise<Buffer> {
    return await gzip(Buffer.from(data, 'utf8'));
  }

  /**
   * Get compression threshold based on client
   */
  private getCompressionThreshold(clientInfo: MobileClientInfo): number {
    const preset = this.getOptimizationForClient(clientInfo);
    return preset.compressionThreshold;
  }

  /**
   * Extract mobile-optimized fields from query
   */
  private extractMobileOptimizedFields(query: string, clientInfo: MobileClientInfo): string[] {
    // Simplified field extraction - use proper GraphQL AST in production
    const mobileOptimizedFields = [
      'id', 'title', 'completed', 'createdAt', 'updatedAt',
      'userId', 'priority', 'dueDate'
    ];
    
    return mobileOptimizedFields;
  }

  /**
   * Build optimized query with selected fields
   */
  private buildOptimizedQuery(originalQuery: string, selectedFields: string[]): string {
    // Simplified query building - use proper GraphQL AST manipulation in production
    return originalQuery; // Return original for now
  }

  /**
   * Count selected fields in query
   */
  private countSelectedFields(query: string): number {
    // Simplified field counting
    const fieldMatches = query.match(/\w+/g) || [];
    return fieldMatches.length;
  }

  /**
   * Get cache TTL based on client characteristics
   */
  private getCacheTtlForClient(clientInfo: MobileClientInfo): number {
    if (clientInfo.deviceType === 'mobile' && 
        (clientInfo.connectionType === '2g' || clientInfo.connectionType === '3g')) {
      return 600000; // 10 minutes for slow connections
    }
    
    return 300000; // 5 minutes default
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(response: OptimizedResponse, clientInfo: MobileClientInfo): void {
    this.stats.averageResponseSize = (
      (this.stats.averageResponseSize * (this.stats.totalRequests - 1)) + response.size
    ) / this.stats.totalRequests;

    if (response.compressionRatio > 1.2) {
      this.stats.optimizationHits++;
    }

    this.performanceService.recordMetric({
      name: 'mobile.response.size',
      value: response.size,
      timestamp: Date.now(),
      tags: {
        platform: clientInfo.platform,
        deviceType: clientInfo.deviceType,
        compressed: response.compressed.toString()
      },
      unit: 'bytes'
    });

    this.performanceService.recordMetric({
      name: 'mobile.response.execution_time',
      value: response.executionTime,
      timestamp: Date.now(),
      tags: {
        platform: clientInfo.platform,
        deviceType: clientInfo.deviceType
      },
      unit: 'ms'
    });
  }
}