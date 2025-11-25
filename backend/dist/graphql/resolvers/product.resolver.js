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
exports.ProductResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const product_service_1 = require("../../services/product.service");
const category_service_1 = require("../../services/category.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const product_type_1 = require("../types/product.type");
const category_type_1 = require("../types/category.type");
const product_input_1 = require("../inputs/product.input");
let ProductResolver = class ProductResolver {
    constructor(productService, categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }
    async getProducts(input) {
        return this.productService.getProducts(input || {});
    }
    async getProduct(id) {
        return this.productService.getProductById(id);
    }
    async getProductBySlug(slug) {
        return this.productService.getProductBySlug(slug);
    }
    async getProductsByCategory(categoryId, input) {
        return this.productService.getProductsByCategory(categoryId, input);
    }
    async createProduct(input) {
        return this.productService.createProduct(input);
    }
    async updateProduct(input) {
        console.log('UpdateProduct resolver - input received:', input);
        console.log('UpdateProduct resolver - input.id:', input?.id);
        console.log('UpdateProduct resolver - input type:', typeof input);
        console.log('UpdateProduct resolver - input constructor:', input?.constructor?.name);
        console.log('UpdateProduct resolver - input keys:', Object.keys(input || {}));
        console.log('UpdateProduct resolver - JSON:', JSON.stringify(input, null, 2));
        return this.productService.updateProduct(input);
    }
    async deleteProduct(id) {
        return this.productService.deleteProduct(id);
    }
    async addProductImage(input) {
        await this.productService.addProductImage(input);
        return this.productService.getProductById(input.productId);
    }
    async deleteProductImage(id) {
        await this.productService.deleteProductImage(id);
        return true;
    }
    async addProductVariant(input) {
        await this.productService.addProductVariant(input);
        return this.productService.getProductById(input.productId);
    }
    async updateProductVariant(input) {
        const variant = await this.productService.updateProductVariant(input);
        return this.productService.getProductById(variant.productId);
    }
    async deleteProductVariant(id) {
        await this.productService.deleteProductVariant(id);
        return true;
    }
    async updateProductStock(id, quantity) {
        return this.productService.updateStock(id, quantity);
    }
    async category(product) {
        return this.categoryService.getCategoryById(product.categoryId);
    }
    async discountPercentage(product) {
        if (!product.originalPrice || product.originalPrice <= product.price) {
            return null;
        }
        return ((product.originalPrice - product.price) / product.originalPrice) * 100;
    }
    async profitMargin(product) {
        if (!product.costPrice || product.costPrice >= product.price) {
            return null;
        }
        return ((product.price - product.costPrice) / product.price) * 100;
    }
    async shortDescription(product) {
        return product.shortDesc || null;
    }
    async imageUrl(product) {
        return product.thumbnail || null;
    }
    async isNew(product) {
        return product.isNewArrival || false;
    }
    async isOrganic(product) {
        return product.attributes?.isOrganic || null;
    }
    async dimensions(product) {
        return product.attributes?.dimensions || null;
    }
    async manufacturer(product) {
        return product.attributes?.manufacturer || null;
    }
};
exports.ProductResolver = ProductResolver;
__decorate([
    (0, graphql_1.Query)(() => product_type_1.PaginatedProducts, { name: 'products' }),
    __param(0, (0, graphql_1.Args)('input', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.GetProductsInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getProducts", null);
__decorate([
    (0, graphql_1.Query)(() => product_type_1.ProductType, { name: 'product' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getProduct", null);
__decorate([
    (0, graphql_1.Query)(() => product_type_1.ProductType, { name: 'productBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getProductBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => product_type_1.PaginatedProducts, { name: 'productsByCategory' }),
    __param(0, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_input_1.GetProductsInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getProductsByCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'createProduct' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.CreateProductInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'updateProduct' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.UpdateProductInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'deleteProduct' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'addProductImage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.CreateProductImageInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "addProductImage", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteProductImage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProductImage", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'addProductVariant' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.CreateProductVariantInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "addProductVariant", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'updateProductVariant' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_input_1.UpdateProductVariantInput]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProductVariant", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteProductVariant' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProductVariant", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_type_1.ProductType, { name: 'updateProductStock' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('quantity', { type: () => Number })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProductStock", null);
__decorate([
    (0, graphql_1.ResolveField)(() => category_type_1.CategoryType),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_1.ProductType]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "category", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_1.ProductType]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "discountPercentage", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_1.ProductType]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "profitMargin", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "shortDescription", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "imageUrl", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Boolean, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "isNew", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Boolean, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "isOrganic", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "dimensions", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "manufacturer", null);
exports.ProductResolver = ProductResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_type_1.ProductType),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        category_service_1.CategoryService])
], ProductResolver);
//# sourceMappingURL=product.resolver.js.map