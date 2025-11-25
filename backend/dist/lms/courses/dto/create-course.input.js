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
exports.CreateCourseInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let CreateCourseInput = class CreateCourseInput {
    constructor() {
        this.price = 0;
        this.level = client_1.CourseLevel.BEGINNER;
        this.status = client_1.CourseStatus.DRAFT;
        this.tags = [];
        this.whatYouWillLearn = [];
        this.requirements = [];
        this.targetAudience = [];
    }
};
exports.CreateCourseInput = CreateCourseInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "trailer", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCourseInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.CourseLevel, { defaultValue: client_1.CourseLevel.BEGINNER }),
    (0, class_validator_1.IsEnum)(client_1.CourseLevel),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.CourseStatus, { defaultValue: client_1.CourseStatus.DRAFT }),
    (0, class_validator_1.IsEnum)(client_1.CourseStatus),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCourseInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseInput.prototype, "whatYouWillLearn", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseInput.prototype, "requirements", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCourseInput.prototype, "targetAudience", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "categoryId", void 0);
exports.CreateCourseInput = CreateCourseInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCourseInput);
//# sourceMappingURL=create-course.input.js.map