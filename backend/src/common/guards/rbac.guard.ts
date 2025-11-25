/**
 * RBAC Guard
 * Guard để kiểm tra permissions của user
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../services/audit-log.service';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
  IS_PUBLIC_KEY,
  PermissionRequirement,
} from '../decorators/rbac.decorator';
import { scopeIncludes } from '../constants/rbac.constants';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get user from context (supports both HTTP and GraphQL)
    let request;
    let user;
    
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
      user = request.user;
    } else {
      // GraphQL context
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      request = ctx.req;
      user = ctx.req?.user;
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is ADMIN (bypass all checks)
    if (user.roleType === 'ADMIN') {
      // Log admin bypass
      const route = request.route?.path || request.url;
      await this.auditLogService.logAdminBypass(
        user.id,
        route,
        request.method,
        request.ip,
        request.headers['user-agent'],
      );
      return true;
    }

    // Get required permissions from decorator
    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionRequirement[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions or roles required, allow access
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    // Check roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = await this.checkUserHasRole(user.id, requiredRoles);
      if (hasRole) {
        // Log access granted
        await this.auditLogService.logAccessGranted(
          user.id,
          `role:${requiredRoles.join(',')}`,
          'access',
          'role',
          request.ip,
          request.headers['user-agent'],
        );
        return true;
      }
    }

    // Check permissions if specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = await this.checkUserHasPermissions(
        user.id,
        requiredPermissions,
      );
      if (hasPermission) {
        // Log access granted
        const permissionStr = requiredPermissions
          .map((p) => `${p.resource}:${p.action}${p.scope ? ':' + p.scope : ''}`)
          .join(',');
        await this.auditLogService.logAccessGranted(
          user.id,
          permissionStr,
          'access',
          'permission',
          request.ip,
          request.headers['user-agent'],
        );
        return true;
      }
    }

    // Log access denied
    const deniedResource = requiredPermissions
      ? requiredPermissions.map((p) => `${p.resource}:${p.action}`).join(',')
      : requiredRoles?.join(',') || 'unknown';
    await this.auditLogService.logAccessDenied(
      user.id,
      deniedResource,
      'access',
      'required',
      'Insufficient permissions',
      request.ip,
      request.headers['user-agent'],
    );

    throw new ForbiddenException(
      'You do not have permission to access this resource',
    );
  }

  /**
   * Check if user has any of the required roles
   */
  private async checkUserHasRole(
    userId: string,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        effect: 'allow',
        role: {
          name: { in: requiredRoles },
          isActive: true,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: true,
      },
    });

    return userRoles.length > 0;
  }

  /**
   * Check if user has all required permissions
   */
  private async checkUserHasPermissions(
    userId: string,
    requiredPermissions: PermissionRequirement[],
  ): Promise<boolean> {
    for (const perm of requiredPermissions) {
      const hasPermission = await this.checkSinglePermission(userId, perm);
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check single permission with deny > allow rule
   * Deny permissions always take precedence over allow permissions
   */
  private async checkSinglePermission(
    userId: string,
    permission: PermissionRequirement,
  ): Promise<boolean> {
    // STEP 1: Check for DENY permissions first (deny > allow rule)
    // Check direct deny permissions
    const directDeny = await this.prisma.userPermission.findFirst({
      where: {
        userId,
        effect: 'deny',
        permission: {
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope || null,
          isActive: true,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (directDeny) {
      return false; // Explicitly denied
    }

    // Check deny through roles
    const roleDeny = await this.prisma.userRoleAssignment.findFirst({
      where: {
        userId,
        role: {
          isActive: true,
          permissions: {
            some: {
              effect: 'deny',
              permission: {
                resource: permission.resource,
                action: permission.action,
                scope: permission.scope || null,
                isActive: true,
              },
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
          },
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (roleDeny) {
      return false; // Denied through role
    }

    // STEP 2: Check for ALLOW permissions (only if not denied)
    // Check direct user permissions with scope hierarchy
    const directAllowPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        effect: 'allow',
        permission: {
          resource: permission.resource,
          action: permission.action,
          isActive: true,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        permission: true,
      },
    });

    // Check if any direct permission scope includes required scope
    for (const up of directAllowPermissions) {
      if (scopeIncludes(up.permission.scope, permission.scope)) {
        return true; // Allowed directly with scope hierarchy
      }
    }

    // Check permissions through roles with scope hierarchy
    const rolePermissions = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        effect: 'allow',
        role: {
          isActive: true,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                effect: 'allow',
                permission: {
                  resource: permission.resource,
                  action: permission.action,
                  isActive: true,
                },
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } },
                ],
              },
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if any role permission scope includes required scope
    for (const ra of rolePermissions) {
      for (const rp of ra.role.permissions) {
        if (scopeIncludes(rp.permission.scope, permission.scope)) {
          return true; // Allowed through role with scope hierarchy
        }
      }
    }

    return false; // No matching permission found
  }
}
