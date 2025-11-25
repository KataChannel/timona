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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseAnalysisResult = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let CourseAnalysisResult = class CourseAnalysisResult {
};
exports.CourseAnalysisResult = CourseAnalysisResult;
__decorate([
    (0, graphql_1.Field)({ description: 'AI-generated course title suggestion' }),
    __metadata("design:type", String)
], CourseAnalysisResult.prototype, "suggestedTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ description: 'AI-generated course description' }),
    __metadata("design:type", String)
], CourseAnalysisResult.prototype, "suggestedDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ description: 'Recommended difficulty level' }),
    __metadata("design:type", String)
], CourseAnalysisResult.prototype, "recommendedLevel", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Aggregated keywords from documents' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "aggregatedKeywords", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Main topics identified' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "mainTopics", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Learning objectives based on content' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "learningObjectives", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'What students will learn' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "whatYouWillLearn", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Prerequisites and requirements' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "requirements", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Target audience' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "targetAudience", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { description: 'Suggested course structure (modules outline)' }),
    __metadata("design:type", Object)
], CourseAnalysisResult.prototype, "suggestedStructure", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Estimated duration in minutes' }),
    __metadata("design:type", Number)
], CourseAnalysisResult.prototype, "estimatedDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { description: 'Document IDs used for analysis' }),
    __metadata("design:type", Array)
], CourseAnalysisResult.prototype, "sourceDocumentIds", void 0);
__decorate([
    (0, graphql_1.Field)({ description: 'Summary of the analysis' }),
    __metadata("design:type", String)
], CourseAnalysisResult.prototype, "analysisSummary", void 0);
exports.CourseAnalysisResult = CourseAnalysisResult = __decorate([
    (0, graphql_1.ObjectType)()
], CourseAnalysisResult);
//# sourceMappingURL=course-analysis-result.entity.js.map