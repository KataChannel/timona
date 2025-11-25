import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role, Permission, UserRoleAssignment, UserPermission, ResourceAccess } from '@prisma/client';
import {
  RoleWithPermissions,
  UserRoleInfo,
  CreateRoleDto,
  CreatePermissionDto,
  AssignRoleDto,
  GrantPermissionDto,
  CheckPermissionDto
} from '../dto/rbac.types';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private prisma: PrismaService) {}

  // ========== Role Management ==========

  async createRole(createRoleDto: CreateRoleDto, createdBy: string): Promise<RoleWithPermissions> {
    this.logger.log(`Creating role: ${createRoleDto.name}`);

    // Validate parent role exists if specified
    if (createRoleDto.parentId) {
      await this.getRoleById(createRoleDto.parentId);
    }

    // Create role
    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        displayName: createRoleDto.displayName,
        description: createRoleDto.description,
        parentId: createRoleDto.parentId,
        priority: createRoleDto.priority || 0,
        metadata: createRoleDto.metadata,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: true,
      },
    });

    // Assign permissions if specified
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, createRoleDto.permissionIds, createdBy);
    }

    return this.formatRoleWithPermissions(role);
  }

  async updateRole(roleId: string, updateData: Partial<CreateRoleDto>): Promise<RoleWithPermissions> {
    this.logger.log(`Updating role: ${roleId}`);

    // Validate role exists and is not system role
    const existingRole = await this.getRoleById(roleId);
    if (existingRole.isSystemRole) {
      throw new ForbiddenException('Cannot modify system role');
    }

    // Validate parent role if specified
    if (updateData.parentId) {
      await this.getRoleById(updateData.parentId);
      
      // Prevent circular hierarchy
      if (await this.wouldCreateCircularHierarchy(roleId, updateData.parentId)) {
        throw new ForbiddenException('Cannot create circular role hierarchy');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: updateData.name,
        displayName: updateData.displayName,
        description: updateData.description,
        parentId: updateData.parentId,
        priority: updateData.priority,
        metadata: updateData.metadata,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: true,
      },
    });

    return this.formatRoleWithPermissions(updatedRole);
  }

  async deleteRole(roleId: string): Promise<void> {
    this.logger.log(`Deleting role: ${roleId}`);

    const role = await this.getRoleById(roleId);
    if (role.isSystemRole) {
      throw new ForbiddenException('Cannot delete system role');
    }

    // Check if role has children
    const childCount = await this.prisma.role.count({
      where: { parentId: roleId },
    });

    if (childCount > 0) {
      throw new ForbiddenException('Cannot delete role with child roles');
    }

    // Check if role is assigned to users
    const userRoleCount = await this.prisma.userRoleAssignment.count({
      where: { roleId },
    });

    if (userRoleCount > 0) {
      throw new ForbiddenException('Cannot delete role assigned to users');
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async getRoleById(roleId: string): Promise<RoleWithPermissions> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: {
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

    if (!role) {
      throw new NotFoundException(`Role not found: ${roleId}`);
    }

    return this.formatRoleWithPermissions(role);
  }

  async getAllRoles(includeInactive = false): Promise<RoleWithPermissions[]> {
    const roles = await this.prisma.role.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: true,
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });

    return roles.map(role => this.formatRoleWithPermissions(role));
  }

  async getRoleHierarchy(): Promise<RoleWithPermissions[]> {
    const rootRoles = await this.prisma.role.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });

    const rolesWithChildren = await Promise.all(
      rootRoles.map(async (role) => {
        const children = await this.getRoleChildren(role.id);
        return {
          ...this.formatRoleWithPermissions(role),
          children,
        };
      })
    );

    return rolesWithChildren;
  }

  // ========== Permission Management ==========

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    this.logger.log(`Creating permission: ${createPermissionDto.name}`);

    return await this.prisma.permission.create({
      data: {
        name: createPermissionDto.name,
        displayName: createPermissionDto.displayName,
        description: createPermissionDto.description,
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
        scope: createPermissionDto.scope,
        category: createPermissionDto.category || 'general',
        conditions: createPermissionDto.conditions,
        metadata: createPermissionDto.metadata,
      },
    });
  }

  async updatePermission(permissionId: string, updateData: Partial<CreatePermissionDto>): Promise<Permission> {
    this.logger.log(`Updating permission: ${permissionId}`);

    const existingPermission = await this.getPermissionById(permissionId);
    if (existingPermission.isSystemPerm) {
      throw new ForbiddenException('Cannot modify system permission');
    }

    return await this.prisma.permission.update({
      where: { id: permissionId },
      data: {
        name: updateData.name,
        displayName: updateData.displayName,
        description: updateData.description,
        resource: updateData.resource,
        action: updateData.action,
        scope: updateData.scope,
        category: updateData.category,
        conditions: updateData.conditions,
        metadata: updateData.metadata,
      },
    });
  }

  async deletePermission(permissionId: string): Promise<void> {
    this.logger.log(`Deleting permission: ${permissionId}`);

    const permission = await this.getPermissionById(permissionId);
    if (permission.isSystemPerm) {
      throw new ForbiddenException('Cannot delete system permission');
    }

    await this.prisma.permission.delete({
      where: { id: permissionId },
    });
  }

  async getPermissionById(permissionId: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission not found: ${permissionId}`);
    }

    return permission;
  }

  async getAllPermissions(category?: string, resource?: string): Promise<Permission[]> {
    const where: Prisma.PermissionWhereInput = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (resource) {
      where.resource = resource;
    }

    return await this.prisma.permission.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[], grantedBy: string): Promise<void> {
    this.logger.log(`Assigning ${permissionIds.length} permissions to role: ${roleId}`);

    // Validate role exists
    await this.getRoleById(roleId);

    // Validate permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Create role-permission assignments
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
      grantedBy,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });
  }

  async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void> {
    this.logger.log(`Removing ${permissionIds.length} permissions from role: ${roleId}`);

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }

  // ========== User Role Assignment ==========

  async assignRoleToUser(assignRoleDto: AssignRoleDto, assignedBy: string): Promise<UserRoleAssignment> {
    this.logger.log(`Assigning role ${assignRoleDto.roleId} to user ${assignRoleDto.userId}`);

    // Validate user and role exist
    await this.validateUserExists(assignRoleDto.userId);
    await this.getRoleById(assignRoleDto.roleId);

    return await this.prisma.userRoleAssignment.create({
      data: {
        userId: assignRoleDto.userId,
        roleId: assignRoleDto.roleId,
        scope: assignRoleDto.scope,
        assignedBy,
        expiresAt: assignRoleDto.expiresAt,
        conditions: assignRoleDto.conditions,
        metadata: assignRoleDto.metadata,
      },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    this.logger.log(`Removing role ${roleId} from user ${userId}`);

    await this.prisma.userRoleAssignment.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  async grantPermissionToUser(grantPermissionDto: GrantPermissionDto, grantedBy: string): Promise<UserPermission> {
    this.logger.log(`Granting permission ${grantPermissionDto.permissionId} to user ${grantPermissionDto.userId}`);

    // Validate user and permission exist
    await this.validateUserExists(grantPermissionDto.userId);
    await this.getPermissionById(grantPermissionDto.permissionId);

    return await this.prisma.userPermission.create({
      data: {
        userId: grantPermissionDto.userId,
        permissionId: grantPermissionDto.permissionId,
        scope: grantPermissionDto.scope,
        assignedBy: grantedBy,
        expiresAt: grantPermissionDto.expiresAt,
        reason: grantPermissionDto.reason,
        conditions: grantPermissionDto.conditions,
        metadata: grantPermissionDto.metadata,
      },
    });
  }

  async revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    this.logger.log(`Revoking permission ${permissionId} from user ${userId}`);

    await this.prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId,
      },
    });
  }

  // ========== Permission Checking ==========

  async checkPermission(checkPermissionDto: CheckPermissionDto): Promise<boolean> {
    this.logger.debug(`Checking permission for user ${checkPermissionDto.userId}: ${checkPermissionDto.resource}:${checkPermissionDto.action}`);

    try {
      const userRoleInfo = await this.getUserRoleInfo(checkPermissionDto.userId);
      
      // Check direct permissions first
      const hasDirectPermission = this.hasDirectPermission(
        userRoleInfo.directPermissions,
        checkPermissionDto.resource,
        checkPermissionDto.action,
        checkPermissionDto.scope
      );

      if (hasDirectPermission) {
        return true;
      }

      // Check role-based permissions
      const hasRolePermission = this.hasRolePermission(
        userRoleInfo.effectivePermissions,
        checkPermissionDto.resource,
        checkPermissionDto.action,
        checkPermissionDto.scope
      );

      if (hasRolePermission) {
        return true;
      }

      // Check resource-specific access
      if (checkPermissionDto.resourceId) {
        const hasResourceAccess = this.hasResourceAccess(
          userRoleInfo.resourceAccesses,
          checkPermissionDto.resource,
          checkPermissionDto.resourceId,
          checkPermissionDto.action
        );

        if (hasResourceAccess) {
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Error checking permission: ${error.message}`);
      return false;
    }
  }

  async getUserRoleInfo(userId: string): Promise<UserRoleInfo> {
    // Get user roles with permissions
    const userRoles = await this.prisma.userRoleAssignment.findMany({
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
            parent: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get direct user permissions
    const directPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        effect: 'allow',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        permission: true,
      },
    });

    // Get resource accesses
    const resourceAccesses = await this.prisma.resourceAccess.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    // Build role hierarchy and collect all permissions
    const roles: RoleWithPermissions[] = [];
    const allPermissions = new Set<Permission>();

    for (const userRole of userRoles) {
      const roleWithPermissions = this.formatRoleWithPermissions(userRole.role);
      roles.push(roleWithPermissions);

      // Add role permissions
      roleWithPermissions.permissions.forEach(perm => allPermissions.add(perm));

      // Add parent role permissions (inheritance)
      if (userRole.role.parent) {
        const parentPermissions = userRole.role.parent.permissions.map(rp => rp.permission);
        parentPermissions.forEach(perm => allPermissions.add(perm));
      }
    }

    // Add direct permissions
    const directPerms = directPermissions.map(up => up.permission);
    directPerms.forEach(perm => allPermissions.add(perm));

    return {
      userId,
      roles,
      directPermissions: directPerms,
      effectivePermissions: Array.from(allPermissions),
      resourceAccesses,
    };
  }

  // ========== Helper Methods ==========

  private async getRoleChildren(roleId: string): Promise<RoleWithPermissions[]> {
    const children = await this.prisma.role.findMany({
      where: {
        parentId: roleId,
        isActive: true,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });

    const childrenWithGrandchildren = await Promise.all(
      children.map(async (child) => {
        const grandchildren = await this.getRoleChildren(child.id);
        return {
          ...this.formatRoleWithPermissions(child),
          children: grandchildren,
        };
      })
    );

    return childrenWithGrandchildren;
  }

  private formatRoleWithPermissions(role: any): RoleWithPermissions {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      parentId: role.parentId,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      priority: role.priority,
      metadata: role.metadata,
      permissions: role.permissions?.map((rp: any) => rp.permission) || [],
    };
  }

  private async wouldCreateCircularHierarchy(roleId: string, parentId: string): Promise<boolean> {
    let currentParentId = parentId;
    
    while (currentParentId) {
      if (currentParentId === roleId) {
        return true;
      }
      
      const parent = await this.prisma.role.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      
      currentParentId = parent?.parentId || null;
    }
    
    return false;
  }

  private hasDirectPermission(permissions: Permission[], resource: string, action: string, scope?: string): boolean {
    return permissions.some(perm => 
      perm.resource === resource && 
      perm.action === action && 
      (!scope || !perm.scope || perm.scope === scope || perm.scope === 'global')
    );
  }

  private hasRolePermission(permissions: Permission[], resource: string, action: string, scope?: string): boolean {
    return this.hasDirectPermission(permissions, resource, action, scope);
  }

  private hasResourceAccess(resourceAccesses: ResourceAccess[], resourceType: string, resourceId: string, action: string): boolean {
    return resourceAccesses.some(access => 
      access.resourceType === resourceType && 
      access.resourceId === resourceId &&
      this.checkResourcePermissions(access.permissions, action)
    );
  }

  private checkResourcePermissions(permissions: any, action: string): boolean {
    if (!permissions || typeof permissions !== 'object') {
      return false;
    }

    // Check if the action is allowed in the permissions object
    return permissions[action] === true || permissions['*'] === true;
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }
  }
}