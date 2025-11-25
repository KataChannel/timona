import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { EnhancedAuditService, AuditOperation, AuditContext } from '../services/enhanced-audit.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: EnhancedAuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    
    // Get GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const args = gqlContext.getArgs();
    const contextValue = gqlContext.getContext();
    const request: Request = contextValue.req;

    // Extract user and session info
    const userId = contextValue.user?.id || contextValue.userId;
    const sessionId = request?.headers?.['x-session-id'] || contextValue.sessionId;

    // Determine operation details
    const operation = this.analyzeOperation(info, args);
    
    // Skip audit for non-modifying operations unless explicitly requested
    if (this.shouldSkipAudit(operation, info)) {
      return next.handle();
    }

    const auditContext: AuditContext = {
      userId,
      sessionId: sessionId as string,
      request,
      correlationId: request?.headers?.['x-correlation-id'] as string,
    };

    return next.handle().pipe(
      tap(async (result) => {
        const responseTime = Date.now() - startTime;
        
        try {
          await this.auditService.logOperation(
            {
              ...operation,
              resourceId: this.extractResourceId(result, args),
              entityName: this.extractEntityName(result, args),
              newValues: this.shouldCaptureResult(operation) ? this.sanitizeResult(result) : undefined,
              details: {
                operationName: info.operation.name?.value,
                selectionSet: this.extractSelectionSet(info),
                variables: this.sanitizeVariables(args)
              }
            },
            auditContext,
            { responseTime }
          );
        } catch (error) {
          this.logger.error('Failed to log audit entry', error);
        }
      }),
      catchError(async (error) => {
        const responseTime = Date.now() - startTime;
        
        try {
          await this.auditService.logFailure(
            {
              ...operation,
              details: {
                operationName: info.operation.name?.value,
                variables: this.sanitizeVariables(args),
                error: {
                  message: error.message,
                  stack: error.stack
                }
              }
            },
            auditContext,
            error
          );
        } catch (auditError) {
          this.logger.error('Failed to log audit failure', auditError);
        }
        
        throw error;
      })
    );
  }

  private analyzeOperation(info: any, args: any): AuditOperation {
    const fieldName = info.fieldName;
    const typeName = info.parentType.name;
    
    // Determine action and operation type
    let action = fieldName;
    let operationType: 'CRUD' | 'AUTH' | 'PERMISSION' | 'SECURITY' | 'SYSTEM' = 'CRUD';
    let severity: 'debug' | 'info' | 'warn' | 'error' | 'critical' = 'info';
    let tags: string[] = [];
    let sensitiveData = false;
    let requiresReview = false;

    // Analyze field name patterns
    if (fieldName.startsWith('create')) {
      action = 'CREATE';
      tags.push('create');
    } else if (fieldName.startsWith('update')) {
      action = 'UPDATE';
      tags.push('update');
    } else if (fieldName.startsWith('delete') || fieldName.startsWith('remove')) {
      action = 'DELETE';
      severity = 'warn';
      tags.push('delete');
      requiresReview = true;
    } else if (fieldName.startsWith('login') || fieldName.startsWith('auth')) {
      action = 'LOGIN';
      operationType = 'AUTH';
      sensitiveData = true;
      tags.push('authentication');
    } else if (fieldName.startsWith('logout')) {
      action = 'LOGOUT';
      operationType = 'AUTH';
      tags.push('authentication');
    } else if (fieldName.includes('password') || fieldName.includes('token')) {
      operationType = 'SECURITY';
      sensitiveData = true;
      severity = 'warn';
      tags.push('security');
    } else if (fieldName.includes('permission') || fieldName.includes('role')) {
      operationType = 'PERMISSION';
      severity = 'warn';
      requiresReview = true;
      tags.push('permission');
    } else if (fieldName.startsWith('get') || fieldName.startsWith('find') || fieldName.startsWith('list')) {
      action = 'READ';
      tags.push('read');
    }

    // Determine resource type
    let resourceType = this.extractResourceType(fieldName, info);

    // Add bulk operation tags
    if (fieldName.includes('bulk') || fieldName.includes('many') || Array.isArray(args.data)) {
      tags.push('bulk');
    }

    return {
      action,
      resourceType,
      operationType,
      severity,
      tags,
      sensitiveData,
      requiresReview
    };
  }

  private extractResourceType(fieldName: string, info: any): string {
    // Try to extract from field name
    const patterns = [
      /^(create|update|delete|get|find|list)([A-Z][a-zA-Z]*)/,
      /^([a-z]+)(Create|Update|Delete|Get|Find|List)/,
    ];

    for (const pattern of patterns) {
      const match = fieldName.match(pattern);
      if (match) {
        return match[2] || match[1];
      }
    }

    // Fall back to return type name
    const returnType = info.returnType.toString().replace(/[\[\]!]/g, '');
    return returnType || 'Unknown';
  }

  private extractResourceId(result: any, args: any): string | undefined {
    if (result?.id) return result.id;
    if (args?.id) return args.id;
    if (args?.where?.id) return args.where.id;
    if (args?.data?.id) return args.data.id;
    return undefined;
  }

  private extractEntityName(result: any, args: any): string | undefined {
    // Try different common name fields
    const nameFields = ['name', 'title', 'displayName', 'username', 'email', 'firstName'];
    
    for (const field of nameFields) {
      if (result?.[field]) return result[field];
      if (args?.data?.[field]) return args.data[field];
    }
    
    return undefined;
  }

  private shouldSkipAudit(operation: AuditOperation, info: any): boolean {
    // Skip read operations unless they're sensitive
    if (operation.action === 'READ' && !operation.sensitiveData) {
      return true;
    }

    // Skip introspection queries
    if (info.fieldName.startsWith('__')) {
      return true;
    }

    // Skip health checks and utility queries
    const skipPatterns = ['ping', 'health', 'version', 'status'];
    if (skipPatterns.some(pattern => info.fieldName.toLowerCase().includes(pattern))) {
      return true;
    }

    return false;
  }

  private shouldCaptureResult(operation: AuditOperation): boolean {
    // Capture results for create/update operations
    return ['CREATE', 'UPDATE'].includes(operation.action) && !operation.sensitiveData;
  }

  private sanitizeResult(result: any): any {
    if (!result) return result;

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
    if (typeof result === 'object') {
      const sanitized = { ...result };
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    }

    return result;
  }

  private sanitizeVariables(args: any): any {
    if (!args) return args;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
    const sanitized = JSON.parse(JSON.stringify(args));

    const sanitizeObject = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        });
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private extractSelectionSet(info: any): string[] {
    const selections = info.fieldNodes[0]?.selectionSet?.selections || [];
    return selections.map((selection: any) => selection.name?.value).filter(Boolean);
  }
}