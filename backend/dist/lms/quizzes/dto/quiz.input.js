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
exports.SubmitQuizInput = exports.QuizAnswerInput = exports.UpdateQuizInput = exports.CreateQuizInput = exports.CreateQuestionInput = exports.CreateAnswerInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
let CreateAnswerInput = class CreateAnswerInput {
};
exports.CreateAnswerInput = CreateAnswerInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAnswerInput.prototype, "text", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CreateAnswerInput.prototype, "isCorrect", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAnswerInput.prototype, "order", void 0);
exports.CreateAnswerInput = CreateAnswerInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAnswerInput);
let CreateQuestionInput = class CreateQuestionInput {
};
exports.CreateQuestionInput = CreateQuestionInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "question", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuestionInput.prototype, "points", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateQuestionInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CreateAnswerInput]),
    __metadata("design:type", Array)
], CreateQuestionInput.prototype, "answers", void 0);
exports.CreateQuestionInput = CreateQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateQuestionInput);
let CreateQuizInput = class CreateQuizInput {
};
exports.CreateQuizInput = CreateQuizInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuizInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuizInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuizInput.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 70 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateQuizInput.prototype, "passingScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuizInput.prototype, "timeLimit", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CreateQuestionInput]),
    __metadata("design:type", Array)
], CreateQuizInput.prototype, "questions", void 0);
exports.CreateQuizInput = CreateQuizInput = __decorate([
    (0, graphql_1.InputType)()
], CreateQuizInput);
let UpdateQuizInput = class UpdateQuizInput {
};
exports.UpdateQuizInput = UpdateQuizInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateQuizInput.prototype, "passingScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateQuizInput.prototype, "timeLimit", void 0);
exports.UpdateQuizInput = UpdateQuizInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateQuizInput);
let QuizAnswerInput = class QuizAnswerInput {
};
exports.QuizAnswerInput = QuizAnswerInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuizAnswerInput.prototype, "questionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], QuizAnswerInput.prototype, "selectedAnswerIds", void 0);
exports.QuizAnswerInput = QuizAnswerInput = __decorate([
    (0, graphql_1.InputType)()
], QuizAnswerInput);
let SubmitQuizInput = class SubmitQuizInput {
};
exports.SubmitQuizInput = SubmitQuizInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitQuizInput.prototype, "quizId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitQuizInput.prototype, "enrollmentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [QuizAnswerInput]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    __metadata("design:type", Array)
], SubmitQuizInput.prototype, "answers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SubmitQuizInput.prototype, "timeSpent", void 0);
exports.SubmitQuizInput = SubmitQuizInput = __decorate([
    (0, graphql_1.InputType)()
], SubmitQuizInput);
//# sourceMappingURL=quiz.input.js.map