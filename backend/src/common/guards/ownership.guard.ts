/**
 * Ownership Guard
 * Guard để validate ownership của resource
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { RBACService } from '../services/rbac.service';
import {
  OWNERSHIP_KEY,
  OwnershipRequirement,
} from '../decorators/ownership.decorator';
import { RBAC_ERROR_MESSAGES } from '../constants/rbac.constants';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private rbacService: RBACService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get ownership requirement from decorator
    const ownershipReq = this.reflector.getAllAndOverride<OwnershipRequirement>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!ownershipReq) {
      return true; // No ownership requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ADMIN bypass ownership check
    if (user.roleType === 'ADMIN') {
      return true;
    }

    // Get resource ID from route params
    const resourceId = request.params[ownershipReq.paramName];
    if (!resourceId) {
      throw new NotFoundException(
        `Resource ID not found in params.${ownershipReq.paramName}`,
      );
    }

    // Check if user has 'all' scope permission (bypass ownership check if allowed)
    if (ownershipReq.allowWithAllScope) {
      const hasAllScope = await this.checkAllScopePermission(
        user.id,
        ownershipReq.resource,
        request.method,
      );

      if (hasAllScope) {
        return true; // User has 'all' scope, bypass ownership check
      }
    }

    // Fetch resource from database
    const resource = await this.fetchResource(
      ownershipReq.resource,
      resourceId,
    );

    if (!resource) {
      throw new NotFoundException(
        `${ownershipReq.resource} with ID ${resourceId} not found`,
      );
    }

    // Check ownership
    const isOwner = this.checkOwnership(
      resource,
      user.id,
      ownershipReq.ownershipField,
    );

    if (!isOwner) {
      throw new ForbiddenException(RBAC_ERROR_MESSAGES.OWNERSHIP_REQUIRED);
    }

    return true;
  }

  /**
   * Check if user has 'all' scope permission for the action
   */
  private async checkAllScopePermission(
    userId: string,
    resource: string,
    method: string,
  ): Promise<boolean> {
    const action = this.methodToAction(method);
    return this.rbacService.userHasPermission(userId, resource, action, 'all');
  }

  /**
   * Convert HTTP method to RBAC action
   */
  private methodToAction(method: string): string {
    const methodMap: Record<string, string> = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return methodMap[method.toUpperCase()] || 'access';
  }

  /**
   * Fetch resource from database based on resource type
   */
  private async fetchResource(
    resourceType: string,
    resourceId: string,
  ): Promise<any> {
    // Map resource types to Prisma models
    const modelMap: Record<string, any> = {
      blog: this.prisma.post,
      post: this.prisma.post,
      product: this.prisma.product,
      page: this.prisma.page,
      template: this.prisma.customTemplate,
      order: this.prisma.order,
      task: this.prisma.task,
      comment: this.prisma.comment,
    };

    const model = modelMap[resourceType.toLowerCase()];
    if (!model) {
      throw new Error(`Unknown resource type: ${resourceType}`);
    }

    return model.findUnique({ where: { id: resourceId } });
  }

  /**
   * Check if user owns the resource
   */
  private checkOwnership(
    resource: any,
    userId: string,
    ownershipField: string | string[],
  ): boolean {
    const fields = Array.isArray(ownershipField)
      ? ownershipField
      : [ownershipField];

    // Check if any ownership field matches user ID
    return fields.some((field) => {
      const ownerValue = this.getNestedProperty(resource, field);
      return ownerValue === userId;
    });
  }

  /**
   * Get nested property value from object
   * Supports dot notation: 'author.id', 'createdBy.userId'
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current?.[prop];
    }, obj);
  }
}
