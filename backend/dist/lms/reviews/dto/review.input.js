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
exports.GetReviewsInput = exports.UpdateReviewInput = exports.CreateReviewInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateReviewInput = class CreateReviewInput {
};
exports.CreateReviewInput = CreateReviewInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Course ID is required' }),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsInt)({ message: 'Rating must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Rating must be at least 1' }),
    (0, class_validator_1.Max)(5, { message: 'Rating must be at most 5' }),
    __metadata("design:type", Number)
], CreateReviewInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Comment must not exceed 1000 characters' }),
    __metadata("design:type", String)
], CreateReviewInput.prototype, "comment", void 0);
exports.CreateReviewInput = CreateReviewInput = __decorate([
    (0, graphql_1.InputType)()
], CreateReviewInput);
let UpdateReviewInput = class UpdateReviewInput {
};
exports.UpdateReviewInput = UpdateReviewInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Review ID is required' }),
    __metadata("design:type", String)
], UpdateReviewInput.prototype, "reviewId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Rating must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Rating must be at least 1' }),
    (0, class_validator_1.Max)(5, { message: 'Rating must be at most 5' }),
    __metadata("design:type", Number)
], UpdateReviewInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Comment must not exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateReviewInput.prototype, "comment", void 0);
exports.UpdateReviewInput = UpdateReviewInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateReviewInput);
let GetReviewsInput = class GetReviewsInput {
    constructor() {
        this.page = 1;
        this.pageSize = 10;
        this.sortBy = 'recent';
    }
};
exports.GetReviewsInput = GetReviewsInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Course ID is required' }),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, defaultValue: 'recent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetReviewsInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], GetReviewsInput.prototype, "filterByRating", void 0);
exports.GetReviewsInput = GetReviewsInput = __decorate([
    (0, graphql_1.InputType)()
], GetReviewsInput);
//# sourceMappingURL=review.input.js.map