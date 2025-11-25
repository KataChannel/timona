import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { AdvancedCacheService } from '../services/advanced-cache.service';
import { MobileOptimizationService, MobileClientInfo } from '../services/mobile-optimization.service';
import * as crypto from 'crypto';

@Injectable()
export class GraphQLPerformanceInterceptor implements NestInterceptor {
  constructor(
    private readonly performanceService: PerformanceMetricsService,
    private readonly cacheService: AdvancedCacheService,
    private readonly mobileService: MobileOptimizationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only intercept GraphQL requests
    if (context.getType<'graphql'>() !== 'graphql') {
      return next.handle();
    }
    
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();
    
    const startTime = Date.now();
    const operationName = info.operation.name?.value || 'anonymous';
    const operationType = info.operation.operation; // query, mutation, subscription
    const fieldName = info.fieldName;
    const userId = request.user?.id || 'anonymous';
    
    // Generate query hash for caching and tracking
    const queryHash = this.generateQueryHash(info.fieldNodes[0]);
    
    // Extract mobile client info
    const clientInfo = this.extractClientInfo(request);
    
    // Check if this is a cached query
    let cacheHit = false;
    const cacheKey = `gql:${operationType}:${fieldName}:${queryHash}`;
    
    return next.handle().pipe(
      tap({
        next: (result) => {
          const executionTime = Date.now() - startTime;
          
          // Record performance metrics
          this.recordPerformanceMetrics({
            operationName,
            operationType,
            fieldName,
            queryHash,
            executionTime,
            userId,
            cacheHit,
            success: true,
            complexity: this.calculateQueryComplexity(info),
            fieldCount: this.countFields(info.fieldNodes[0]),
            clientInfo
          });
          
          // Handle mobile optimization if needed
          if (this.isMobileClient(clientInfo)) {
            this.handleMobileOptimization(result, clientInfo, cacheKey);
          }
          
          // Cache successful results
          this.cacheResult(cacheKey, result, operationType, clientInfo);
        },
        error: (error) => {
          const executionTime = Date.now() - startTime;
          
          // Record error metrics
          this.recordPerformanceMetrics({
            operationName,
            operationType,
            fieldName,
            queryHash,
            executionTime,
            userId,
            cacheHit,
            success: false,
            error: error.message,
            complexity: this.calculateQueryComplexity(info),
            fieldCount: this.countFields(info.fieldNodes[0]),
            clientInfo
          });
          
          // Track GraphQL errors
          this.performanceService.incrementCounter('graphql.errors.total');
          this.performanceService.incrementCounter(`graphql.errors.${operationType}`);
        }
      })
    );
  }

  /**
   * Record comprehensive performance metrics
   */
  private recordPerformanceMetrics(data: {
    operationName: string;
    operationType: string;
    fieldName: string;
    queryHash: string;
    executionTime: number;
    userId: string;
    cacheHit: boolean;
    success: boolean;
    error?: string;
    complexity: number;
    fieldCount: number;
    clientInfo: MobileClientInfo;
  }) {
    const {
      operationName,
      operationType,
      fieldName,
      queryHash,
      executionTime,
      userId,
      cacheHit,
      success,
      error,
      complexity,
      fieldCount,
      clientInfo
    } = data;

    // Record query performance data
    this.performanceService.recordQueryPerformance({
      operationName,
      queryHash,
      duration: executionTime,
      cacheHit,
      complexity,
      fieldCount,
      userId
    });

    // Record operation counters
    this.performanceService.incrementCounter(`graphql.${operationType}.total`);
    
    if (success) {
      this.performanceService.incrementCounter(`graphql.${operationType}.success`);
    } else {
      this.performanceService.incrementCounter(`graphql.${operationType}.error`);
    }

    // Record detailed metrics
    this.performanceService.recordMetric({
      name: `graphql.${operationType}.execution_time`,
      value: executionTime,
      timestamp: Date.now(),
      tags: {
        operation: operationName,
        field: fieldName,
        success: success.toString(),
        cached: cacheHit.toString(),
        deviceType: clientInfo.deviceType,
        platform: clientInfo.platform
      },
      unit: 'ms'
    });

    // Record query complexity
    this.performanceService.recordMetric({
      name: `graphql.query.complexity`,
      value: complexity,
      timestamp: Date.now(),
      tags: {
        operation: operationName,
        field: fieldName
      },
      unit: 'count'
    });

    // Track mobile-specific metrics
    if (this.isMobileClient(clientInfo)) {
      this.performanceService.recordMetric({
        name: 'mobile.graphql.execution_time',
        value: executionTime,
        timestamp: Date.now(),
        tags: {
          platform: clientInfo.platform,
          connectionType: clientInfo.connectionType || 'unknown'
        },
        unit: 'ms'
      });
    }

    // Record error details if present
    if (error) {
      this.performanceService.recordMetric({
        name: 'graphql.error.details',
        value: 1,
        timestamp: Date.now(),
        tags: {
          operation: operationName,
          error: error.substring(0, 100), // Truncate long error messages
          userId
        },
        unit: 'count'
      });
    }
  }

  /**
   * Extract client information from request
   */
  private extractClientInfo(request: any): MobileClientInfo {
    const userAgent = request.headers['user-agent'] || '';
    const clientVersion = request.headers['x-client-version'] || '';
    const deviceType = request.headers['x-device-type'] || this.detectDeviceType(userAgent);
    const platform = request.headers['x-platform'] || this.detectPlatform(userAgent);
    const connectionType = request.headers['x-connection-type'] || 'unknown';
    const screenResolution = request.headers['x-screen-resolution'];
    const batteryLevel = request.headers['x-battery-level'];

    return {
      deviceType: deviceType as 'mobile' | 'tablet' | 'desktop',
      platform: platform as 'ios' | 'android' | 'web',
      version: clientVersion,
      screenResolution: screenResolution ? this.parseResolution(screenResolution) : undefined,
      connectionType: connectionType as any,
      batteryLevel: batteryLevel ? parseInt(batteryLevel) : undefined
    };
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
    const ua = userAgent.toLowerCase();
    
    if (/ipad|android.*tablet/.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) return 'mobile';
    return 'desktop';
  }

  /**
   * Detect platform from user agent
   */
  private detectPlatform(userAgent: string): 'ios' | 'android' | 'web' {
    const ua = userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'web';
  }

  /**
   * Parse screen resolution string
   */
  private parseResolution(resolution: string): { width: number; height: number } | undefined {
    const match = resolution.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2])
      };
    }
    return undefined;
  }

  /**
   * Check if client is mobile
   */
  private isMobileClient(clientInfo: MobileClientInfo): boolean {
    return clientInfo.deviceType === 'mobile' || clientInfo.deviceType === 'tablet';
  }

  /**
   * Handle mobile optimization
   */
  private async handleMobileOptimization(
    result: any,
    clientInfo: MobileClientInfo,
    cacheKey: string
  ) {
    // This would integrate with the mobile optimization service
    // For now, we'll just track mobile usage
    this.performanceService.recordMetric({
      name: 'mobile.queries.total',
      value: 1,
      timestamp: Date.now(),
      tags: {
        platform: clientInfo.platform,
        deviceType: clientInfo.deviceType
      },
      unit: 'count'
    });
  }

  /**
   * Cache GraphQL results intelligently
   */
  private async cacheResult(
    cacheKey: string,
    result: any,
    operationType: string,
    clientInfo: MobileClientInfo
  ) {
    // Don't cache mutations or subscriptions
    if (operationType !== 'query') return;

    // Don't cache null results or errors
    if (!result || result.errors) return;

    // Determine cache layer based on client and data size
    const resultSize = JSON.stringify(result).length;
    const isMobile = this.isMobileClient(clientInfo);
    
    let cacheLayer = 'L2_MEDIUM';
    let ttl = 300000; // 5 minutes default
    
    if (isMobile) {
      // More aggressive caching for mobile
      cacheLayer = 'L1_FAST';
      ttl = 600000; // 10 minutes
    } else if (resultSize > 10000) {
      // Large results go to slower cache
      cacheLayer = 'L3_SLOW';
      ttl = 1800000; // 30 minutes
    }

    await this.cacheService.set(cacheKey, result, {
      layer: cacheLayer,
      ttl,
      tags: ['graphql', `type:${operationType}`, `device:${clientInfo.deviceType}`]
    });
  }

  /**
   * Generate hash for GraphQL query
   */
  private generateQueryHash(fieldNode: any): string {
    // Create a consistent hash based on the query structure
    const queryString = this.serializeFieldNode(fieldNode);
    return crypto.createHash('md5').update(queryString).digest('hex').substring(0, 16);
  }

  /**
   * Serialize field node for consistent hashing
   */
  private serializeFieldNode(fieldNode: any): string {
    if (!fieldNode) return '';
    
    const parts = [fieldNode.name?.value || ''];
    
    if (fieldNode.arguments && fieldNode.arguments.length > 0) {
      const args = fieldNode.arguments
        .map((arg: any) => `${arg.name.value}:${this.serializeValue(arg.value)}`)
        .sort()
        .join(',');
      parts.push(args);
    }
    
    if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
      const selections = fieldNode.selectionSet.selections
        .map((selection: any) => this.serializeFieldNode(selection))
        .sort()
        .join(',');
      parts.push(selections);
    }
    
    return parts.join('|');
  }

  /**
   * Serialize GraphQL value for hashing
   */
  private serializeValue(value: any): string {
    if (!value) return '';
    
    switch (value.kind) {
      case 'StringValue':
      case 'IntValue':
      case 'FloatValue':
      case 'BooleanValue':
        return value.value;
      case 'Variable':
        return `$${value.name.value}`;
      case 'ListValue':
        return `[${value.values.map((v: any) => this.serializeValue(v)).join(',')}]`;
      case 'ObjectValue':
        return `{${value.fields
          .map((field: any) => `${field.name.value}:${this.serializeValue(field.value)}`)
          .sort()
          .join(',')}}`;
      default:
        return '';
    }
  }

  /**
   * Calculate query complexity
   */
  private calculateQueryComplexity(info: any): number {
    let complexity = 1; // Base complexity
    
    if (info.fieldNodes && info.fieldNodes.length > 0) {
      complexity += this.calculateFieldComplexity(info.fieldNodes[0]);
    }
    
    return complexity;
  }

  /**
   * Calculate field complexity recursively
   */
  private calculateFieldComplexity(fieldNode: any): number {
    let complexity = 1;
    
    if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
      for (const selection of fieldNode.selectionSet.selections) {
        complexity += this.calculateFieldComplexity(selection);
      }
    }
    
    // Add complexity for arguments
    if (fieldNode.arguments && fieldNode.arguments.length > 0) {
      complexity += fieldNode.arguments.length;
    }
    
    return complexity;
  }

  /**
   * Count fields in query
   */
  private countFields(fieldNode: any): number {
    let count = 1;
    
    if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
      for (const selection of fieldNode.selectionSet.selections) {
        count += this.countFields(selection);
      }
    }
    
    return count;
  }
}