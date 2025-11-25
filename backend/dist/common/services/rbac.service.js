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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const rbac_cache_service_1 = require("./rbac-cache.service");
const audit_log_service_1 = require("./audit-log.service");
const rbac_constants_1 = require("../constants/rbac.constants");
let RBACService = class RBACService {
    constructor(prisma, cacheService, auditLogService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
        this.auditLogService = auditLogService;
    }
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
    async getRoleById(roleId) {
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
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async getAllPermissions() {
        const permissions = await this.prisma.permission.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
        });
        const grouped = permissions.reduce((acc, perm) => {
            const category = perm.category || 'general';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(perm);
            return acc;
        }, {});
        return grouped;
    }
    async getUserRoles(userId) {
        const cached = await this.cacheService.getUserRoles(userId);
        if (cached) {
            return cached;
        }
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
        await this.cacheService.setUserRoles(userId, roles);
        return roles;
    }
    async getUserPermissions(userId) {
        const cached = await this.cacheService.getUserPermissions(userId);
        if (cached) {
            return cached;
        }
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
        const allPermissions = new Map();
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
        await this.cacheService.setUserPermissions(userId, permissions);
        return permissions;
    }
    async assignRoleToUser(userId, roleId, assignedBy, expiresAt) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        const existing = await this.prisma.userRoleAssignment.findUnique({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Role already assigned to user');
        }
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
        await this.cacheService.invalidateUserCache(userId);
        await this.auditLogService.logRoleAssignment(assignedBy || 'system', userId, roleId, role.name, expiresAt);
        return result;
    }
    async removeRoleFromUser(userId, roleId, currentUserId) {
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
            throw new common_1.NotFoundException('Role assignment not found');
        }
        await this.prisma.userRoleAssignment.delete({
            where: {
                id: assignment.id,
            },
        });
        await this.cacheService.invalidateUserCache(userId);
        await this.auditLogService.logRoleRemoval(currentUserId || 'system', userId, roleId, assignment.role.name);
        return { success: true, message: 'Role removed from user' };
    }
    async userHasPermission(userId, resource, action, scope) {
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
        for (const up of directPermissions) {
            if ((0, rbac_constants_1.scopeIncludes)(up.permission.scope, scope)) {
                return true;
            }
        }
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
        for (const ra of roleAssignments) {
            for (const rp of ra.role.permissions) {
                if ((0, rbac_constants_1.scopeIncludes)(rp.permission.scope, scope)) {
                    return true;
                }
            }
        }
        return false;
    }
    async getUsersByRole(roleId) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
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
};
exports.RBACService = RBACService;
exports.RBACService = RBACService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rbac_cache_service_1.RBACCacheService,
        audit_log_service_1.AuditLogService])
], RBACService);
//# sourceMappingURL=rbac.service.js.map