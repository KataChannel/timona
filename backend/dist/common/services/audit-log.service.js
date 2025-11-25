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
exports.AuditLogService = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
var AuditAction;
(function (AuditAction) {
    AuditAction["ASSIGN_ROLE"] = "ASSIGN_ROLE";
    AuditAction["REMOVE_ROLE"] = "REMOVE_ROLE";
    AuditAction["CREATE_ROLE"] = "CREATE_ROLE";
    AuditAction["UPDATE_ROLE"] = "UPDATE_ROLE";
    AuditAction["DELETE_ROLE"] = "DELETE_ROLE";
    AuditAction["CREATE_PERMISSION"] = "CREATE_PERMISSION";
    AuditAction["UPDATE_PERMISSION"] = "UPDATE_PERMISSION";
    AuditAction["DELETE_PERMISSION"] = "DELETE_PERMISSION";
    AuditAction["ASSIGN_PERMISSION"] = "ASSIGN_PERMISSION";
    AuditAction["REMOVE_PERMISSION"] = "REMOVE_PERMISSION";
    AuditAction["ACCESS_GRANTED"] = "ACCESS_GRANTED";
    AuditAction["ACCESS_DENIED"] = "ACCESS_DENIED";
    AuditAction["PERMISSION_CHECK"] = "PERMISSION_CHECK";
    AuditAction["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuditAction["ADMIN_BYPASS"] = "ADMIN_BYPASS";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let AuditLogService = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: data.action,
                    userId: data.userId,
                    resourceType: data.resourceType || 'rbac',
                    resourceId: data.targetUserId,
                    details: data.metadata,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    success: data.success ?? true,
                    errorMessage: data.errorMessage,
                    severity: data.severity || 'info',
                    operationType: 'PERMISSION',
                },
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
    async logRoleAssignment(actorId, targetId, roleId, roleName, expiresAt, ipAddress, userAgent) {
        await this.log({
            action: AuditAction.ASSIGN_ROLE,
            userId: actorId,
            targetUserId: targetId,
            resourceType: 'role',
            resourceId: roleId,
            metadata: {
                roleId,
                roleName,
                targetUserId: targetId,
                expiresAt: expiresAt?.toISOString(),
            },
            ipAddress,
            userAgent,
            success: true,
            severity: 'info',
        });
    }
    async logRoleRemoval(actorId, targetId, roleId, roleName, ipAddress, userAgent) {
        await this.log({
            action: AuditAction.REMOVE_ROLE,
            userId: actorId,
            targetUserId: targetId,
            resourceType: 'role',
            resourceId: roleId,
            metadata: {
                roleId,
                roleName,
                targetUserId: targetId,
            },
            ipAddress,
            userAgent,
            success: true,
            severity: 'info',
        });
    }
    async logAccessGranted(userId, resource, action, scope, ipAddress, userAgent) {
        await this.log({
            action: AuditAction.ACCESS_GRANTED,
            userId,
            resourceType: resource,
            metadata: {
                action,
                scope,
            },
            ipAddress,
            userAgent,
            success: true,
            severity: 'info',
        });
    }
    async logAccessDenied(userId, resource, action, scope, reason, ipAddress, userAgent) {
        await this.log({
            action: AuditAction.ACCESS_DENIED,
            userId,
            resourceType: resource,
            metadata: {
                action,
                scope,
                reason,
            },
            ipAddress,
            userAgent,
            success: false,
            errorMessage: reason,
            severity: 'warn',
        });
    }
    async logAdminBypass(userId, resource, action, ipAddress, userAgent) {
        await this.log({
            action: AuditAction.ADMIN_BYPASS,
            userId,
            resourceType: resource,
            metadata: {
                action,
            },
            ipAddress,
            userAgent,
            success: true,
            severity: 'info',
        });
    }
    async getAuditLogs(params = {}) {
        const { userId, action, resourceType, success, startDate, endDate, page = 1, pageSize = 50, } = params;
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (resourceType)
            where.resourceType = resourceType;
        if (success !== undefined)
            where.success = success;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
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
                orderBy: {
                    timestamp: 'desc',
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getSuspiciousActivities(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const deniedAttempts = await this.prisma.auditLog.groupBy({
            by: ['userId', 'resourceType'],
            where: {
                action: AuditAction.ACCESS_DENIED,
                timestamp: {
                    gte: startDate,
                },
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gt: 5,
                    },
                },
            },
        });
        return deniedAttempts;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map