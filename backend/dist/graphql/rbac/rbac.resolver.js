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
exports.RBACResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const rbac_service_1 = require("../../common/services/rbac.service");
const rbac_guard_1 = require("../../common/guards/rbac.guard");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const rbac_decorator_1 = require("../../common/decorators/rbac.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const rbac_types_1 = require("./rbac.types");
let RBACResolver = class RBACResolver {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async myPermissions(user) {
        if (!user || !user.id) {
            return [];
        }
        return this.rbacService.getUserPermissions(user.id);
    }
    async myRoles(user) {
        if (!user || !user.id) {
            return [];
        }
        return this.rbacService.getUserRoles(user.id);
    }
    async checkMyPermission(user, resource, action, scope) {
        if (!user || !user.id) {
            return false;
        }
        return this.rbacService.userHasPermission(user.id, resource, action, scope);
    }
    async roles() {
        return this.rbacService.getAllRoles();
    }
    async role(id) {
        return this.rbacService.getRoleById(id);
    }
    async permissions() {
        const data = await this.rbacService.getAllPermissions();
        return { data };
    }
    async assignRoleToUser(currentUser, userId, roleId, expiresAt) {
        return this.rbacService.assignRoleToUser(userId, roleId, currentUser.id, expiresAt);
    }
    async removeRoleFromUser(userId, roleId, currentUser) {
        return this.rbacService.removeRoleFromUser(userId, roleId, currentUser.id);
    }
    async usersByRole(roleId) {
        return this.rbacService.getUsersByRole(roleId);
    }
    async checkUserPermission(userId, resource, action, scope) {
        return this.rbacService.userHasPermission(userId, resource, action, scope);
    }
};
exports.RBACResolver = RBACResolver;
__decorate([
    (0, graphql_1.Query)(() => [rbac_types_1.PermissionType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "myPermissions", null);
__decorate([
    (0, graphql_1.Query)(() => [rbac_types_1.UserRoleAssignmentType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "myRoles", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('resource')),
    __param(2, (0, graphql_1.Args)('action')),
    __param(3, (0, graphql_1.Args)('scope', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "checkMyPermission", null);
__decorate([
    (0, graphql_1.Query)(() => [rbac_types_1.RoleType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "roles", null);
__decorate([
    (0, graphql_1.Query)(() => rbac_types_1.RoleType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "role", null);
__decorate([
    (0, graphql_1.Query)(() => rbac_types_1.PermissionsByCategoryType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "permissions", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_types_1.UserRoleAssignmentType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('userId')),
    __param(2, (0, graphql_1.Args)('roleId')),
    __param(3, (0, graphql_1.Args)('expiresAt', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Date]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "assignRoleToUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_types_1.RemoveRoleResultType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('roleId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "removeRoleFromUser", null);
__decorate([
    (0, graphql_1.Query)(() => [rbac_types_1.UserRoleAssignmentType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, graphql_1.Args)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "usersByRole", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RBACGuard),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('resource')),
    __param(2, (0, graphql_1.Args)('action')),
    __param(3, (0, graphql_1.Args)('scope', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RBACResolver.prototype, "checkUserPermission", null);
exports.RBACResolver = RBACResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [rbac_service_1.RBACService])
], RBACResolver);
//# sourceMappingURL=rbac.resolver.js.map