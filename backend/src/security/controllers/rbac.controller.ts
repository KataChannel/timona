import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
// TODO: Import proper auth guard when available
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacService } from '../services/rbac.service';
import { SecurityAuditService } from '../services/security-audit.service';
import { CreateRoleDto, CreatePermissionDto, AssignRoleDto, GrantPermissionDto, CheckPermissionDto } from '../dto/rbac.types';

@Controller('api/security/rbac')
// TODO: Enable when auth guard is available
// @UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly auditService: SecurityAuditService,
  ) {}

  // ========== Role Management Endpoints ==========

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Request() req: any, @Body() createRoleDto: CreateRoleDto) {
    try {
      // Check if user has permission to create roles
      const canCreateRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'create',
      });

      if (!canCreateRole) {
        throw new ForbiddenException('Insufficient permissions to create roles');
      }

      const role = await this.rbacService.createRole(createRoleDto, req.user.id);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'role_created',
        resourceType: 'role',
        resourceId: role.id,
        details: {
          roleName: role.name,
          displayName: role.displayName,
          parentId: role.parentId,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: role,
        message: 'Role created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create role',
      };
    }
  }

  @Get('roles')
  async getAllRoles(@Request() req: any, @Query('includeInactive') includeInactive?: string) {
    try {
      // Check if user has permission to view roles
      const canViewRoles = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'read',
      });

      if (!canViewRoles) {
        throw new ForbiddenException('Insufficient permissions to view roles');
      }

      const roles = await this.rbacService.getAllRoles(includeInactive === 'true');

      return {
        success: true,
        data: roles,
        message: 'Roles retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve roles',
      };
    }
  }

  @Get('roles/hierarchy')
  async getRoleHierarchy(@Request() req: any) {
    try {
      // Check if user has permission to view role hierarchy
      const canViewRoles = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'read',
      });

      if (!canViewRoles) {
        throw new ForbiddenException('Insufficient permissions to view role hierarchy');
      }

      const hierarchy = await this.rbacService.getRoleHierarchy();

      return {
        success: true,
        data: hierarchy,
        message: 'Role hierarchy retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve role hierarchy',
      };
    }
  }

  @Get('roles/:roleId')
  async getRoleById(@Request() req: any, @Param('roleId') roleId: string) {
    try {
      // Check if user has permission to view roles
      const canViewRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'read',
      });

      if (!canViewRole) {
        throw new ForbiddenException('Insufficient permissions to view role');
      }

      const role = await this.rbacService.getRoleById(roleId);

      return {
        success: true,
        data: role,
        message: 'Role retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve role',
      };
    }
  }

  @Put('roles/:roleId')
  async updateRole(
    @Request() req: any,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: Partial<CreateRoleDto>
  ) {
    try {
      // Check if user has permission to update roles
      const canUpdateRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'update',
      });

      if (!canUpdateRole) {
        throw new ForbiddenException('Insufficient permissions to update roles');
      }

      const role = await this.rbacService.updateRole(roleId, updateRoleDto);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'role_updated',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          updates: updateRoleDto,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: role,
        message: 'Role updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update role',
      };
    }
  }

  @Delete('roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Request() req: any, @Param('roleId') roleId: string) {
    try {
      // Check if user has permission to delete roles
      const canDeleteRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'delete',
      });

      if (!canDeleteRole) {
        throw new ForbiddenException('Insufficient permissions to delete roles');
      }

      await this.rbacService.deleteRole(roleId);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'role_deleted',
        resourceType: 'role',
        resourceId: roleId,
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Role deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete role',
      };
    }
  }

  // ========== Permission Management Endpoints ==========

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Request() req: any, @Body() createPermissionDto: CreatePermissionDto) {
    try {
      // Check if user has permission to create permissions
      const canCreatePermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'permission',
        action: 'create',
      });

      if (!canCreatePermission) {
        throw new ForbiddenException('Insufficient permissions to create permissions');
      }

      const permission = await this.rbacService.createPermission(createPermissionDto);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permission_created',
        resourceType: 'permission',
        resourceId: permission.id,
        details: {
          permissionName: permission.name,
          resource: permission.resource,
          action: permission.action,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: permission,
        message: 'Permission created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create permission',
      };
    }
  }

  @Get('permissions')
  async getAllPermissions(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('resource') resource?: string
  ) {
    try {
      // Check if user has permission to view permissions
      const canViewPermissions = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'permission',
        action: 'read',
      });

      if (!canViewPermissions) {
        throw new ForbiddenException('Insufficient permissions to view permissions');
      }

      const permissions = await this.rbacService.getAllPermissions(category, resource);

      return {
        success: true,
        data: permissions,
        message: 'Permissions retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve permissions',
      };
    }
  }

  @Get('permissions/:permissionId')
  async getPermissionById(@Request() req: any, @Param('permissionId') permissionId: string) {
    try {
      // Check if user has permission to view permissions
      const canViewPermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'permission',
        action: 'read',
      });

      if (!canViewPermission) {
        throw new ForbiddenException('Insufficient permissions to view permission');
      }

      const permission = await this.rbacService.getPermissionById(permissionId);

      return {
        success: true,
        data: permission,
        message: 'Permission retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve permission',
      };
    }
  }

  @Put('permissions/:permissionId')
  async updatePermission(
    @Request() req: any,
    @Param('permissionId') permissionId: string,
    @Body() updatePermissionDto: Partial<CreatePermissionDto>
  ) {
    try {
      // Check if user has permission to update permissions
      const canUpdatePermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'permission',
        action: 'update',
      });

      if (!canUpdatePermission) {
        throw new ForbiddenException('Insufficient permissions to update permissions');
      }

      const permission = await this.rbacService.updatePermission(permissionId, updatePermissionDto);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permission_updated',
        resourceType: 'permission',
        resourceId: permissionId,
        details: {
          updates: updatePermissionDto,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: permission,
        message: 'Permission updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update permission',
      };
    }
  }

  @Delete('permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Request() req: any, @Param('permissionId') permissionId: string) {
    try {
      // Check if user has permission to delete permissions
      const canDeletePermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'permission',
        action: 'delete',
      });

      if (!canDeletePermission) {
        throw new ForbiddenException('Insufficient permissions to delete permissions');
      }

      await this.rbacService.deletePermission(permissionId);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permission_deleted',
        resourceType: 'permission',
        resourceId: permissionId,
        details: {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Permission deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete permission',
      };
    }
  }

  // ========== Role-Permission Assignment Endpoints ==========

  @Post('roles/:roleId/permissions')
  async assignPermissionsToRole(
    @Request() req: any,
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] }
  ) {
    try {
      // Check if user has permission to assign permissions to roles
      const canAssignPermissions = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'update',
      });

      if (!canAssignPermissions) {
        throw new ForbiddenException('Insufficient permissions to assign permissions to roles');
      }

      await this.rbacService.assignPermissionsToRole(roleId, body.permissionIds, req.user.id);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permissions_assigned_to_role',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          permissionIds: body.permissionIds,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Permissions assigned to role successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign permissions to role',
      };
    }
  }

  @Delete('roles/:roleId/permissions')
  async removePermissionsFromRole(
    @Request() req: any,
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] }
  ) {
    try {
      // Check if user has permission to remove permissions from roles
      const canRemovePermissions = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'role',
        action: 'update',
      });

      if (!canRemovePermissions) {
        throw new ForbiddenException('Insufficient permissions to remove permissions from roles');
      }

      await this.rbacService.removePermissionsFromRole(roleId, body.permissionIds);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permissions_removed_from_role',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          permissionIds: body.permissionIds,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Permissions removed from role successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove permissions from role',
      };
    }
  }

  // ========== User Role Assignment Endpoints ==========

  @Post('users/:userId/roles')
  async assignRoleToUser(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() assignRoleDto: Omit<AssignRoleDto, 'userId'>
  ) {
    try {
      // Check if user has permission to assign roles to users
      const canAssignRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'user',
        action: 'update',
      });

      if (!canAssignRole) {
        throw new ForbiddenException('Insufficient permissions to assign roles to users');
      }

      const assignment = await this.rbacService.assignRoleToUser(
        { ...assignRoleDto, userId },
        req.user.id
      );

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'role_assigned_to_user',
        resourceType: 'user',
        resourceId: userId,
        details: {
          roleId: assignRoleDto.roleId,
          scope: assignRoleDto.scope,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: assignment,
        message: 'Role assigned to user successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign role to user',
      };
    }
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRoleFromUser(
    @Request() req: any,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string
  ) {
    try {
      // Check if user has permission to remove roles from users
      const canRemoveRole = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'user',
        action: 'update',
      });

      if (!canRemoveRole) {
        throw new ForbiddenException('Insufficient permissions to remove roles from users');
      }

      await this.rbacService.removeRoleFromUser(userId, roleId);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'role_removed_from_user',
        resourceType: 'user',
        resourceId: userId,
        details: {
          roleId,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Role removed from user successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove role from user',
      };
    }
  }

  // ========== User Permission Management Endpoints ==========

  @Post('users/:userId/permissions')
  async grantPermissionToUser(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() grantPermissionDto: Omit<GrantPermissionDto, 'userId'>
  ) {
    try {
      // Check if user has permission to grant permissions to users
      const canGrantPermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'user',
        action: 'update',
      });

      if (!canGrantPermission) {
        throw new ForbiddenException('Insufficient permissions to grant permissions to users');
      }

      const permission = await this.rbacService.grantPermissionToUser(
        { ...grantPermissionDto, userId },
        req.user.id
      );

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permission_granted_to_user',
        resourceType: 'user',
        resourceId: userId,
        details: {
          permissionId: grantPermissionDto.permissionId,
          scope: grantPermissionDto.scope,
          reason: grantPermissionDto.reason,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        data: permission,
        message: 'Permission granted to user successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to grant permission to user',
      };
    }
  }

  @Delete('users/:userId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermissionFromUser(
    @Request() req: any,
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string
  ) {
    try {
      // Check if user has permission to revoke permissions from users
      const canRevokePermission = await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'user',
        action: 'update',
      });

      if (!canRevokePermission) {
        throw new ForbiddenException('Insufficient permissions to revoke permissions from users');
      }

      await this.rbacService.revokePermissionFromUser(userId, permissionId);

      // Audit log
      await this.auditService.logSecurityEvent({
        userId: req.user.id,
        eventType: 'permission_revoked_from_user',
        resourceType: 'user',
        resourceId: userId,
        details: {
          permissionId,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Permission revoked from user successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to revoke permission from user',
      };
    }
  }

  // ========== Permission Checking Endpoints ==========

  @Post('check-permission')
  async checkPermission(@Request() req: any, @Body() checkPermissionDto: Omit<CheckPermissionDto, 'userId'>) {
    try {
      const hasPermission = await this.rbacService.checkPermission({
        ...checkPermissionDto,
        userId: req.user.id,
      });

      return {
        success: true,
        data: {
          hasPermission,
          userId: req.user.id,
          resource: checkPermissionDto.resource,
          action: checkPermissionDto.action,
          scope: checkPermissionDto.scope,
        },
        message: 'Permission check completed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to check permission',
      };
    }
  }

  @Get('users/:userId/role-info')
  async getUserRoleInfo(@Request() req: any, @Param('userId') userId: string) {
    try {
      // Check if user has permission to view user role info (self or admin)
      const canViewRoleInfo = req.user.id === userId || (await this.rbacService.checkPermission({
        userId: req.user.id,
        resource: 'user',
        action: 'read',
      }));

      if (!canViewRoleInfo) {
        throw new ForbiddenException('Insufficient permissions to view user role information');
      }

      const roleInfo = await this.rbacService.getUserRoleInfo(userId);

      return {
        success: true,
        data: roleInfo,
        message: 'User role information retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user role information',
      };
    }
  }
}