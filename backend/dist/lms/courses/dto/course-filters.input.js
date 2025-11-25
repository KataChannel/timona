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
exports.CourseFiltersInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let CourseFiltersInput = class CourseFiltersInput {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
};
exports.CourseFiltersInput = CourseFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.CourseLevel, { nullable: true }),
    (0, class_validator_1.IsEnum)(client_1.CourseLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.CourseStatus, { nullable: true }),
    (0, class_validator_1.IsEnum)(client_1.CourseStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CourseFiltersInput.prototype, "minPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CourseFiltersInput.prototype, "maxPrice", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "instructorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CourseFiltersInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CourseFiltersInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CourseFiltersInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'createdAt' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'desc' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseFiltersInput.prototype, "sortOrder", void 0);
exports.CourseFiltersInput = CourseFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], CourseFiltersInput);
//# sourceMappingURL=course-filters.input.js.map