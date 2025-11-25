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
exports.ReviewsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const review_entity_1 = require("./entities/review.entity");
const review_input_1 = require("./dto/review.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let ReviewsResolver = class ReviewsResolver {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async createReview(user, input) {
        return this.reviewsService.createReview(user.id, input);
    }
    async updateReview(user, input) {
        return this.reviewsService.updateReview(user.id, input);
    }
    async deleteReview(user, reviewId) {
        return this.reviewsService.deleteReview(user.id, reviewId);
    }
    async markReviewHelpful(user, reviewId) {
        return this.reviewsService.markReviewHelpful(user.id, reviewId);
    }
    async reviews(input) {
        return this.reviewsService.getReviews(input);
    }
    async reviewStats(courseId) {
        return this.reviewsService.getReviewStats(courseId);
    }
    async userReview(user, courseId) {
        return this.reviewsService.getUserReview(user.id, courseId);
    }
};
exports.ReviewsResolver = ReviewsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_input_1.CreateReviewInput]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "createReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_input_1.UpdateReviewInput]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "updateReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "deleteReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "markReviewHelpful", null);
__decorate([
    (0, graphql_1.Query)(() => review_entity_1.ReviewsWithStats),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_input_1.GetReviewsInput]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "reviews", null);
__decorate([
    (0, graphql_1.Query)(() => review_entity_1.ReviewStats),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "reviewStats", null);
__decorate([
    (0, graphql_1.Query)(() => review_entity_1.Review, { nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "userReview", null);
exports.ReviewsResolver = ReviewsResolver = __decorate([
    (0, graphql_1.Resolver)(() => review_entity_1.Review),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsResolver);
//# sourceMappingURL=reviews.resolver.js.map