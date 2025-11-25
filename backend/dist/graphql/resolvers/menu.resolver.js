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
exports.MenuResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const menu_service_1 = require("../../services/menu.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const menu_type_1 = require("../types/menu.type");
const menu_input_1 = require("../inputs/menu.input");
let MenuResolver = class MenuResolver {
    constructor(menuService) {
        this.menuService = menuService;
    }
    async getMenus(type) {
        return this.menuService.getMenus(type);
    }
    async getMenu(id) {
        return this.menuService.getMenuById(id);
    }
    async getMenuBySlug(slug) {
        return this.menuService.getMenuBySlug(slug);
    }
    async createMenu(input, context) {
        const userId = context.req?.user?.id;
        return this.menuService.createMenu(input, userId);
    }
    async updateMenu(input, context) {
        const userId = context.req?.user?.id;
        return this.menuService.updateMenu(input.id, input, userId);
    }
    async deleteMenu(id) {
        return this.menuService.deleteMenu(id);
    }
    async reorderMenus(items) {
        return this.menuService.reorderMenus(items);
    }
};
exports.MenuResolver = MenuResolver;
__decorate([
    (0, graphql_1.Query)(() => [menu_type_1.MenuType], { name: 'menus' }),
    __param(0, (0, graphql_1.Args)('type', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenus", null);
__decorate([
    (0, graphql_1.Query)(() => menu_type_1.MenuType, { name: 'menu' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenu", null);
__decorate([
    (0, graphql_1.Query)(() => menu_type_1.MenuType, { name: 'menuBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenuBySlug", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => menu_type_1.MenuType),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_input_1.CreateMenuInput, Object]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "createMenu", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => menu_type_1.MenuType),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_input_1.UpdateMenuInput, Object]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "updateMenu", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "deleteMenu", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('items', { type: () => [ReorderMenuInput] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "reorderMenus", null);
exports.MenuResolver = MenuResolver = __decorate([
    (0, graphql_1.Resolver)(() => menu_type_1.MenuType),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuResolver);
const graphql_2 = require("@nestjs/graphql");
let ReorderMenuInput = class ReorderMenuInput {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReorderMenuInput.prototype, "id", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ReorderMenuInput.prototype, "order", void 0);
ReorderMenuInput = __decorate([
    (0, graphql_2.InputType)()
], ReorderMenuInput);
//# sourceMappingURL=menu.resolver.js.map