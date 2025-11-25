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
exports.CategoryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const category_service_1 = require("../../services/category.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const category_type_1 = require("../types/category.type");
const category_input_1 = require("../inputs/category.input");
let CategoryResolver = class CategoryResolver {
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    async getCategories(input) {
        return this.categoryService.getCategories(input);
    }
    async getCategoryTree() {
        return this.categoryService.getCategoryTree();
    }
    async getCategory(id) {
        return this.categoryService.getCategoryById(id);
    }
    async getCategoryBySlug(slug) {
        return this.categoryService.getCategoryBySlug(slug);
    }
    async createCategory(input) {
        return this.categoryService.createCategory(input);
    }
    async updateCategory(input) {
        return this.categoryService.updateCategory(input);
    }
    async deleteCategory(id, deleteProducts) {
        return this.categoryService.deleteCategory(id, deleteProducts);
    }
    async productCount(category) {
        return this.categoryService.getProductCount(category.id);
    }
};
exports.CategoryResolver = CategoryResolver;
__decorate([
    (0, graphql_1.Query)(() => category_type_1.PaginatedCategories, { name: 'categories' }),
    __param(0, (0, graphql_1.Args)('input', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_input_1.GetCategoriesInput]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "getCategories", null);
__decorate([
    (0, graphql_1.Query)(() => [category_type_1.CategoryType], { name: 'categoryTree' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "getCategoryTree", null);
__decorate([
    (0, graphql_1.Query)(() => category_type_1.CategoryType, { name: 'category' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "getCategory", null);
__decorate([
    (0, graphql_1.Query)(() => category_type_1.CategoryType, { name: 'categoryBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "getCategoryBySlug", null);
__decorate([
    (0, graphql_1.Mutation)(() => category_type_1.CategoryType, { name: 'createCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_input_1.CreateCategoryInput]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "createCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => category_type_1.CategoryType, { name: 'updateCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_input_1.UpdateCategoryInput]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "updateCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => category_type_1.CategoryType, { name: 'deleteCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('deleteProducts', { type: () => Boolean, defaultValue: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "deleteCategory", null);
__decorate([
    (0, graphql_1.ResolveField)(() => graphql_1.Int),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_type_1.CategoryType]),
    __metadata("design:returntype", Promise)
], CategoryResolver.prototype, "productCount", null);
exports.CategoryResolver = CategoryResolver = __decorate([
    (0, graphql_1.Resolver)(() => category_type_1.CategoryType),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryResolver);
//# sourceMappingURL=category.resolver.js.map