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
var RbacService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RbacService = RbacService_1 = class RbacService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RbacService_1.name);
    }
    async createRole(createRoleDto, createdBy) {
        this.logger.log(`Creating role: ${createRoleDto.name}`);
        if (createRoleDto.parentId) {
            await this.getRoleById(createRoleDto.parentId);
        }
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
        if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
            await this.assignPermissionsToRole(role.id, createRoleDto.permissionIds, createdBy);
        }
        return this.formatRoleWithPermissions(role);
    }
    async updateRole(roleId, updateData) {
        this.logger.log(`Updating role: ${roleId}`);
        const existingRole = await this.getRoleById(roleId);
        if (existingRole.isSystemRole) {
            throw new common_1.ForbiddenException('Cannot modify system role');
        }
        if (updateData.parentId) {
            await this.getRoleById(updateData.parentId);
            if (await this.wouldCreateCircularHierarchy(roleId, updateData.parentId)) {
                throw new common_1.ForbiddenException('Cannot create circular role hierarchy');
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
    async deleteRole(roleId) {
        this.logger.log(`Deleting role: ${roleId}`);
        const role = await this.getRoleById(roleId);
        if (role.isSystemRole) {
            throw new common_1.ForbiddenException('Cannot delete system role');
        }
        const childCount = await this.prisma.role.count({
            where: { parentId: roleId },
        });
        if (childCount > 0) {
            throw new common_1.ForbiddenException('Cannot delete role with child roles');
        }
        const userRoleCount = await this.prisma.userRoleAssignment.count({
            where: { roleId },
        });
        if (userRoleCount > 0) {
            throw new common_1.ForbiddenException('Cannot delete role assigned to users');
        }
        await this.prisma.role.delete({
            where: { id: roleId },
        });
    }
    async getRoleById(roleId) {
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
            throw new common_1.NotFoundException(`Role not found: ${roleId}`);
        }
        return this.formatRoleWithPermissions(role);
    }
    async getAllRoles(includeInactive = false) {
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
    async getRoleHierarchy() {
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
        const rolesWithChildren = await Promise.all(rootRoles.map(async (role) => {
            const children = await this.getRoleChildren(role.id);
            return {
                ...this.formatRoleWithPermissions(role),
                children,
            };
        }));
        return rolesWithChildren;
    }
    async createPermission(createPermissionDto) {
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
    async updatePermission(permissionId, updateData) {
        this.logger.log(`Updating permission: ${permissionId}`);
        const existingPermission = await this.getPermissionById(permissionId);
        if (existingPermission.isSystemPerm) {
            throw new common_1.ForbiddenException('Cannot modify system permission');
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
    async deletePermission(permissionId) {
        this.logger.log(`Deleting permission: ${permissionId}`);
        const permission = await this.getPermissionById(permissionId);
        if (permission.isSystemPerm) {
            throw new common_1.ForbiddenException('Cannot delete system permission');
        }
        await this.prisma.permission.delete({
            where: { id: permissionId },
        });
    }
    async getPermissionById(permissionId) {
        const permission = await this.prisma.permission.findUnique({
            where: { id: permissionId },
        });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission not found: ${permissionId}`);
        }
        return permission;
    }
    async getAllPermissions(category, resource) {
        const where = {
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
    async assignPermissionsToRole(roleId, permissionIds, grantedBy) {
        this.logger.log(`Assigning ${permissionIds.length} permissions to role: ${roleId}`);
        await this.getRoleById(roleId);
        const permissions = await this.prisma.permission.findMany({
            where: { id: { in: permissionIds } },
        });
        if (permissions.length !== permissionIds.length) {
            throw new common_1.NotFoundException('One or more permissions not found');
        }
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
    async removePermissionsFromRole(roleId, permissionIds) {
        this.logger.log(`Removing ${permissionIds.length} permissions from role: ${roleId}`);
        await this.prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId: { in: permissionIds },
            },
        });
    }
    async assignRoleToUser(assignRoleDto, assignedBy) {
        this.logger.log(`Assigning role ${assignRoleDto.roleId} to user ${assignRoleDto.userId}`);
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
    async removeRoleFromUser(userId, roleId) {
        this.logger.log(`Removing role ${roleId} from user ${userId}`);
        await this.prisma.userRoleAssignment.deleteMany({
            where: {
                userId,
                roleId,
            },
        });
    }
    async grantPermissionToUser(grantPermissionDto, grantedBy) {
        this.logger.log(`Granting permission ${grantPermissionDto.permissionId} to user ${grantPermissionDto.userId}`);
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
    async revokePermissionFromUser(userId, permissionId) {
        this.logger.log(`Revoking permission ${permissionId} from user ${userId}`);
        await this.prisma.userPermission.deleteMany({
            where: {
                userId,
                permissionId,
            },
        });
    }
    async checkPermission(checkPermissionDto) {
        this.logger.debug(`Checking permission for user ${checkPermissionDto.userId}: ${checkPermissionDto.resource}:${checkPermissionDto.action}`);
        try {
            const userRoleInfo = await this.getUserRoleInfo(checkPermissionDto.userId);
            const hasDirectPermission = this.hasDirectPermission(userRoleInfo.directPermissions, checkPermissionDto.resource, checkPermissionDto.action, checkPermissionDto.scope);
            if (hasDirectPermission) {
                return true;
            }
            const hasRolePermission = this.hasRolePermission(userRoleInfo.effectivePermissions, checkPermissionDto.resource, checkPermissionDto.action, checkPermissionDto.scope);
            if (hasRolePermission) {
                return true;
            }
            if (checkPermissionDto.resourceId) {
                const hasResourceAccess = this.hasResourceAccess(userRoleInfo.resourceAccesses, checkPermissionDto.resource, checkPermissionDto.resourceId, checkPermissionDto.action);
                if (hasResourceAccess) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error checking permission: ${error.message}`);
            return false;
        }
    }
    async getUserRoleInfo(userId) {
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
        const roles = [];
        const allPermissions = new Set();
        for (const userRole of userRoles) {
            const roleWithPermissions = this.formatRoleWithPermissions(userRole.role);
            roles.push(roleWithPermissions);
            roleWithPermissions.permissions.forEach(perm => allPermissions.add(perm));
            if (userRole.role.parent) {
                const parentPermissions = userRole.role.parent.permissions.map(rp => rp.permission);
                parentPermissions.forEach(perm => allPermissions.add(perm));
            }
        }
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
    async getRoleChildren(roleId) {
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
        const childrenWithGrandchildren = await Promise.all(children.map(async (child) => {
            const grandchildren = await this.getRoleChildren(child.id);
            return {
                ...this.formatRoleWithPermissions(child),
                children: grandchildren,
            };
        }));
        return childrenWithGrandchildren;
    }
    formatRoleWithPermissions(role) {
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
            permissions: role.permissions?.map((rp) => rp.permission) || [],
        };
    }
    async wouldCreateCircularHierarchy(roleId, parentId) {
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
    hasDirectPermission(permissions, resource, action, scope) {
        return permissions.some(perm => perm.resource === resource &&
            perm.action === action &&
            (!scope || !perm.scope || perm.scope === scope || perm.scope === 'global'));
    }
    hasRolePermission(permissions, resource, action, scope) {
        return this.hasDirectPermission(permissions, resource, action, scope);
    }
    hasResourceAccess(resourceAccesses, resourceType, resourceId, action) {
        return resourceAccesses.some(access => access.resourceType === resourceType &&
            access.resourceId === resourceId &&
            this.checkResourcePermissions(access.permissions, action));
    }
    checkResourcePermissions(permissions, action) {
        if (!permissions || typeof permissions !== 'object') {
            return false;
        }
        return permissions[action] === true || permissions['*'] === true;
    }
    async validateUserExists(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User not found: ${userId}`);
        }
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = RbacService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RbacService);
//# sourceMappingURL=rbac.service.js.map