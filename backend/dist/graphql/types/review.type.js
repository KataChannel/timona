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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewHelpfulInput = exports.GetReviewsInput = exports.UpdateReviewInput = exports.CreateReviewInput = exports.ReviewResponse = exports.CanReviewResponse = exports.ReviewsResponse = exports.ProductRatingSummaryType = exports.RatingDistributionType = exports.ProductReviewType = exports.ReviewProductType = exports.ReviewUserType = void 0;
const graphql_1 = require("@nestjs/graphql");
let ReviewUserType = class ReviewUserType {
};
exports.ReviewUserType = ReviewUserType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReviewUserType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUserType.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUserType.prototype, "fullName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUserType.prototype, "avatar", void 0);
exports.ReviewUserType = ReviewUserType = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewUserType);
let ReviewProductType = class ReviewProductType {
};
exports.ReviewProductType = ReviewProductType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReviewProductType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewProductType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewProductType.prototype, "slug", void 0);
exports.ReviewProductType = ReviewProductType = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewProductType);
let ProductReviewType = class ProductReviewType {
};
exports.ProductReviewType = ProductReviewType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProductReviewType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProductReviewType.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReviewProductType, { nullable: true }),
    __metadata("design:type", ReviewProductType)
], ProductReviewType.prototype, "product", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReviewUserType, { nullable: true }),
    __metadata("design:type", ReviewUserType)
], ProductReviewType.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "guestName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "guestEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductReviewType.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "comment", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductReviewType.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductReviewType.prototype, "isVerifiedPurchase", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductReviewType.prototype, "isApproved", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductReviewType.prototype, "moderatedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], ProductReviewType.prototype, "moderatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductReviewType.prototype, "helpfulCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProductReviewType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProductReviewType.prototype, "updatedAt", void 0);
exports.ProductReviewType = ProductReviewType = __decorate([
    (0, graphql_1.ObjectType)()
], ProductReviewType);
let RatingDistributionType = class RatingDistributionType {
};
exports.RatingDistributionType = RatingDistributionType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingDistributionType.prototype, "rating5", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingDistributionType.prototype, "rating4", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingDistributionType.prototype, "rating3", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingDistributionType.prototype, "rating2", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingDistributionType.prototype, "rating1", void 0);
exports.RatingDistributionType = RatingDistributionType = __decorate([
    (0, graphql_1.ObjectType)()
], RatingDistributionType);
let ProductRatingSummaryType = class ProductRatingSummaryType {
};
exports.ProductRatingSummaryType = ProductRatingSummaryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductRatingSummaryType.prototype, "averageRating", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductRatingSummaryType.prototype, "totalReviews", void 0);
__decorate([
    (0, graphql_1.Field)(() => RatingDistributionType),
    __metadata("design:type", RatingDistributionType)
], ProductRatingSummaryType.prototype, "ratingDistribution", void 0);
exports.ProductRatingSummaryType = ProductRatingSummaryType = __decorate([
    (0, graphql_1.ObjectType)()
], ProductRatingSummaryType);
let ReviewsResponse = class ReviewsResponse {
};
exports.ReviewsResponse = ReviewsResponse;
__decorate([
    (0, graphql_1.Field)(() => [ProductReviewType]),
    __metadata("design:type", Array)
], ReviewsResponse.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsResponse.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsResponse.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsResponse.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ReviewsResponse.prototype, "hasMore", void 0);
exports.ReviewsResponse = ReviewsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewsResponse);
let CanReviewResponse = class CanReviewResponse {
};
exports.CanReviewResponse = CanReviewResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CanReviewResponse.prototype, "canReview", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CanReviewResponse.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CanReviewResponse.prototype, "isVerifiedPurchase", void 0);
exports.CanReviewResponse = CanReviewResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CanReviewResponse);
let ReviewResponse = class ReviewResponse {
};
exports.ReviewResponse = ReviewResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ReviewResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ReviewResponse.prototype, "helpfulCount", void 0);
exports.ReviewResponse = ReviewResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewResponse);
let CreateReviewInput = class CreateReviewInput {
};
exports.CreateReviewInput = CreateReviewInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateReviewInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "comment", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateReviewInput.prototype, "images", void 0);
exports.CreateReviewInput = CreateReviewInput = __decorate([
    (0, graphql_1.InputType)()
], CreateReviewInput);
let UpdateReviewInput = class UpdateReviewInput {
};
exports.UpdateReviewInput = UpdateReviewInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateReviewInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateReviewInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateReviewInput.prototype, "comment", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateReviewInput.prototype, "images", void 0);
exports.UpdateReviewInput = UpdateReviewInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateReviewInput);
let GetReviewsInput = class GetReviewsInput {
};
exports.GetReviewsInput = GetReviewsInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], GetReviewsInput.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 1 }),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'createdAt' }),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'desc' }),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "sortOrder", void 0);
exports.GetReviewsInput = GetReviewsInput = __decorate([
    (0, graphql_1.InputType)()
], GetReviewsInput);
let ReviewHelpfulInput = class ReviewHelpfulInput {
};
exports.ReviewHelpfulInput = ReviewHelpfulInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReviewHelpfulInput.prototype, "reviewId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ReviewHelpfulInput.prototype, "helpful", void 0);
exports.ReviewHelpfulInput = ReviewHelpfulInput = __decorate([
    (0, graphql_1.InputType)()
], ReviewHelpfulInput);
//# sourceMappingURL=review.type.js.map