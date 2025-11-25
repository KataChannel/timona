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
exports.UpdateProductsResult = exports.UpdateProductsStats = exports.ProductNormalizationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const product_normalization_service_1 = require("./product-normalization.service");
let ProductNormalizationResolver = class ProductNormalizationResolver {
    constructor(normalizationService) {
        this.normalizationService = normalizationService;
    }
    async findSimilarProducts(searchText, threshold) {
        const results = await this.normalizationService.findSimilarProducts(searchText, threshold);
        return results.map((r) => ({
            id: r.id,
            ten: r.ten,
            ten2: r.ten2,
            ma: r.ma,
            similarityScore: r.similarity_score,
        }));
    }
    async findCanonicalName(productName, threshold) {
        return this.normalizationService.findCanonicalName(productName, threshold);
    }
    async normalizeProductName(productName, threshold) {
        return this.normalizationService.normalizeProductName(productName, threshold);
    }
    async getProductGroups(minGroupSize) {
        return this.normalizationService.getProductGroups(minGroupSize);
    }
    async findDuplicates() {
        return this.normalizationService.findDuplicates();
    }
    async testSimilarity(text1, text2) {
        return this.normalizationService.testSimilarity(text1, text2);
    }
    async normalizeProducts(productIds, threshold) {
        return this.normalizationService.batchNormalize(productIds, threshold);
    }
    async mergeDuplicates(ten2, keepId) {
        return this.normalizationService.mergeDuplicates(ten2, keepId);
    }
    async updateProductsFromDetails(dryRun, limit) {
        return this.normalizationService.updateProductsFromDetails(dryRun, limit);
    }
    async findSimilarProductsAdvanced(searchText, searchDvt, searchPrice, priceTolerance, threshold) {
        const results = await this.normalizationService.findSimilarProductsAdvanced(searchText, searchDvt, searchPrice, priceTolerance, threshold);
        return results.map((r) => ({
            id: r.id,
            ten: r.ten,
            ten2: r.ten2,
            ma: r.ma,
            dvt: r.dvt,
            dgia: r.dgia,
            similarityScore: r.similarity_score,
            priceDiffPercent: r.price_diff_percent,
            dvtMatch: r.dvt_match,
        }));
    }
    async findCanonicalNameAdvanced(productName, productDvt, productPrice, priceTolerance, threshold) {
        const result = await this.normalizationService.findCanonicalNameAdvanced(productName, productDvt, productPrice, priceTolerance, threshold);
        if (!result)
            return null;
        return {
            canonicalName: result.canonical_name,
            canonicalDvt: result.canonical_dvt,
            canonicalPrice: result.canonical_price,
            matchCount: result.match_count,
            avgPrice: result.avg_price,
        };
    }
    async normalizeProductNameAdvanced(productName, productDvt, productPrice, priceTolerance, threshold) {
        return this.normalizationService.normalizeProductNameAdvanced(productName, productDvt, productPrice, priceTolerance, threshold);
    }
    async getProductGroupsAdvanced(minGroupSize, priceTolerance) {
        return this.normalizationService.getProductGroupsAdvanced(minGroupSize, priceTolerance);
    }
    async findDuplicatesAdvanced(priceTolerance) {
        return this.normalizationService.findDuplicatesAdvanced(priceTolerance);
    }
    async testProductSimilarity(productId1, productId2) {
        const result = await this.normalizationService.testProductSimilarity(productId1, productId2);
        if (!result)
            return null;
        return {
            product1Name: result.product1_name,
            product2Name: result.product2_name,
            nameSimilarity: result.name_similarity,
            dvtMatch: result.dvt_match,
            product1Dvt: result.product1_dvt,
            product2Dvt: result.product2_dvt,
            priceDiffPercent: result.price_diff_percent,
            product1Price: result.product1_price,
            product2Price: result.product2_price,
            isDuplicate: result.is_duplicate,
        };
    }
};
exports.ProductNormalizationResolver = ProductNormalizationResolver;
__decorate([
    (0, graphql_1.Query)(() => [SimilarProduct], {
        description: 'Find products similar to search text using fuzzy matching',
    }),
    __param(0, (0, graphql_1.Args)('searchText', { type: () => String })),
    __param(1, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.3,
        description: 'Similarity threshold (0.0-1.0)',
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findSimilarProducts", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        nullable: true,
        description: 'Find canonical (normalized) name for a product',
    }),
    __param(0, (0, graphql_1.Args)('productName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.6,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findCanonicalName", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        description: 'Normalize a product name',
    }),
    __param(0, (0, graphql_1.Args)('productName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.6,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "normalizeProductName", null);
__decorate([
    (0, graphql_1.Query)(() => [ProductGroup], {
        description: 'Get product groups by normalized name (ten2)',
    }),
    __param(0, (0, graphql_1.Args)('minGroupSize', {
        type: () => Number,
        defaultValue: 2,
        description: 'Minimum products per group',
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "getProductGroups", null);
__decorate([
    (0, graphql_1.Query)(() => [DuplicateGroup], {
        description: 'Find duplicate products (same ten2)',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findDuplicates", null);
__decorate([
    (0, graphql_1.Query)(() => Number, {
        description: 'Test similarity between two strings',
    }),
    __param(0, (0, graphql_1.Args)('text1', { type: () => String })),
    __param(1, (0, graphql_1.Args)('text2', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "testSimilarity", null);
__decorate([
    (0, graphql_1.Mutation)(() => NormalizationStats, {
        description: 'Batch normalize products',
    }),
    __param(0, (0, graphql_1.Args)('productIds', {
        type: () => [String],
        nullable: true,
        description: 'Optional: specific product IDs to normalize',
    })),
    __param(1, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.6,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "normalizeProducts", null);
__decorate([
    (0, graphql_1.Mutation)(() => Number, {
        description: 'Merge duplicate products (keep one, delete rest)',
    }),
    __param(0, (0, graphql_1.Args)('ten2', {
        type: () => String,
        description: 'Normalized name of products to merge',
    })),
    __param(1, (0, graphql_1.Args)('keepId', {
        type: () => String,
        nullable: true,
        description: 'Optional: ID of product to keep',
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "mergeDuplicates", null);
__decorate([
    (0, graphql_1.Mutation)(() => UpdateProductsResult, {
        description: 'Update/create products from ext_detailhoadon with auto-normalization',
    }),
    __param(0, (0, graphql_1.Args)('dryRun', {
        type: () => Boolean,
        defaultValue: false,
        description: 'Preview mode - do not save to database',
    })),
    __param(1, (0, graphql_1.Args)('limit', {
        type: () => graphql_1.Int,
        nullable: true,
        description: 'Limit number of records to process',
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "updateProductsFromDetails", null);
__decorate([
    (0, graphql_1.Query)(() => [SimilarProductAdvanced], {
        description: 'Find similar products with DVT and price matching',
    }),
    __param(0, (0, graphql_1.Args)('searchText', { type: () => String })),
    __param(1, (0, graphql_1.Args)('searchDvt', {
        type: () => String,
        nullable: true,
        description: 'Đơn vị tính (optional)',
    })),
    __param(2, (0, graphql_1.Args)('searchPrice', {
        type: () => Number,
        nullable: true,
        description: 'Đơn giá (optional)',
    })),
    __param(3, (0, graphql_1.Args)('priceTolerance', {
        type: () => Number,
        defaultValue: 10,
        description: 'Price tolerance percentage (default 10%)',
    })),
    __param(4, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.3,
        description: 'Similarity threshold (0.0-1.0)',
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findSimilarProductsAdvanced", null);
__decorate([
    (0, graphql_1.Query)(() => CanonicalNameAdvanced, {
        nullable: true,
        description: 'Find canonical name with DVT and price',
    }),
    __param(0, (0, graphql_1.Args)('productName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('productDvt', {
        type: () => String,
        nullable: true,
    })),
    __param(2, (0, graphql_1.Args)('productPrice', {
        type: () => Number,
        nullable: true,
    })),
    __param(3, (0, graphql_1.Args)('priceTolerance', {
        type: () => Number,
        defaultValue: 10,
    })),
    __param(4, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.6,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findCanonicalNameAdvanced", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        description: 'Normalize product name with DVT and price',
    }),
    __param(0, (0, graphql_1.Args)('productName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('productDvt', {
        type: () => String,
        nullable: true,
    })),
    __param(2, (0, graphql_1.Args)('productPrice', {
        type: () => Number,
        nullable: true,
    })),
    __param(3, (0, graphql_1.Args)('priceTolerance', {
        type: () => Number,
        defaultValue: 10,
    })),
    __param(4, (0, graphql_1.Args)('threshold', {
        type: () => Number,
        defaultValue: 0.6,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "normalizeProductNameAdvanced", null);
__decorate([
    (0, graphql_1.Query)(() => [ProductGroupAdvanced], {
        description: 'Get product groups with DVT and price statistics',
    }),
    __param(0, (0, graphql_1.Args)('minGroupSize', {
        type: () => Number,
        defaultValue: 2,
    })),
    __param(1, (0, graphql_1.Args)('priceTolerance', {
        type: () => Number,
        defaultValue: 10,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "getProductGroupsAdvanced", null);
__decorate([
    (0, graphql_1.Query)(() => [DuplicateGroupAdvanced], {
        description: 'Find duplicates with DVT and price matching',
    }),
    __param(0, (0, graphql_1.Args)('priceTolerance', {
        type: () => Number,
        defaultValue: 10,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "findDuplicatesAdvanced", null);
__decorate([
    (0, graphql_1.Query)(() => ProductSimilarityTest, {
        nullable: true,
        description: 'Test similarity between two products',
    }),
    __param(0, (0, graphql_1.Args)('productId1', { type: () => String })),
    __param(1, (0, graphql_1.Args)('productId2', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductNormalizationResolver.prototype, "testProductSimilarity", null);
exports.ProductNormalizationResolver = ProductNormalizationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_normalization_service_1.ProductNormalizationService])
], ProductNormalizationResolver);
let SimilarProduct = class SimilarProduct {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SimilarProduct.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SimilarProduct.prototype, "ten", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SimilarProduct.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SimilarProduct.prototype, "ma", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SimilarProduct.prototype, "similarityScore", void 0);
SimilarProduct = __decorate([
    (0, graphql_1.ObjectType)()
], SimilarProduct);
let ProductGroup = class ProductGroup {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductGroup.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductGroup.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ProductSummary]),
    __metadata("design:type", Array)
], ProductGroup.prototype, "products", void 0);
ProductGroup = __decorate([
    (0, graphql_1.ObjectType)()
], ProductGroup);
let ProductSummary = class ProductSummary {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSummary.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSummary.prototype, "ten", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductSummary.prototype, "ma", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ProductSummary.prototype, "dgia", void 0);
ProductSummary = __decorate([
    (0, graphql_1.ObjectType)()
], ProductSummary);
let DuplicateGroup = class DuplicateGroup {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DuplicateGroup.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DuplicateGroup.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], DuplicateGroup.prototype, "productIds", void 0);
DuplicateGroup = __decorate([
    (0, graphql_1.ObjectType)()
], DuplicateGroup);
let NormalizationStats = class NormalizationStats {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NormalizationStats.prototype, "updated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NormalizationStats.prototype, "skipped", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NormalizationStats.prototype, "errors", void 0);
NormalizationStats = __decorate([
    (0, graphql_1.ObjectType)()
], NormalizationStats);
let SimilarProductAdvanced = class SimilarProductAdvanced {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SimilarProductAdvanced.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SimilarProductAdvanced.prototype, "ten", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SimilarProductAdvanced.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SimilarProductAdvanced.prototype, "ma", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SimilarProductAdvanced.prototype, "dvt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], SimilarProductAdvanced.prototype, "dgia", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SimilarProductAdvanced.prototype, "similarityScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], SimilarProductAdvanced.prototype, "priceDiffPercent", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SimilarProductAdvanced.prototype, "dvtMatch", void 0);
SimilarProductAdvanced = __decorate([
    (0, graphql_1.ObjectType)()
], SimilarProductAdvanced);
let CanonicalNameAdvanced = class CanonicalNameAdvanced {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CanonicalNameAdvanced.prototype, "canonicalName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CanonicalNameAdvanced.prototype, "canonicalDvt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CanonicalNameAdvanced.prototype, "canonicalPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CanonicalNameAdvanced.prototype, "matchCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CanonicalNameAdvanced.prototype, "avgPrice", void 0);
CanonicalNameAdvanced = __decorate([
    (0, graphql_1.ObjectType)()
], CanonicalNameAdvanced);
let ProductGroupAdvanced = class ProductGroupAdvanced {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductGroupAdvanced.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductGroupAdvanced.prototype, "dvt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductGroupAdvanced.prototype, "product_count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductGroupAdvanced.prototype, "min_price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductGroupAdvanced.prototype, "max_price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductGroupAdvanced.prototype, "avg_price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductGroupAdvanced.prototype, "price_variance", void 0);
ProductGroupAdvanced = __decorate([
    (0, graphql_1.ObjectType)()
], ProductGroupAdvanced);
let DuplicateGroupAdvanced = class DuplicateGroupAdvanced {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DuplicateGroupAdvanced.prototype, "ten2", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DuplicateGroupAdvanced.prototype, "dvt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DuplicateGroupAdvanced.prototype, "product_count", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DuplicateGroupAdvanced.prototype, "price_range", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], DuplicateGroupAdvanced.prototype, "product_ids", void 0);
DuplicateGroupAdvanced = __decorate([
    (0, graphql_1.ObjectType)()
], DuplicateGroupAdvanced);
let ProductSimilarityTest = class ProductSimilarityTest {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSimilarityTest.prototype, "product1Name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSimilarityTest.prototype, "product2Name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductSimilarityTest.prototype, "nameSimilarity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductSimilarityTest.prototype, "dvtMatch", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductSimilarityTest.prototype, "product1Dvt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductSimilarityTest.prototype, "product2Dvt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductSimilarityTest.prototype, "priceDiffPercent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductSimilarityTest.prototype, "product1Price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductSimilarityTest.prototype, "product2Price", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductSimilarityTest.prototype, "isDuplicate", void 0);
ProductSimilarityTest = __decorate([
    (0, graphql_1.ObjectType)()
], ProductSimilarityTest);
let UpdateProductsStats = class UpdateProductsStats {
};
exports.UpdateProductsStats = UpdateProductsStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "totalDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "processed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "created", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "updated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "skipped", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateProductsStats.prototype, "errors", void 0);
exports.UpdateProductsStats = UpdateProductsStats = __decorate([
    (0, graphql_1.ObjectType)()
], UpdateProductsStats);
let UpdateProductsResult = class UpdateProductsResult {
};
exports.UpdateProductsResult = UpdateProductsResult;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], UpdateProductsResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UpdateProductsResult.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => UpdateProductsStats, { nullable: true }),
    __metadata("design:type", UpdateProductsStats)
], UpdateProductsResult.prototype, "stats", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateProductsResult.prototype, "output", void 0);
exports.UpdateProductsResult = UpdateProductsResult = __decorate([
    (0, graphql_1.ObjectType)()
], UpdateProductsResult);
//# sourceMappingURL=product-normalization.resolver.js.map