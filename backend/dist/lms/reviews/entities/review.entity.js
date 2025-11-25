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
exports.ReviewsWithStats = exports.ReviewStats = exports.Review = exports.ReviewUser = void 0;
const graphql_1 = require("@nestjs/graphql");
let ReviewUser = class ReviewUser {
};
exports.ReviewUser = ReviewUser;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ReviewUser.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewUser.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUser.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUser.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewUser.prototype, "avatar", void 0);
exports.ReviewUser = ReviewUser = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewUser);
let Review = class Review {
};
exports.Review = Review;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Review.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Review.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Rating from 1 to 5 stars' }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "helpfulCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    __metadata("design:type", Array)
], Review.prototype, "helpfulVoters", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReviewUser, { nullable: true }),
    __metadata("design:type", ReviewUser)
], Review.prototype, "user", void 0);
exports.Review = Review = __decorate([
    (0, graphql_1.ObjectType)()
], Review);
let ReviewStats = class ReviewStats {
};
exports.ReviewStats = ReviewStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ReviewStats.prototype, "avgRating", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "totalReviews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "fiveStars", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "fourStars", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "threeStars", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "twoStars", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewStats.prototype, "oneStar", void 0);
exports.ReviewStats = ReviewStats = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewStats);
let ReviewsWithStats = class ReviewsWithStats {
};
exports.ReviewsWithStats = ReviewsWithStats;
__decorate([
    (0, graphql_1.Field)(() => [Review]),
    __metadata("design:type", Array)
], ReviewsWithStats.prototype, "reviews", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReviewStats),
    __metadata("design:type", ReviewStats)
], ReviewsWithStats.prototype, "stats", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsWithStats.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsWithStats.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReviewsWithStats.prototype, "pageSize", void 0);
exports.ReviewsWithStats = ReviewsWithStats = __decorate([
    (0, graphql_1.ObjectType)()
], ReviewsWithStats);
//# sourceMappingURL=review.entity.js.map