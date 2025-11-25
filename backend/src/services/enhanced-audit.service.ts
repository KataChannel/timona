import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { $Enums, Prisma } from '@prisma/client';

export interface AuditContext {
  userId?: string;
  sessionId?: string;
  request?: Request;
  correlationId?: string;
  batchId?: string;
  parentResource?: {
    type: string;
    id: string;
  };
}

export interface AuditOperation {
  action: string;
  resourceType: string;
  resourceId?: string;
  entityName?: string;
  operationType?: 'CRUD' | 'AUTH' | 'PERMISSION' | 'SECURITY' | 'SYSTEM';
  severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  tags?: string[];
  oldValues?: any;
  newValues?: any;
  details?: any;
  sensitiveData?: boolean;
  requiresReview?: boolean;
}

@Injectable()
export class EnhancedAuditService {
  private readonly logger = new Logger(EnhancedAuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log a comprehensive audit entry
   */
  async logOperation(
    operation: AuditOperation,
    context: AuditContext = {},
    performance?: {
      responseTime?: number;
      dbQueryTime?: number;
      dbQueryCount?: number;
      memoryUsage?: number;
      cpuUsage?: number;
    }
  ): Promise<void> {
    try {
      const auditData: Prisma.AuditLogCreateInput = {
        // Core audit info
        action: operation.action,
        resourceType: operation.resourceType,
        resourceId: operation.resourceId,
        entityName: operation.entityName,
        
        // Operation context
        operationType: operation.operationType || 'CRUD',
        severity: operation.severity || 'info',
        tags: operation.tags || [],
        
        // Data changes
        oldValues: operation.oldValues,
        newValues: operation.newValues,
        details: operation.details,
        
        // Request context
        user: context.userId ? { connect: { id: context.userId } } : undefined,
        sessionId: context.sessionId,
        correlationId: context.correlationId || this.generateCorrelationId(),
        batchId: context.batchId,
        
        // Parent resource tracking
        parentResourceType: context.parentResource?.type,
        parentResourceId: context.parentResource?.id,
        
        // Security flags
        sensitiveData: operation.sensitiveData || false,
        requiresReview: operation.requiresReview || false,
        
        // Request details
        ipAddress: context.request?.ip,
        userAgent: context.request?.get('user-agent'),
        method: context.request?.method,
        endpoint: context.request?.url,
        
        // Performance metrics
        responseTime: performance?.responseTime,
        dbQueryTime: performance?.dbQueryTime,
        dbQueryCount: performance?.dbQueryCount,
        memoryUsage: performance?.memoryUsage,
        cpuUsage: performance?.cpuUsage,
        
        // Session info
        sessionInfo: context.request ? {
          headers: this.sanitizeHeaders(context.request.headers),
          query: context.request.query,
          body: operation.sensitiveData ? '[REDACTED]' : context.request.body
        } : undefined,
        
        success: true
      };

      await this.prisma.auditLog.create({ data: auditData });
      
    } catch (error) {
      this.logger.error('Failed to create audit log entry', error);
      // Don't throw - audit logging should never break business logic
    }
  }

  /**
   * Log failed operations
   */
  async logFailure(
    operation: AuditOperation,
    context: AuditContext,
    error: Error,
    statusCode?: number
  ): Promise<void> {
    await this.logOperation(
      {
        ...operation,
        severity: 'error',
        details: {
          ...operation.details,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        }
      },
      context
    );
  }

  /**
   * Log batch operations
   */
  async logBatchOperation(
    operations: AuditOperation[],
    context: AuditContext
  ): Promise<void> {
    const batchId = this.generateBatchId();
    
    for (let i = 0; i < operations.length; i++) {
      await this.logOperation(
        {
          ...operations[i],
          tags: [...(operations[i].tags || []), 'batch']
        },
        {
          ...context,
          batchId,
        }
      );
    }
  }

  /**
   * Create audit decorator for GraphQL resolvers
   */
  createAuditDecorator(
    operation: Omit<AuditOperation, 'oldValues' | 'newValues'>,
    options: {
      captureArgs?: boolean;
      captureResult?: boolean;
      sensitiveFields?: string[];
    } = {}
  ) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        const context: AuditContext = {
          correlationId: this.generateCorrelationId()
        };
        
        try {
          // Capture old values for updates
          let oldValues: any = null;
          if (operation.action.includes('update') && args[1]?.id) {
            try {
              // Attempt to fetch current values before update
              const currentRecord = await this.prisma[operation.resourceType.toLowerCase()]?.findUnique({
                where: { id: args[1].id }
              });
              oldValues = currentRecord;
            } catch (e) {
              // Ignore if can't fetch old values
            }
          }
          
          const result = await method.apply(this, args);
          const responseTime = Date.now() - startTime;
          
          // Log successful operation
          await this.logOperation(
            {
              ...operation,
              resourceId: result?.id || args[1]?.id,
              entityName: result?.title || result?.name || result?.email,
              oldValues: options.captureArgs ? this.sanitizeData(oldValues, options.sensitiveFields) : undefined,
              newValues: options.captureResult ? this.sanitizeData(result, options.sensitiveFields) : undefined,
              details: options.captureArgs ? {
                args: this.sanitizeData(args, options.sensitiveFields)
              } : undefined
            },
            context,
            { responseTime }
          );
          
          return result;
        } catch (error) {
          const responseTime = Date.now() - startTime;
          
          // Log failed operation
          await this.logFailure(
            {
              ...operation,
              details: options.captureArgs ? {
                args: this.sanitizeData(args, options.sensitiveFields)
              } : undefined
            },
            context,
            error
          );
          
          throw error;
        }
      };
    };
  }

  /**
   * Get audit logs with advanced filtering
   */
  async getAuditLogs(filters: {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    operationType?: string;
    severity?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    correlationId?: string;
    batchId?: string;
    sensitiveData?: boolean;
    requiresReview?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.resourceType && { resourceType: filters.resourceType }),
      ...(filters.resourceId && { resourceId: filters.resourceId }),
      ...(filters.action && { action: { contains: filters.action, mode: 'insensitive' } }),
      ...(filters.operationType && { operationType: filters.operationType }),
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.tags?.length && { tags: { hasSome: filters.tags } }),
      ...(filters.correlationId && { correlationId: filters.correlationId }),
      ...(filters.batchId && { batchId: filters.batchId }),
      ...(filters.sensitiveData !== undefined && { sensitiveData: filters.sensitiveData }),
      ...(filters.requiresReview !== undefined && { requiresReview: filters.requiresReview }),
      ...((filters.dateFrom || filters.dateTo) && {
        timestamp: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo })
        }
      })
    };

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100); // Max 100 records per page
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(filters: {
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...((filters.dateFrom || filters.dateTo) && {
        timestamp: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo })
        }
      })
    };

    const [
      totalLogs,
      successRate,
      operationsByType,
      severityBreakdown,
      topResources,
      averageResponseTime
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      
      this.prisma.auditLog.count({
        where: { ...where, success: true }
      }).then(successCount => 
        this.prisma.auditLog.count({ where }).then(total => 
          total > 0 ? (successCount / total) * 100 : 0
        )
      ),
      
      this.prisma.auditLog.groupBy({
        by: ['operationType'],
        where,
        _count: {
          operationType: true
        }
      }),
      
      this.prisma.auditLog.groupBy({
        by: ['severity'],
        where,
        _count: {
          severity: true
        }
      }),
      
      this.prisma.auditLog.groupBy({
        by: ['resourceType'],
        where,
        _count: {
          resourceType: true
        },
        orderBy: {
          _count: {
            resourceType: 'desc'
          }
        },
        take: 10
      }),
      
      this.prisma.auditLog.aggregate({
        where: { ...where, responseTime: { not: null } },
        _avg: { responseTime: true }
      })
    ]);

    return {
      totalLogs,
      successRate,
      operationsByType,
      severityBreakdown,
      topResources,
      averageResponseTime: averageResponseTime._avg.responseTime
    };
  }

  private generateCorrelationId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private sanitizeData(data: any, sensitiveFields: string[] = []): any {
    if (!data) return data;
    
    const defaultSensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      allSensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }
}