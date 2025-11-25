import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { LMSPermission, hasAnyPermission } from '../permissions/lms.permissions';
import { LMS_PERMISSIONS_KEY } from '../decorators/lms-permissions.decorator';

@Injectable()
export class LMSPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<LMSPermission[]>(
      LMS_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    // Get user from GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user) {
      return false;
    }

    // Check if user has any of the required permissions
    return hasAnyPermission(user.roleType, requiredPermissions);
  }
}
