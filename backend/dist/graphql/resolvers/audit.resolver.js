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
exports.AuditResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("src/auth/jwt-auth.guard");
const roles_decorator_1 = require("src/auth/roles.decorator");
const roles_guard_1 = require("src/auth/roles.guard");
const enhanced_audit_service_1 = require("src/services/enhanced-audit.service");
const audit_log_types_1 = require("./audit-log.types");
let AuditResolver = class AuditResolver {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getAuditLogs(filters, context) {
        const result = await this.auditService.getAuditLogs({
            userId: filters?.userId,
            resourceType: filters?.resourceType,
            resourceId: filters?.resourceId,
            action: filters?.action,
            operationType: filters?.operationType,
            severity: filters?.severity,
            tags: filters?.tags,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo,
            correlationId: filters?.correlationId,
            batchId: filters?.batchId,
            sensitiveData: filters?.sensitiveData,
            requiresReview: filters?.requiresReview,
            page: filters?.page,
            limit: filters?.limit
        });
        return {
            logs: result.logs,
            pagination: result.pagination
        };
    }
    async getMyAuditLogs(filters, context) {
        const userId = context.req.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const result = await this.auditService.getAuditLogs({
            ...filters,
            userId,
            sensitiveData: false
        });
        return {
            logs: result.logs,
            pagination: result.pagination
        };
    }
    async getAuditStats(userId, dateFrom, dateTo) {
        return this.auditService.getAuditStats({
            userId,
            dateFrom,
            dateTo
        });
    }
    async getMyAuditStats(dateFrom, dateTo, context) {
        const userId = context.req.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.auditService.getAuditStats({
            userId,
            dateFrom,
            dateTo
        });
    }
};
exports.AuditResolver = AuditResolver;
__decorate([
    (0, graphql_1.Query)(() => audit_log_types_1.PaginatedAuditLogs),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_types_1.AuditLogFilter, Object]),
    __metadata("design:returntype", Promise)
], AuditResolver.prototype, "getAuditLogs", null);
__decorate([
    (0, graphql_1.Query)(() => audit_log_types_1.PaginatedAuditLogs),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuditResolver.prototype, "getMyAuditLogs", null);
__decorate([
    (0, graphql_1.Query)(() => audit_log_types_1.AuditLogStats),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('userId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('dateFrom', { nullable: true })),
    __param(2, (0, graphql_1.Args)('dateTo', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], AuditResolver.prototype, "getAuditStats", null);
__decorate([
    (0, graphql_1.Query)(() => audit_log_types_1.AuditLogStats),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, graphql_1.Args)('dateFrom', { nullable: true })),
    __param(1, (0, graphql_1.Args)('dateTo', { nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, Object]),
    __metadata("design:returntype", Promise)
], AuditResolver.prototype, "getMyAuditStats", null);
exports.AuditResolver = AuditResolver = __decorate([
    (0, graphql_1.Resolver)(() => audit_log_types_1.AuditLog),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [enhanced_audit_service_1.EnhancedAuditService])
], AuditResolver);
//# sourceMappingURL=audit.resolver.js.map