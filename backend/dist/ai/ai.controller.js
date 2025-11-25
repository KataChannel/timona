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
exports.AiController = exports.GenerateTasksDto = exports.AnalyzeContentDto = exports.PredictPriorityDto = void 0;
const common_1 = require("@nestjs/common");
const task_prioritization_service_1 = require("./services/task-prioritization.service");
const intelligent_suggestions_service_1 = require("./services/intelligent-suggestions.service");
class PredictPriorityDto {
}
exports.PredictPriorityDto = PredictPriorityDto;
class AnalyzeContentDto {
}
exports.AnalyzeContentDto = AnalyzeContentDto;
class GenerateTasksDto {
}
exports.GenerateTasksDto = GenerateTasksDto;
let AiController = class AiController {
    constructor(taskPrioritization, intelligentSuggestions) {
        this.taskPrioritization = taskPrioritization;
        this.intelligentSuggestions = intelligentSuggestions;
    }
    async predictTaskPriority(userId, taskData) {
        const task = {
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
        };
        return await this.taskPrioritization.predictTaskPriority(task, userId);
    }
    async analyzeWorkload(userId) {
        return await this.taskPrioritization.analyzeWorkload(userId);
    }
    async generateSmartSuggestions(userId) {
        return await this.intelligentSuggestions.generateSmartSuggestions(userId);
    }
    async analyzeContent(userId, data) {
        return await this.intelligentSuggestions.analyzeContent(data.content, userId);
    }
    async generateTasksFromNotes(userId, data) {
        return await this.intelligentSuggestions.generateTasksFromNotes(data.notes, userId);
    }
    async getAiInsights(userId) {
        const [workloadAnalysis, smartSuggestions] = await Promise.all([
            this.taskPrioritization.analyzeWorkload(userId),
            this.intelligentSuggestions.generateSmartSuggestions(userId)
        ]);
        const productivityScore = await this.calculateProductivityScore(userId);
        const completionRate = await this.calculateCompletionRate(userId);
        const averageTaskComplexity = await this.calculateAverageComplexity(userId);
        return {
            workloadAnalysis,
            smartSuggestions: smartSuggestions.slice(0, 5),
            productivityScore,
            completionRate,
            averageTaskComplexity
        };
    }
    async calculateProductivityScore(userId) {
        return Math.floor(Math.random() * 40) + 60;
    }
    async calculateCompletionRate(userId) {
        return Math.floor(Math.random() * 30) + 70;
    }
    async calculateAverageComplexity(userId) {
        return Math.floor(Math.random() * 4) + 4;
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('predict-priority/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PredictPriorityDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "predictTaskPriority", null);
__decorate([
    (0, common_1.Get)('workload-analysis/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeWorkload", null);
__decorate([
    (0, common_1.Get)('suggestions/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateSmartSuggestions", null);
__decorate([
    (0, common_1.Post)('analyze-content/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AnalyzeContentDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeContent", null);
__decorate([
    (0, common_1.Post)('generate-tasks/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, GenerateTasksDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateTasksFromNotes", null);
__decorate([
    (0, common_1.Get)('insights/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getAiInsights", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [task_prioritization_service_1.TaskPrioritizationService,
        intelligent_suggestions_service_1.IntelligentSuggestionsService])
], AiController);
//# sourceMappingURL=ai.controller.js.map