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
exports.ReorderLessonsInput = exports.UpdateLessonInput = exports.CreateLessonInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let CreateLessonInput = class CreateLessonInput {
};
exports.CreateLessonInput = CreateLessonInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(client_1.LessonType, { message: 'Type must be VIDEO, TEXT, or QUIZ' }),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLessonInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Module ID is required' }),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "moduleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLessonInput.prototype, "order", void 0);
exports.CreateLessonInput = CreateLessonInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLessonInput);
let UpdateLessonInput = class UpdateLessonInput {
};
exports.UpdateLessonInput = UpdateLessonInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Lesson ID is required' }),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LessonType, { message: 'Type must be VIDEO, TEXT, or QUIZ' }),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateLessonInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLessonInput.prototype, "order", void 0);
exports.UpdateLessonInput = UpdateLessonInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLessonInput);
let ReorderLessonsInput = class ReorderLessonsInput {
};
exports.ReorderLessonsInput = ReorderLessonsInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Module ID is required' }),
    __metadata("design:type", String)
], ReorderLessonsInput.prototype, "moduleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsNotEmpty)({ message: 'Lesson order is required' }),
    __metadata("design:type", Array)
], ReorderLessonsInput.prototype, "lessonIds", void 0);
exports.ReorderLessonsInput = ReorderLessonsInput = __decorate([
    (0, graphql_1.InputType)()
], ReorderLessonsInput);
//# sourceMappingURL=lesson.input.js.map