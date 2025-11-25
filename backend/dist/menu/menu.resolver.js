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
var MenuResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const dto_1 = require("./dto");
let MenuResolver = MenuResolver_1 = class MenuResolver {
    constructor(menuService) {
        this.menuService = menuService;
        this.logger = new common_1.Logger(MenuResolver_1.name);
    }
    async getMenu(id) {
        this.logger.log(`Query: getMenu(${id})`);
        return this.menuService.findById(id);
    }
    async getMenuBySlug(slug) {
        this.logger.log(`Query: getMenuBySlug(${slug})`);
        return this.menuService.findBySlug(slug);
    }
    async getMenus(filter, page, limit, orderByField, direction) {
        this.logger.log('Query: getMenus');
        return this.menuService.findAll(filter, orderByField ? { field: orderByField, direction } : undefined, { page, pageSize: limit });
    }
    async getMenuTree(type, parentId) {
        this.logger.log(`Query: getMenuTree(type: ${type}, parentId: ${parentId})`);
        return this.menuService.getMenuTree(type, parentId);
    }
    async getSidebarMenus() {
        this.logger.log('Query: getSidebarMenus');
        return this.menuService.getMenusByType('SIDEBAR');
    }
    async getHeaderMenus() {
        this.logger.log('Query: getHeaderMenus');
        return this.menuService.getMenusByTypeHierarchical('HEADER');
    }
    async getFooterMenus() {
        this.logger.log('Query: getFooterMenus');
        return this.menuService.getMenusByTypeHierarchical('FOOTER');
    }
    async getMobileMenus() {
        this.logger.log('Query: getMobileMenus');
        return this.menuService.getMenusByTypeHierarchical('MOBILE');
    }
    async getMyMenus(type, ctx) {
        const userId = ctx?.req?.user?.id;
        const userRoles = ctx?.req?.user?.roles || [];
        const userPermissions = ctx?.req?.user?.permissions || [];
        if (!userId) {
            this.logger.warn('Query: myMenus - No user context');
            return [];
        }
        this.logger.log(`Query: myMenus for user ${userId}`);
        return this.menuService.getAccessibleMenus(userId, userRoles, userPermissions, type);
    }
    async createMenu(input, ctx) {
        const userId = ctx?.req?.user?.id;
        this.logger.log(`Mutation: createMenu by user ${userId}`);
        return this.menuService.createMenu(input, userId);
    }
    async updateMenu(id, input, ctx) {
        const userId = ctx?.req?.user?.id;
        this.logger.log(`Mutation: updateMenu(${id}) by user ${userId}`);
        return this.menuService.updateMenu(id, input, userId);
    }
    async deleteMenu(id) {
        this.logger.log(`Mutation: deleteMenu(${id})`);
        await this.menuService.deleteMenu(id);
        return true;
    }
    async toggleMenuActive(id) {
        this.logger.log(`Mutation: toggleMenuActive(${id})`);
        return this.menuService.toggleActive(id);
    }
    async toggleMenuVisibility(id) {
        this.logger.log(`Mutation: toggleMenuVisibility(${id})`);
        return this.menuService.toggleVisibility(id);
    }
    async reorderMenus(menuOrders) {
        this.logger.log(`Mutation: reorderMenus (${menuOrders.length} items)`);
        const ids = menuOrders.map(m => m.id);
        return this.menuService.reorderMenus(ids);
    }
    async moveMenu(menuId, newParentId, newOrder) {
        this.logger.log(`Mutation: moveMenu(${menuId}) to parent ${newParentId}`);
        return this.menuService.moveMenu(menuId, newParentId, newOrder);
    }
};
exports.MenuResolver = MenuResolver;
__decorate([
    (0, graphql_1.Query)(() => dto_1.MenuResponseDto, { name: 'menu', nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenu", null);
__decorate([
    (0, graphql_1.Query)(() => dto_1.MenuResponseDto, { name: 'menuBySlug', nullable: true }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenuBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => dto_1.MenuPaginationResponseDto, { name: 'menus' }),
    __param(0, (0, graphql_1.Args)('filter', { type: () => dto_1.MenuFilterDto, nullable: true })),
    __param(1, (0, graphql_1.Args)('page', { type: () => Number, nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => Number, nullable: true })),
    __param(3, (0, graphql_1.Args)('orderBy', { type: () => String, nullable: true })),
    __param(4, (0, graphql_1.Args)('direction', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.MenuFilterDto, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenus", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuResponseDto], { name: 'menuTree' }),
    __param(0, (0, graphql_1.Args)('type', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('parentId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMenuTree", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuResponseDto], { name: 'sidebarMenus' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getSidebarMenus", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuHierarchicalDto], { name: 'headerMenus' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getHeaderMenus", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuHierarchicalDto], { name: 'footerMenus' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getFooterMenus", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuHierarchicalDto], { name: 'mobileMenus' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMobileMenus", null);
__decorate([
    (0, graphql_1.Query)(() => [dto_1.MenuResponseDto], { name: 'myMenus' }),
    __param(0, (0, graphql_1.Args)('type', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "getMyMenus", null);
__decorate([
    (0, graphql_1.Mutation)(() => dto_1.MenuResponseDto, { name: 'createMenu' }),
    __param(0, (0, graphql_1.Args)('input', { type: () => dto_1.CreateMenuDto })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "createMenu", null);
__decorate([
    (0, graphql_1.Mutation)(() => dto_1.MenuResponseDto, { name: 'updateMenu' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input', { type: () => dto_1.UpdateMenuDto })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "updateMenu", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteMenu' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "deleteMenu", null);
__decorate([
    (0, graphql_1.Mutation)(() => dto_1.MenuResponseDto, { name: 'toggleMenuActive' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "toggleMenuActive", null);
__decorate([
    (0, graphql_1.Mutation)(() => dto_1.MenuResponseDto, { name: 'toggleMenuVisibility' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "toggleMenuVisibility", null);
__decorate([
    (0, graphql_1.Mutation)(() => [dto_1.MenuResponseDto], { name: 'reorderMenus' }),
    __param(0, (0, graphql_1.Args)('menuOrders', { type: () => [dto_1.MenuOrderDto] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "reorderMenus", null);
__decorate([
    (0, graphql_1.Mutation)(() => dto_1.MenuResponseDto, { name: 'moveMenu' }),
    __param(0, (0, graphql_1.Args)('menuId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('newParentId', { type: () => graphql_1.ID, nullable: true })),
    __param(2, (0, graphql_1.Args)('newOrder', { type: () => Number, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MenuResolver.prototype, "moveMenu", null);
exports.MenuResolver = MenuResolver = MenuResolver_1 = __decorate([
    (0, graphql_1.Resolver)('Menu'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuResolver);
//# sourceMappingURL=menu.resolver.js.map