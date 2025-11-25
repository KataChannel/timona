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
exports.QuizzesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const quizzes_service_1 = require("./quizzes.service");
const quiz_entity_1 = require("./entities/quiz.entity");
const quiz_input_1 = require("./dto/quiz.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let QuizzesResolver = class QuizzesResolver {
    constructor(quizzesService) {
        this.quizzesService = quizzesService;
    }
    async createQuiz(userId, createQuizInput) {
        return this.quizzesService.createQuiz(userId, createQuizInput);
    }
    async quiz(userId, id) {
        return this.quizzesService.getQuiz(id, userId);
    }
    async quizzesByLesson(lessonId) {
        return this.quizzesService.getQuizzesByLesson(lessonId);
    }
    async updateQuiz(userId, id, updateQuizInput) {
        return this.quizzesService.updateQuiz(userId, id, updateQuizInput);
    }
    async deleteQuiz(userId, id) {
        return this.quizzesService.deleteQuiz(userId, id);
    }
    async submitQuiz(userId, submitQuizInput) {
        return this.quizzesService.submitQuiz(userId, submitQuizInput);
    }
    async quizAttempts(userId, quizId) {
        return this.quizzesService.getQuizAttempts(userId, quizId);
    }
    async quizAttempt(userId, id) {
        return this.quizzesService.getQuizAttempt(userId, id);
    }
};
exports.QuizzesResolver = QuizzesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => quiz_entity_1.Quiz),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quiz_input_1.CreateQuizInput]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "createQuiz", null);
__decorate([
    (0, graphql_1.Query)(() => quiz_entity_1.Quiz),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "quiz", null);
__decorate([
    (0, graphql_1.Query)(() => [quiz_entity_1.Quiz]),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "quizzesByLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => quiz_entity_1.Quiz),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('id')),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, quiz_input_1.UpdateQuizInput]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "updateQuiz", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "deleteQuiz", null);
__decorate([
    (0, graphql_1.Mutation)(() => quiz_entity_1.QuizAttempt),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quiz_input_1.SubmitQuizInput]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "submitQuiz", null);
__decorate([
    (0, graphql_1.Query)(() => [quiz_entity_1.QuizAttempt]),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('quizId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "quizAttempts", null);
__decorate([
    (0, graphql_1.Query)(() => quiz_entity_1.QuizAttempt),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuizzesResolver.prototype, "quizAttempt", null);
exports.QuizzesResolver = QuizzesResolver = __decorate([
    (0, graphql_1.Resolver)(() => quiz_entity_1.Quiz),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService])
], QuizzesResolver);
//# sourceMappingURL=quizzes.resolver.js.map