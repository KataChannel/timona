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
exports.ReviewResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const review_service_1 = require("../../services/review.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const review_type_1 = require("../types/review.type");
let ReviewResolver = class ReviewResolver {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async reviews(input) {
        const result = await this.reviewService.getReviews(input || {});
        return {
            items: result.items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
            hasMore: result.hasMore,
        };
    }
    async productReviews(productId, page, limit, rating) {
        return this.reviews({ productId, page, limit, rating });
    }
    async review(id) {
        return this.reviewService.getReviewById(id);
    }
    async productRatingSummary(productId) {
        return this.reviewService.getProductRatingSummary(productId);
    }
    async canReviewProduct(productId, context) {
        const userId = context.req.user.id;
        return this.reviewService.canReview(userId, productId);
    }
    async createReview(input, context) {
        const userId = context.req.user.id;
        return this.reviewService.createReview(userId, input);
    }
    async updateReview(id, input, context) {
        const userId = context.req.user.id;
        return this.reviewService.updateReview(id, userId, input);
    }
    async deleteReview(id, context) {
        const userId = context.req.user.id;
        const isAdmin = context.req.user.roleType === 'ADMIN';
        return this.reviewService.deleteReview(id, userId, isAdmin);
    }
    async markReviewHelpful(input, context) {
        const userId = context.req.user.id;
        return this.reviewService.markHelpful(userId, input);
    }
};
exports.ReviewResolver = ReviewResolver;
__decorate([
    (0, graphql_1.Query)(() => review_type_1.ReviewsResponse),
    __param(0, (0, graphql_1.Args)('input', { type: () => review_type_1.GetReviewsInput, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_type_1.GetReviewsInput]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "reviews", null);
__decorate([
    (0, graphql_1.Query)(() => review_type_1.ReviewsResponse),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, nullable: true, defaultValue: 1 })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 })),
    __param(3, (0, graphql_1.Args)('rating', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "productReviews", null);
__decorate([
    (0, graphql_1.Query)(() => review_type_1.ProductReviewType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "review", null);
__decorate([
    (0, graphql_1.Query)(() => review_type_1.ProductRatingSummaryType),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "productRatingSummary", null);
__decorate([
    (0, graphql_1.Query)(() => review_type_1.CanReviewResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "canReviewProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_type_1.ProductReviewType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_type_1.CreateReviewInput, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "createReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_type_1.ProductReviewType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_type_1.UpdateReviewInput, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "updateReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_type_1.ReviewResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "deleteReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_type_1.ReviewResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_type_1.ReviewHelpfulInput, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "markReviewHelpful", null);
exports.ReviewResolver = ReviewResolver = __decorate([
    (0, graphql_1.Resolver)(() => review_type_1.ProductReviewType),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewResolver);
//# sourceMappingURL=review.resolver.js.map