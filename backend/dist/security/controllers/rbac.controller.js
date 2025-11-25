"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const common_1 = require("@nestjs/common");
const rbac_service_1 = require("../services/rbac.service");
const security_audit_service_1 = require("../services/security-audit.service");
const rbac_types_1 = require("../dto/rbac.types");
let RbacController = class RbacController {
    constructor(rbacService, auditService) {
        this.rbacService = rbacService;
        this.auditService = auditService;
    }
    async createRole(req, createRoleDto) {
        try {
            const canCreateRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'create',
            });
            if (!canCreateRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to create roles');
            }
            const role = await this.rbacService.createRole(createRoleDto, req.user.id);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create role',
            };
        }
    }
    async getAllRoles(req, includeInactive) {
        try {
            const canViewRoles = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'read',
            });
            if (!canViewRoles) {
                throw new common_1.ForbiddenException('Insufficient permissions to view roles');
            }
            const roles = await this.rbacService.getAllRoles(includeInactive === 'true');
            return {
                success: true,
                data: roles,
                message: 'Roles retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve roles',
            };
        }
    }
    async getRoleHierarchy(req) {
        try {
            const canViewRoles = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'read',
            });
            if (!canViewRoles) {
                throw new common_1.ForbiddenException('Insufficient permissions to view role hierarchy');
            }
            const hierarchy = await this.rbacService.getRoleHierarchy();
            return {
                success: true,
                data: hierarchy,
                message: 'Role hierarchy retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve role hierarchy',
            };
        }
    }
    async getRoleById(req, roleId) {
        try {
            const canViewRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'read',
            });
            if (!canViewRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to view role');
            }
            const role = await this.rbacService.getRoleById(roleId);
            return {
                success: true,
                data: role,
                message: 'Role retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve role',
            };
        }
    }
    async updateRole(req, roleId, updateRoleDto) {
        try {
            const canUpdateRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'update',
            });
            if (!canUpdateRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to update roles');
            }
            const role = await this.rbacService.updateRole(roleId, updateRoleDto);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update role',
            };
        }
    }
    async deleteRole(req, roleId) {
        try {
            const canDeleteRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'delete',
            });
            if (!canDeleteRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to delete roles');
            }
            await this.rbacService.deleteRole(roleId);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete role',
            };
        }
    }
    async createPermission(req, createPermissionDto) {
        try {
            const canCreatePermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'permission',
                action: 'create',
            });
            if (!canCreatePermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to create permissions');
            }
            const permission = await this.rbacService.createPermission(createPermissionDto);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create permission',
            };
        }
    }
    async getAllPermissions(req, category, resource) {
        try {
            const canViewPermissions = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'permission',
                action: 'read',
            });
            if (!canViewPermissions) {
                throw new common_1.ForbiddenException('Insufficient permissions to view permissions');
            }
            const permissions = await this.rbacService.getAllPermissions(category, resource);
            return {
                success: true,
                data: permissions,
                message: 'Permissions retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve permissions',
            };
        }
    }
    async getPermissionById(req, permissionId) {
        try {
            const canViewPermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'permission',
                action: 'read',
            });
            if (!canViewPermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to view permission');
            }
            const permission = await this.rbacService.getPermissionById(permissionId);
            return {
                success: true,
                data: permission,
                message: 'Permission retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve permission',
            };
        }
    }
    async updatePermission(req, permissionId, updatePermissionDto) {
        try {
            const canUpdatePermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'permission',
                action: 'update',
            });
            if (!canUpdatePermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to update permissions');
            }
            const permission = await this.rbacService.updatePermission(permissionId, updatePermissionDto);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update permission',
            };
        }
    }
    async deletePermission(req, permissionId) {
        try {
            const canDeletePermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'permission',
                action: 'delete',
            });
            if (!canDeletePermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to delete permissions');
            }
            await this.rbacService.deletePermission(permissionId);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete permission',
            };
        }
    }
    async assignPermissionsToRole(req, roleId, body) {
        try {
            const canAssignPermissions = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'update',
            });
            if (!canAssignPermissions) {
                throw new common_1.ForbiddenException('Insufficient permissions to assign permissions to roles');
            }
            await this.rbacService.assignPermissionsToRole(roleId, body.permissionIds, req.user.id);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to assign permissions to role',
            };
        }
    }
    async removePermissionsFromRole(req, roleId, body) {
        try {
            const canRemovePermissions = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'role',
                action: 'update',
            });
            if (!canRemovePermissions) {
                throw new common_1.ForbiddenException('Insufficient permissions to remove permissions from roles');
            }
            await this.rbacService.removePermissionsFromRole(roleId, body.permissionIds);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove permissions from role',
            };
        }
    }
    async assignRoleToUser(req, userId, assignRoleDto) {
        try {
            const canAssignRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'user',
                action: 'update',
            });
            if (!canAssignRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to assign roles to users');
            }
            const assignment = await this.rbacService.assignRoleToUser({ ...assignRoleDto, userId }, req.user.id);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to assign role to user',
            };
        }
    }
    async removeRoleFromUser(req, userId, roleId) {
        try {
            const canRemoveRole = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'user',
                action: 'update',
            });
            if (!canRemoveRole) {
                throw new common_1.ForbiddenException('Insufficient permissions to remove roles from users');
            }
            await this.rbacService.removeRoleFromUser(userId, roleId);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove role from user',
            };
        }
    }
    async grantPermissionToUser(req, userId, grantPermissionDto) {
        try {
            const canGrantPermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'user',
                action: 'update',
            });
            if (!canGrantPermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to grant permissions to users');
            }
            const permission = await this.rbacService.grantPermissionToUser({ ...grantPermissionDto, userId }, req.user.id);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to grant permission to user',
            };
        }
    }
    async revokePermissionFromUser(req, userId, permissionId) {
        try {
            const canRevokePermission = await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'user',
                action: 'update',
            });
            if (!canRevokePermission) {
                throw new common_1.ForbiddenException('Insufficient permissions to revoke permissions from users');
            }
            await this.rbacService.revokePermissionFromUser(userId, permissionId);
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to revoke permission from user',
            };
        }
    }
    async checkPermission(req, checkPermissionDto) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to check permission',
            };
        }
    }
    async getUserRoleInfo(req, userId) {
        try {
            const canViewRoleInfo = req.user.id === userId || (await this.rbacService.checkPermission({
                userId: req.user.id,
                resource: 'user',
                action: 'read',
            }));
            if (!canViewRoleInfo) {
                throw new common_1.ForbiddenException('Insufficient permissions to view user role information');
            }
            const roleInfo = await this.rbacService.getUserRoleInfo(userId);
            return {
                success: true,
                data: roleInfo,
                message: 'User role information retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve user role information',
            };
        }
    }
};
exports.RbacController = RbacController;
__decorate([
    (0, common_1.Post)('roles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rbac_types_1.CreateRoleDto]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Get)('roles/hierarchy'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getRoleHierarchy", null);
__decorate([
    (0, common_1.Get)('roles/:roleId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getRoleById", null);
__decorate([
    (0, common_1.Put)('roles/:roleId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('permissions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rbac_types_1.CreatePermissionDto]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createPermission", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('resource')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/:permissionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getPermissionById", null);
__decorate([
    (0, common_1.Put)('permissions/:permissionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('permissionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Delete)('permissions/:permissionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "deletePermission", null);
__decorate([
    (0, common_1.Post)('roles/:roleId/permissions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "assignPermissionsToRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleId/permissions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "removePermissionsFromRole", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "removeRoleFromUser", null);
__decorate([
    (0, common_1.Post)('users/:userId/permissions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "grantPermissionToUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId/permissions/:permissionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "revokePermissionFromUser", null);
__decorate([
    (0, common_1.Post)('check-permission'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Get)('users/:userId/role-info'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getUserRoleInfo", null);
exports.RbacController = RbacController = __decorate([
    (0, common_1.Controller)('api/security/rbac'),
    __metadata("design:paramtypes", [rbac_service_1.RbacService,
        security_audit_service_1.SecurityAuditService])
], RbacController);
//# sourceMappingURL=rbac.controller.js.map