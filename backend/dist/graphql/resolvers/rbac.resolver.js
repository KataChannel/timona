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
exports.UserRbacResolver = exports.RoleResolver = exports.PermissionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const rbac_model_1 = require("../models/rbac.model");
const rbac_input_1 = require("../inputs/rbac.input");
const rbac_service_1 = require("../../services/rbac.service");
const client_1 = require("@prisma/client");
let PermissionResolver = class PermissionResolver {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async searchPermissions(input) {
        return this.rbacService.searchPermissions(input);
    }
    async getPermissionById(id) {
        return this.rbacService.getPermissionById(id);
    }
    async createPermission(input) {
        return this.rbacService.createPermission(input);
    }
    async updatePermission(id, input) {
        return this.rbacService.updatePermission(id, input);
    }
    async deletePermission(id) {
        return this.rbacService.deletePermission(id);
    }
};
exports.PermissionResolver = PermissionResolver;
__decorate([
    (0, graphql_1.Query)(() => rbac_model_1.PermissionSearchResult, { name: 'searchPermissions' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.PermissionSearchInput]),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "searchPermissions", null);
__decorate([
    (0, graphql_1.Query)(() => rbac_model_1.Permission, { name: 'getPermissionById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "getPermissionById", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_model_1.Permission, { name: 'createPermission' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.CreatePermissionInput]),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "createPermission", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_model_1.Permission, { name: 'updatePermission' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rbac_input_1.UpdatePermissionInput]),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "updatePermission", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deletePermission' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "deletePermission", null);
exports.PermissionResolver = PermissionResolver = __decorate([
    (0, graphql_1.Resolver)(() => rbac_model_1.Permission),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], PermissionResolver);
let RoleResolver = class RoleResolver {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async searchRoles(input) {
        return this.rbacService.searchRoles(input);
    }
    async getRoleById(id) {
        return this.rbacService.getRoleById(id);
    }
    async createRole(input) {
        return this.rbacService.createRole(input);
    }
    async updateRole(id, input) {
        return this.rbacService.updateRole(id, input);
    }
    async deleteRole(id) {
        return this.rbacService.deleteRole(id);
    }
    async assignRolePermissions(input) {
        return this.rbacService.assignRolePermissions(input);
    }
};
exports.RoleResolver = RoleResolver;
__decorate([
    (0, graphql_1.Query)(() => rbac_model_1.RoleSearchResult, { name: 'searchRoles' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.RoleSearchInput]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "searchRoles", null);
__decorate([
    (0, graphql_1.Query)(() => rbac_model_1.Role, { name: 'getRoleById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "getRoleById", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_model_1.Role, { name: 'createRole' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.CreateRoleInput]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "createRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => rbac_model_1.Role, { name: 'updateRole' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rbac_input_1.UpdateRoleInput]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "updateRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteRole' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "deleteRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'assignRolePermissions' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.AssignRolePermissionInput]),
    __metadata("design:returntype", Promise)
], RoleResolver.prototype, "assignRolePermissions", null);
exports.RoleResolver = RoleResolver = __decorate([
    (0, graphql_1.Resolver)(() => rbac_model_1.Role),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], RoleResolver);
let UserRbacResolver = class UserRbacResolver {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async getUserRolePermissions(userId) {
        return this.rbacService.getUserEffectivePermissions(userId);
    }
    async assignUserRoles(input) {
        return this.rbacService.assignUserRoles(input);
    }
    async assignUserPermissions(input) {
        return this.rbacService.assignUserPermissions(input);
    }
};
exports.UserRbacResolver = UserRbacResolver;
__decorate([
    (0, graphql_1.Query)(() => rbac_model_1.UserRolePermissionSummary, { name: 'getUserRolePermissions' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserRbacResolver.prototype, "getUserRolePermissions", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'assignUserRoles' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.AssignUserRoleInput]),
    __metadata("design:returntype", Promise)
], UserRbacResolver.prototype, "assignUserRoles", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'assignUserPermissions' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_input_1.AssignUserPermissionInput]),
    __metadata("design:returntype", Promise)
], UserRbacResolver.prototype, "assignUserPermissions", null);
exports.UserRbacResolver = UserRbacResolver = __decorate([
    (0, graphql_1.Resolver)(() => rbac_model_1.UserRolePermissionSummary),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], UserRbacResolver);
//# sourceMappingURL=rbac.resolver.js.map