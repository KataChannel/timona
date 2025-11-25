/**
 * RBAC Service
 * Service để quản lý roles, permissions và user assignments
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RBACCacheService } from './rbac-cache.service';
import { AuditLogService } from './audit-log.service';
import { scopeIncludes } from '../constants/rbac.constants';

@Injectable()
export class RBACService {
  constructor(
    private prisma: PrismaService,
    private cacheService: RBACCacheService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Get all roles
   */
  async getAllRoles() {
    return this.prisma.role.findMany({
      where: { isActive: true },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { displayName: 'asc' }],
    });
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Get all permissions grouped by category
   */
  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    });

    // Group by category
    const grouped = permissions.reduce((acc, perm) => {
      const category = perm.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return grouped;
  }

  /**
   * Get user's roles (with cache)
   */
  async getUserRoles(userId: string) {
    // Check cache first
    const cached = await this.cacheService.getUserRoles(userId);
    if (cached) {
      return cached;
    }

    // Query from database
    const roles = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        effect: 'allow',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Cache the result
    await this.cacheService.setUserRoles(userId, roles);

    return roles;
  }

  /**
   * Get user's all permissions (from roles + direct assignments) with cache
   */
  async getUserPermissions(userId: string) {
    // Check cache first
    const cached = await this.cacheService.getUserPermissions(userId);
    if (cached) {
      return cached;
    }

    // Query from database
    // Get permissions from roles
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

    // Get direct permissions
    const directPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        effect: 'allow',
        permission: {
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

    // Combine and deduplicate
    const allPermissions = new Map();

    // Add role permissions
    rolePermissions.forEach((ra) => {
      ra.role.permissions.forEach((rp) => {
        const key = `${rp.permission.resource}:${rp.permission.action}:${rp.permission.scope}`;
        allPermissions.set(key, {
          ...rp.permission,
          source: 'role',
          roleName: ra.role.displayName,
        });
      });
    });

    // Add direct permissions
    directPermissions.forEach((up) => {
      const key = `${up.permission.resource}:${up.permission.action}:${up.permission.scope}`;
      if (!allPermissions.has(key)) {
        allPermissions.set(key, {
          ...up.permission,
          source: 'direct',
        });
      }
    });

    const permissions = Array.from(allPermissions.values());

    // Cache the result
    await this.cacheService.setUserPermissions(userId, permissions);

    return permissions;
  }

  /**
   * Assign role to user (with cache invalidation)
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy?: string,
    expiresAt?: Date,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if already assigned
    const existing = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Role already assigned to user');
    }

    // Assign role
    const result = await this.prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        effect: 'allow',
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Invalidate user cache
    await this.cacheService.invalidateUserCache(userId);

    // Log audit event
    await this.auditLogService.logRoleAssignment(
      assignedBy || 'system',
      userId,
      roleId,
      role.name,
      expiresAt,
    );

    return result;
  }

  /**
   * Remove role from user (with cache invalidation)
   */
  async removeRoleFromUser(userId: string, roleId: string, currentUserId?: string) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.prisma.userRoleAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    // Invalidate user cache
    await this.cacheService.invalidateUserCache(userId);

    // Log audit event
    await this.auditLogService.logRoleRemoval(
      currentUserId || 'system',
      userId,
      roleId,
      assignment.role.name,
    );

    return { success: true, message: 'Role removed from user' };
  }

  /**
   * Check if user has permission (with scope hierarchy)
   */
  async userHasPermission(
    userId: string,
    resource: string,
    action: string,
    scope?: string,
  ): Promise<boolean> {
    // Check direct permissions with scope hierarchy
    const directPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        effect: 'allow',
        permission: {
          resource,
          action,
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
    for (const up of directPermissions) {
      if (scopeIncludes(up.permission.scope, scope)) {
        return true;
      }
    }

    // Check permissions through roles with scope hierarchy
    const roleAssignments = await this.prisma.userRoleAssignment.findMany({
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
                  resource,
                  action,
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
    for (const ra of roleAssignments) {
      for (const rp of ra.role.permissions) {
        if (scopeIncludes(rp.permission.scope, scope)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.userRoleAssignment.findMany({
      where: {
        roleId,
        effect: 'allow',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
