import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { $Enums } from '@prisma/client';

// Security configuration for dynamic operations
export interface DynamicSecurityConfig {
  modelName: string;
  allowedOperations?: Array<'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE'>;
  roleRequirements?: {
    [key in 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE']?: $Enums.UserRoleType[];
  };
  ownershipCheck?: boolean; // Check if user owns the record
  maxBulkSize?: number; // Maximum number of items in bulk operations
  allowedFields?: {
    create?: string[];
    update?: string[];
    read?: string[];
  };
  restrictedFields?: {
    create?: string[];
    update?: string[];
    read?: string[];
  };
}

// Security decorator
export const DynamicSecurity = (config: DynamicSecurityConfig) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('dynamicSecurity', config, descriptor.value);
  };
};

@Injectable()
export class DynamicSecurityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();
    const user = req.user;
    const handler = context.getHandler();
    
    const securityConfig = this.reflector.get<DynamicSecurityConfig>('dynamicSecurity', handler);
    
    if (!securityConfig) {
      return true; // No security config, allow access
    }

    // Check if user is authenticated
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const args = gqlContext.getArgs();
    const operation = this.detectOperation(context);

    // Check allowed operations
    if (securityConfig.allowedOperations && !securityConfig.allowedOperations.includes(operation)) {
      throw new ForbiddenException(`Operation ${operation} not allowed for model ${securityConfig.modelName}`);
    }

    // Check role requirements
    if (securityConfig.roleRequirements?.[operation]) {
      const requiredRoles = securityConfig.roleRequirements[operation];
      if (!requiredRoles?.includes(user.role)) {
        throw new ForbiddenException(`Insufficient permissions for ${operation} on ${securityConfig.modelName}`);
      }
    }

    // Check bulk size limits
    if (operation.includes('BULK') && securityConfig.maxBulkSize) {
      const bulkData = this.extractBulkData(args);
      if (bulkData && bulkData.length > securityConfig.maxBulkSize) {
        throw new BadRequestException(`Bulk operation exceeds maximum size of ${securityConfig.maxBulkSize}`);
      }
    }

    // Check field restrictions
    await this.checkFieldRestrictions(securityConfig, operation, args, user);

    // Check ownership (if enabled)
    if (securityConfig.ownershipCheck && ['UPDATE', 'DELETE', 'BULK_UPDATE', 'BULK_DELETE'].includes(operation)) {
      await this.checkOwnership(securityConfig.modelName, args, user);
    }

    return true;
  }

  private detectOperation(context: ExecutionContext): 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE' {
    const handler = context.getHandler();
    const handlerName = handler.name;
    
    if (handlerName.includes('createBulk') || handlerName.includes('CreateBulk')) return 'BULK_CREATE';
    if (handlerName.includes('updateBulk') || handlerName.includes('UpdateBulk')) return 'BULK_UPDATE';
    if (handlerName.includes('deleteBulk') || handlerName.includes('DeleteBulk')) return 'BULK_DELETE';
    if (handlerName.includes('create') || handlerName.includes('Create')) return 'CREATE';
    if (handlerName.includes('update') || handlerName.includes('Update')) return 'UPDATE';
    if (handlerName.includes('delete') || handlerName.includes('Delete')) return 'DELETE';
    
    return 'READ';
  }

  private extractBulkData(args: any): any[] | null {
    if (args.input?.data && Array.isArray(args.input.data)) {
      return args.input.data;
    }
    return null;
  }

  private async checkFieldRestrictions(
    config: DynamicSecurityConfig,
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE',
    args: any,
    user: any
  ): Promise<void> {
    const operationType = operation.toLowerCase().replace('bulk_', '') as 'create' | 'update' | 'read';
    
    // Check allowed fields
    if (config.allowedFields?.[operationType]) {
      const data = this.extractOperationData(args, operation);
      if (data) {
        const dataFields = Object.keys(data);
        const allowedFields = config.allowedFields[operationType];
        const unauthorizedFields = dataFields.filter(field => !allowedFields!.includes(field));
        
        if (unauthorizedFields.length > 0) {
          throw new ForbiddenException(`Fields not allowed: ${unauthorizedFields.join(', ')}`);
        }
      }
    }

    // Check restricted fields
    if (config.restrictedFields?.[operationType]) {
      const data = this.extractOperationData(args, operation);
      if (data) {
        const dataFields = Object.keys(data);
        const restrictedFields = config.restrictedFields[operationType];
        const forbiddenFields = dataFields.filter(field => restrictedFields!.includes(field));
        
        if (forbiddenFields.length > 0) {
          throw new ForbiddenException(`Fields are restricted: ${forbiddenFields.join(', ')}`);
        }
      }
    }
  }

  private extractOperationData(args: any, operation: string): any {
    if (operation.includes('BULK')) {
      return args.input?.data?.[0]; // Check first item in bulk operation
    }
    return args.data || args.input?.data;
  }

  private async checkOwnership(modelName: string, args: any, user: any): Promise<void> {
    // This would need to be implemented based on your specific ownership logic
    // For example, checking if user.id matches the record's userId or ownerId
    
    if (args.id) {
      // For single record operations, check ownership of the specific record
      // Implementation would depend on your data access layer
    }
    
    if (args.input?.where) {
      // For bulk operations, ensure where clause includes user ownership
      // This prevents users from updating/deleting records they don't own
    }
  }
}

// Validation service for dynamic inputs
@Injectable()
export class DynamicValidationService {
  // Validate input data based on model schema
  validateInput(modelName: string, operation: string, data: any): void {
    switch (modelName.toLowerCase()) {
      case 'user':
        this.validateUserInput(operation, data);
        break;
      case 'post':
        this.validatePostInput(operation, data);
        break;
      case 'task':
        this.validateTaskInput(operation, data);
        break;
      default:
        this.validateGenericInput(operation, data);
    }
  }

  private validateUserInput(operation: string, data: any): void {
    if (operation === 'CREATE' || operation === 'BULK_CREATE') {
      if (!data.email || !this.isValidEmail(data.email)) {
        throw new BadRequestException('Valid email is required');
      }
      if (!data.username || data.username.length < 3) {
        throw new BadRequestException('Username must be at least 3 characters long');
      }
    }

    // Prevent role escalation
    if (data.role && !['USER', 'MODERATOR'].includes(data.role)) {
      throw new BadRequestException('Invalid role specified');
    }
  }

  private validatePostInput(operation: string, data: any): void {
    if (operation === 'CREATE' || operation === 'BULK_CREATE') {
      if (!data.title || data.title.length < 3) {
        throw new BadRequestException('Title must be at least 3 characters long');
      }
      if (!data.content || data.content.length < 10) {
        throw new BadRequestException('Content must be at least 10 characters long');
      }
    }

    // Validate slug format
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      throw new BadRequestException('Slug must contain only lowercase letters, numbers, and hyphens');
    }
  }

  private validateTaskInput(operation: string, data: any): void {
    if (operation === 'CREATE' || operation === 'BULK_CREATE') {
      if (!data.title || data.title.length < 3) {
        throw new BadRequestException('Task title must be at least 3 characters long');
      }
    }

    // Validate enum values
    if (data.priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.priority)) {
      throw new BadRequestException('Invalid priority value');
    }

    if (data.status && !['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(data.status)) {
      throw new BadRequestException('Invalid status value');
    }

    // Validate due date
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (dueDate < new Date()) {
        throw new BadRequestException('Due date cannot be in the past');
      }
    }
  }

  private validateGenericInput(operation: string, data: any): void {
    // Generic validation rules
    if (typeof data !== 'object' || data === null) {
      throw new BadRequestException('Invalid data format');
    }

    // Check for SQL injection attempts
    this.checkForSQLInjection(data);
    
    // Check for XSS attempts
    this.checkForXSS(data);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private checkForSQLInjection(data: any): void {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
      /(--|\/\*|\*\/|;|'|")/,
      /(\b(OR|AND)\b.*=.*)/i
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(dataString)) {
        throw new BadRequestException('Potentially malicious input detected');
      }
    }
  }

  private checkForXSS(data: any): void {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*on\w+\s*=.*?>/gi
    ];

    const dataString = JSON.stringify(data);
    
    for (const pattern of xssPatterns) {
      if (pattern.test(dataString)) {
        throw new BadRequestException('Potentially malicious script detected');
      }
    }
  }

  // Validate bulk operations
  validateBulkInput(modelName: string, operation: string, data: any[], maxSize: number = 100): void {
    if (!Array.isArray(data)) {
      throw new BadRequestException('Bulk data must be an array');
    }

    if (data.length === 0) {
      throw new BadRequestException('Bulk data cannot be empty');
    }

    if (data.length > maxSize) {
      throw new BadRequestException(`Bulk operation exceeds maximum size of ${maxSize}`);
    }

    // Validate each item
    data.forEach((item, index) => {
      try {
        this.validateInput(modelName, operation, item);
      } catch (error) {
        throw new BadRequestException(`Item ${index}: ${error.message}`);
      }
    });
  }
}

// Rate limiting service for dynamic operations
@Injectable()
export class DynamicRateLimitService {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(userId: string, operation: string, modelName: string): void {
    const key = `${userId}:${operation}:${modelName}`;
    const now = Date.now();
    const windowMs = this.getRateLimitWindow(operation);
    const maxRequests = this.getMaxRequests(operation);

    const current = this.requestCounts.get(key);

    if (!current || now > current.resetTime) {
      // Reset or initialize counter
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return;
    }

    if (current.count >= maxRequests) {
      throw new BadRequestException(`Rate limit exceeded for ${operation} on ${modelName}`);
    }

    current.count++;
  }

  private getRateLimitWindow(operation: string): number {
    // Return window in milliseconds
    switch (operation) {
      case 'BULK_CREATE':
      case 'BULK_UPDATE':
      case 'BULK_DELETE':
        return 60000; // 1 minute for bulk operations
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return 10000; // 10 seconds for single operations
      default:
        return 5000; // 5 seconds for read operations
    }
  }

  private getMaxRequests(operation: string): number {
    switch (operation) {
      case 'BULK_CREATE':
      case 'BULK_UPDATE':
      case 'BULK_DELETE':
        return 5; // 5 bulk operations per window
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return 50; // 50 single operations per window
      default:
        return 100; // 100 read operations per window
    }
  }
}

// Security configurations for different models
export const ModelSecurityConfigs: { [key: string]: DynamicSecurityConfig } = {
  User: {
    modelName: 'User',
    allowedOperations: ['CREATE', 'READ', 'UPDATE'],
    roleRequirements: {
      CREATE: [$Enums.UserRoleType.ADMIN],
      BULK_CREATE: [$Enums.UserRoleType.ADMIN],
      BULK_UPDATE: [$Enums.UserRoleType.ADMIN],
      BULK_DELETE: [$Enums.UserRoleType.ADMIN],
      DELETE: [$Enums.UserRoleType.ADMIN]
    },
    maxBulkSize: 50,
    restrictedFields: {
      create: ['role', 'isVerified', 'failedLoginAttempts'],
      update: ['role', 'password']
    },
    ownershipCheck: true
  },

  Post: {
    modelName: 'Post',
    allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE'],
    roleRequirements: {
      CREATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN],
      UPDATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN],
      DELETE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN],
      BULK_CREATE: [$Enums.UserRoleType.ADMIN],
      BULK_UPDATE: [$Enums.UserRoleType.ADMIN]
    },
    maxBulkSize: 20,
    ownershipCheck: true
  },

  Task: {
    modelName: 'Task',
    allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE'],
    roleRequirements: {
      READ: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN],
      CREATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN],
      UPDATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN],
      DELETE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN]
    },
    maxBulkSize: 100,
    ownershipCheck: true
  },

  Comment: {
    modelName: 'Comment',
    allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    roleRequirements: {
      CREATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN],
      UPDATE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN],
      DELETE: [$Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN, $Enums.UserRoleType.ADMIN]
    },
    maxBulkSize: 10,
    restrictedFields: {
      create: ['userId'],
      update: ['userId', 'postId']
    },
    ownershipCheck: true
  }
};
