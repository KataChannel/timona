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
exports.GenerateCourseFromDocumentsInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let GenerateCourseFromDocumentsInput = class GenerateCourseFromDocumentsInput {
};
exports.GenerateCourseFromDocumentsInput = GenerateCourseFromDocumentsInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { description: 'Array of source document IDs to analyze' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one document ID is required' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'documentIds cannot be empty' }),
    __metadata("design:type", Array)
], GenerateCourseFromDocumentsInput.prototype, "documentIds", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Optional category for the generated course' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Optional additional instructions for AI' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "additionalPrompt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Course title (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Course description (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Course level (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true, description: 'Learning objectives (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateCourseFromDocumentsInput.prototype, "learningObjectives", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true, description: 'What you will learn (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateCourseFromDocumentsInput.prototype, "whatYouWillLearn", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true, description: 'Requirements (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateCourseFromDocumentsInput.prototype, "requirements", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true, description: 'Target audience (user can edit AI suggestion)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateCourseFromDocumentsInput.prototype, "targetAudience", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Additional context for generation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCourseFromDocumentsInput.prototype, "additionalContext", void 0);
exports.GenerateCourseFromDocumentsInput = GenerateCourseFromDocumentsInput = __decorate([
    (0, graphql_1.InputType)()
], GenerateCourseFromDocumentsInput);
//# sourceMappingURL=generate-course-from-documents.input.js.map