import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Permission, UserRoleAssignment, UserPermission } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchInput,
  AssignRolePermissionInput,
  AssignUserRoleInput,
  AssignUserPermissionInput,
} from '../graphql/inputs/rbac.input';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  // Permission Management
  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission not found with id: ${id}`);
    }
    return permission;
  }

  async createPermission(input: CreatePermissionInput): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.prisma.permission.findUnique({
      where: {
        resource_action_scope: {
          resource: input.resource,
          action: input.action,
          scope: input.scope || null,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Permission "${input.resource}:${input.action}${input.scope ? ':' + input.scope : ''}" already exists`
      );
    }

    return this.prisma.permission.create({
      data: {
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        resource: input.resource,
        action: input.action,
        scope: input.scope,
        category: input.category || 'general',
        conditions: input.conditions,
        metadata: input.metadata,
      },
    });
  }

  async updatePermission(id: string, input: UpdatePermissionInput): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.isSystemPerm && input.isActive === false) {
      throw new ForbiddenException('Cannot deactivate system permission');
    }

    return this.prisma.permission.update({
      where: { id },
      data: input,
    });
  }

  async deletePermission(id: string): Promise<boolean> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.isSystemPerm) {
      throw new ForbiddenException('Cannot delete system permission');
    }

    await this.prisma.permission.delete({ where: { id } });
    return true;
  }

  async searchPermissions(input: PermissionSearchInput): Promise<any> {
    const where: any = {};

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: 'insensitive' } },
        { displayName: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    if (input.resource) where.resource = input.resource;
    if (input.action) where.action = input.action;
    if (input.category) where.category = input.category;
    if (input.isActive !== undefined) where.isActive = input.isActive;

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip: (input.page || 0) * (input.size || 20),
        take: input.size || 20,
        orderBy: {
          [input.sortBy || 'name']: input.sortOrder || 'asc',
        },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      permissions,
      total,
      page: input.page || 0,
      size: input.size || 20,
      totalPages: Math.ceil(total / (input.size || 20)),
    };
  }

  // Role Management
  async getRoleById(id: string): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: true,
      },
    });
    if (!role) {
      throw new NotFoundException(`Role not found with id: ${id}`);
    }
    
    // Return full RolePermission objects with nested permission
    // GraphQL schema expects: permissions: [{ id, effect, permission: {...} }]
    return role;
  }

  async createRole(input: CreateRoleInput): Promise<any> {
    // Check if role name already exists
    const existing = await this.prisma.role.findUnique({
      where: { name: input.name },
    });

    if (existing) {
      throw new ConflictException(`Role "${input.name}" already exists`);
    }

    // Validate parent role if specified
    if (input.parentId) {
      const parent = await this.prisma.role.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent role not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Create role
      const role = await tx.role.create({
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description,
          parentId: input.parentId,
          priority: input.priority || 0,
          metadata: input.metadata,
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

      // Assign permissions if provided
      if (input.permissionIds && input.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: input.permissionIds.map((permId) => ({
            roleId: role.id,
            permissionId: permId,
            effect: 'allow',
          })),
        });
      }

      // Fetch updated role with permissions
      const updatedRole = await tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          children: true,
        },
      });

      // Return full RolePermission objects with nested permission
      // GraphQL schema expects: permissions: [{ id, effect, permission: {...} }]
      return updatedRole;
    });
  }

  async updateRole(id: string, input: UpdateRoleInput): Promise<any> {
    const existingRole = await this.prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    if (existingRole.isSystemRole && input.isActive === false) {
      throw new ForbiddenException('Cannot deactivate system role');
    }

    // Validate parent role if specified
    if (input.parentId) {
      const parent = await this.prisma.role.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent role not found');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: input,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        children: true,
      },
    });
    
    // Return full RolePermission objects with nested permission
    // GraphQL schema expects: permissions: [{ id, effect, permission: {...} }]
    return updatedRole;
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('Cannot delete system role');
    }

    await this.prisma.role.delete({ where: { id } });
    return true;
  }

  async searchRoles(input: RoleSearchInput): Promise<any> {
    const where: any = {};

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: 'insensitive' } },
        { displayName: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    if (input.isActive !== undefined) where.isActive = input.isActive;
    if (input.parentId) where.parentId = input.parentId;

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (input.page || 0) * (input.size || 20),
        take: input.size || 20,
        orderBy: {
          [input.sortBy || 'name']: input.sortOrder || 'asc',
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          parent: true,
          children: true,
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    // Return full RolePermission objects (no flattening needed)
    // GraphQL schema now expects: permissions: [{ id, effect, permission: {...} }]

    return {
      roles,
      total,
      page: input.page || 0,
      size: input.size || 20,
      totalPages: Math.ceil(total / (input.size || 20)),
    };
  }

  // Role-Permission Assignment
  async assignRolePermissions(input: AssignRolePermissionInput): Promise<boolean> {
    await this.prisma.$transaction(async (tx) => {
      // Remove existing permissions for this role
      await tx.rolePermission.deleteMany({
        where: { roleId: input.roleId },
      });

      // Assign new permissions - with safety check
      if (input.permissionIds && input.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: input.permissionIds.map((permId) => ({
            roleId: input.roleId,
            permissionId: permId,
            effect: input.effect || 'allow',
            conditions: input.conditions,
            expiresAt: input.expiresAt,
          })),
        });
      }
    });

    return true;
  }

  // User Role Assignment
  async assignUserRoles(input: AssignUserRoleInput): Promise<boolean> {
    console.log('=== assignUserRoles DEBUG ===');
    console.log('Input:', JSON.stringify(input, null, 2));
    console.log('UserId:', input.userId);
    console.log('Assignments:', input.assignments);
    console.log('Assignments length:', input.assignments?.length);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Remove existing role assignments for this user
        const deletedCount = await tx.userRoleAssignment.deleteMany({
          where: { userId: input.userId },
        });
        console.log('Deleted existing assignments:', deletedCount);

        // Assign new roles
        if (input.assignments && input.assignments.length > 0) {
          const dataToCreate = input.assignments.map((assignment) => ({
            userId: input.userId,
            roleId: assignment.roleId,
            effect: assignment.effect || 'allow',
            conditions: assignment.conditions,
          }));
          
          console.log('Data to create:', JSON.stringify(dataToCreate, null, 2));
          
          const result = await tx.userRoleAssignment.createMany({
            data: dataToCreate,
          });
          
          console.log('Created assignments result:', result);
        } else {
          console.log('No assignments to create');
        }
      });

      // Verify the assignments were created
      const verifyAssignments = await this.prisma.userRoleAssignment.findMany({
        where: { userId: input.userId },
        include: { role: true },
      });
      
      console.log('Verification - Found assignments after creation:', verifyAssignments.length);
      console.log('Verification assignments:', JSON.stringify(verifyAssignments.map(ra => ({
        id: ra.id,
        roleId: ra.roleId,
        roleName: ra.role.name,
        effect: ra.effect
      })), null, 2));
      console.log('=== assignUserRoles COMPLETE ===');
      
      return true;
    } catch (error) {
      console.error('=== assignUserRoles ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  // User Permission Assignment
  async assignUserPermissions(input: AssignUserPermissionInput): Promise<boolean> {
    await this.prisma.$transaction(async (tx) => {
      // Remove existing direct permissions for this user
      await tx.userPermission.deleteMany({
        where: { userId: input.userId },
      });

      // Assign new permissions
      if (input.assignments && input.assignments.length > 0) {
        await tx.userPermission.createMany({
          data: input.assignments.map((assignment) => ({
            userId: input.userId,
            permissionId: assignment.permissionId,
            effect: assignment.effect || 'allow',
            conditions: assignment.conditions,
          })),
        });
      }
    });

    return true;
  }

  // Get User's Effective Permissions
  async getUserEffectivePermissions(userId: string): Promise<any> {
    console.log('=== getUserEffectivePermissions DEBUG ===');
    console.log('UserId:', userId);
    
    // Fetch ALL role assignments and permissions (both allow and deny)
    const [allRoleAssignments, allDirectPermissions] = await Promise.all([
      this.prisma.userRoleAssignment.findMany({
        where: { userId },
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
      }),
      this.prisma.userPermission.findMany({
        where: { userId },
        include: {
          permission: true,
        },
      }),
    ]);

    console.log('Found role assignments:', allRoleAssignments.length);
    console.log('Role assignments:', JSON.stringify(allRoleAssignments.map(ra => ({
      id: ra.id,
      roleId: ra.roleId,
      roleName: ra.role.name,
      effect: ra.effect
    })), null, 2));

    // Transform role assignments to match GraphQL schema expectations
    // Keep RolePermission structure with id, effect, and permission
    const roleAssignments = allRoleAssignments.map(assignment => ({
      id: assignment.id,
      effect: assignment.effect || 'allow', // Default to 'allow' if null
      conditions: assignment.conditions,
      metadata: assignment.metadata,
      role: {
        ...assignment.role,
        permissions: assignment.role.permissions
          .filter(rp => rp.permission !== null && rp.permission.name !== null)
          .map(rp => ({
            id: rp.id,
            effect: rp.effect || 'allow', // Default to 'allow' if null
            permission: rp.permission,
            conditions: rp.conditions,
            metadata: rp.grantedBy ? { grantedBy: rp.grantedBy } : null
          }))
      }
    }));

    // Separate allowed and denied permissions
    const allowedRoleAssignments = allRoleAssignments.filter(a => a.effect === 'allow');
    const deniedPermissions = new Set<string>();

    // Collect denied permissions from direct assignments
    allDirectPermissions
      .filter(up => up.effect === 'deny')
      .forEach(up => {
        if (up.permission && up.permission.name !== null) {
          deniedPermissions.add(up.permission.id);
        }
      });

    // Collect denied permissions from role assignments
    allRoleAssignments
      .filter(ra => ra.effect === 'deny')
      .forEach(ra => {
        ra.role.permissions.forEach(rp => {
          if (rp.permission && rp.permission.name !== null) {
            deniedPermissions.add(rp.permission.id);
          }
        });
      });

    // Collect allowed permissions from roles (excluding denied ones and null names)
    const rolePermissions = allowedRoleAssignments
      .flatMap((assignment) => assignment.role.permissions)
      .map(rp => rp.permission)
      .filter(p => p && p.name !== null && !deniedPermissions.has(p.id));

    // Collect allowed direct permissions (excluding denied ones and null names)
    const directAllowedPermissions = allDirectPermissions
      .filter(up => up.effect === 'allow' && up.permission && up.permission.name !== null)
      .map(up => up.permission)
      .filter(p => p && p.name !== null && !deniedPermissions.has(p.id));

    // Combine all allowed permissions (after deny filtering)
    const allPermissions = [
      ...rolePermissions,
      ...directAllowedPermissions,
    ];

    // Remove duplicates and filter out any remaining null names
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) =>
        permission && permission.name !== null && index === self.findIndex((p) => p && p.id === permission.id)
    );

    // Filter out direct permissions with null permission or null name
    // Format to match GraphQL UserPermission structure
    const validDirectPermissions = allDirectPermissions
      .filter(up => up.permission && up.permission.name !== null)
      .map(up => ({
        id: up.id,
        effect: up.effect || 'allow', // Default to 'allow' if null
        permission: up.permission,
        conditions: up.conditions,
        metadata: up.metadata || null
      }));

    return {
      userId,
      roleAssignments,
      directPermissions: validDirectPermissions,
      effectivePermissions: uniquePermissions,
      deniedPermissions: Array.from(deniedPermissions),
      summary: {
        totalDirectPermissions: validDirectPermissions.filter(p => p.effect === 'allow').length,
        totalDeniedPermissions: deniedPermissions.size,
        totalRoleAssignments: allowedRoleAssignments.length,
        totalEffectivePermissions: uniquePermissions.length,
        lastUpdated: new Date(),
      },
    };
  }

  // Initialize System Roles and Permissions
  async initializeSystemRolePermissions(): Promise<void> {
    // Create system permissions
    const systemPermissions = [
      {
        name: 'users.create',
        displayName: 'Create Users',
        resource: 'user',
        action: 'create',
        category: 'user_management',
      },
      {
        name: 'users.read',
        displayName: 'Read Users',
        resource: 'user',
        action: 'read',
        category: 'user_management',
      },
      {
        name: 'users.update',
        displayName: 'Update Users',
        resource: 'user',
        action: 'update',
        category: 'user_management',
      },
      {
        name: 'users.delete',
        displayName: 'Delete Users',
        resource: 'user',
        action: 'delete',
        category: 'user_management',
      },
      {
        name: 'roles.manage',
        displayName: 'Manage Roles',
        resource: 'role',
        action: 'manage',
        category: 'role_management',
      },
      {
        name: 'permissions.manage',
        displayName: 'Manage Permissions',
        resource: 'permission',
        action: 'manage',
        category: 'permission_management',
      },
    ];

    for (const perm of systemPermissions) {
      await this.prisma.permission.upsert({
        where: {
          resource_action_scope: {
            resource: perm.resource,
            action: perm.action,
            scope: null,
          },
        },
        update: {},
        create: {
          ...perm,
          isSystemPerm: true,
        },
      });
    }

    // Create system roles
    const superAdminRole = await this.prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access',
        isSystemRole: true,
        priority: 1000,
      },
    });

    const adminRole = await this.prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access',
        isSystemRole: true,
        priority: 500,
      },
    });

    // Assign all permissions to super admin role
    const allPermissions = await this.prisma.permission.findMany();
    for (const permission of allPermissions) {
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
          effect: 'allow',
        },
      });
    }
  }
}