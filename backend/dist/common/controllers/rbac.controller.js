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
exports.RBACController = void 0;
const common_1 = require("@nestjs/common");
const rbac_service_1 = require("../services/rbac.service");
const rbac_guard_1 = require("../guards/rbac.guard");
const rbac_decorator_1 = require("../decorators/rbac.decorator");
let RBACController = class RBACController {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async getAllRoles() {
        return this.rbacService.getAllRoles();
    }
    async getRoleById(id) {
        return this.rbacService.getRoleById(id);
    }
    async getAllPermissions() {
        return this.rbacService.getAllPermissions();
    }
    async getUserRoles(userId) {
        return this.rbacService.getUserRoles(userId);
    }
    async getUserPermissions(userId) {
        return this.rbacService.getUserPermissions(userId);
    }
    async getMyPermissions(req) {
        return this.rbacService.getUserPermissions(req.user.id);
    }
    async getMyRoles(req) {
        return this.rbacService.getUserRoles(req.user.id);
    }
    async assignRoleToUser(userId, body, req) {
        const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
        return this.rbacService.assignRoleToUser(userId, body.roleId, req.user.id, expiresAt);
    }
    async removeRoleFromUser(userId, roleId) {
        return this.rbacService.removeRoleFromUser(userId, roleId);
    }
    async getUsersByRole(roleId) {
        return this.rbacService.getUsersByRole(roleId);
    }
    async checkPermission(body) {
        const hasPermission = await this.rbacService.userHasPermission(body.userId, body.resource, body.action, body.scope);
        return { hasPermission };
    }
};
exports.RBACController = RBACController;
__decorate([
    (0, common_1.Get)('roles'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getRoleById", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Get)('users/:userId/roles'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Get)('users/:userId/permissions'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('me/permissions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getMyPermissions", null);
__decorate([
    (0, common_1.Get)('me/roles'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getMyRoles", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "removeRoleFromUser", null);
__decorate([
    (0, common_1.Get)('roles/:roleId/users'),
    (0, rbac_decorator_1.RequireRole)('ADMIN'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "getUsersByRole", null);
__decorate([
    (0, common_1.Post)('check-permission'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RBACController.prototype, "checkPermission", null);
exports.RBACController = RBACController = __decorate([
    (0, common_1.Controller)('rbac'),
    (0, common_1.UseGuards)(rbac_guard_1.RBACGuard),
    __metadata("design:paramtypes", [rbac_service_1.RBACService])
], RBACController);
//# sourceMappingURL=rbac.controller.js.map