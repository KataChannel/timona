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
exports.RBACGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../services/audit-log.service");
const rbac_decorator_1 = require("../decorators/rbac.decorator");
const rbac_constants_1 = require("../constants/rbac.constants");
let RBACGuard = class RBACGuard {
    constructor(reflector, prisma, auditLogService) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(rbac_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        let request;
        let user;
        if (context.getType() === 'http') {
            request = context.switchToHttp().getRequest();
            user = request.user;
        }
        else {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            const ctx = gqlContext.getContext();
            request = ctx.req;
            user = ctx.req?.user;
        }
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.roleType === 'ADMIN') {
            const route = request.route?.path || request.url;
            await this.auditLogService.logAdminBypass(user.id, route, request.method, request.ip, request.headers['user-agent']);
            return true;
        }
        const requiredPermissions = this.reflector.getAllAndOverride(rbac_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        const requiredRoles = this.reflector.getAllAndOverride(rbac_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions && !requiredRoles) {
            return true;
        }
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = await this.checkUserHasRole(user.id, requiredRoles);
            if (hasRole) {
                await this.auditLogService.logAccessGranted(user.id, `role:${requiredRoles.join(',')}`, 'access', 'role', request.ip, request.headers['user-agent']);
                return true;
            }
        }
        if (requiredPermissions && requiredPermissions.length > 0) {
            const hasPermission = await this.checkUserHasPermissions(user.id, requiredPermissions);
            if (hasPermission) {
                const permissionStr = requiredPermissions
                    .map((p) => `${p.resource}:${p.action}${p.scope ? ':' + p.scope : ''}`)
                    .join(',');
                await this.auditLogService.logAccessGranted(user.id, permissionStr, 'access', 'permission', request.ip, request.headers['user-agent']);
                return true;
            }
        }
        const deniedResource = requiredPermissions
            ? requiredPermissions.map((p) => `${p.resource}:${p.action}`).join(',')
            : requiredRoles?.join(',') || 'unknown';
        await this.auditLogService.logAccessDenied(user.id, deniedResource, 'access', 'required', 'Insufficient permissions', request.ip, request.headers['user-agent']);
        throw new common_1.ForbiddenException('You do not have permission to access this resource');
    }
    async checkUserHasRole(userId, requiredRoles) {
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
    async checkUserHasPermissions(userId, requiredPermissions) {
        for (const perm of requiredPermissions) {
            const hasPermission = await this.checkSinglePermission(userId, perm);
            if (!hasPermission) {
                return false;
            }
        }
        return true;
    }
    async checkSinglePermission(userId, permission) {
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
            return false;
        }
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
            return false;
        }
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
        for (const up of directAllowPermissions) {
            if ((0, rbac_constants_1.scopeIncludes)(up.permission.scope, permission.scope)) {
                return true;
            }
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
        for (const ra of rolePermissions) {
            for (const rp of ra.role.permissions) {
                if ((0, rbac_constants_1.scopeIncludes)(rp.permission.scope, permission.scope)) {
                    return true;
                }
            }
        }
        return false;
    }
};
exports.RBACGuard = RBACGuard;
exports.RBACGuard = RBACGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], RBACGuard);
//# sourceMappingURL=rbac.guard.js.map