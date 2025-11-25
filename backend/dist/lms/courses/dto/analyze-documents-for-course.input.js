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
exports.AnalyzeDocumentsForCourseInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let AnalyzeDocumentsForCourseInput = class AnalyzeDocumentsForCourseInput {
};
exports.AnalyzeDocumentsForCourseInput = AnalyzeDocumentsForCourseInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { description: 'Array of source document IDs to analyze' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one document ID is required' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'documentIds cannot be empty' }),
    __metadata("design:type", Array)
], AnalyzeDocumentsForCourseInput.prototype, "documentIds", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Optional additional context for AI analysis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeDocumentsForCourseInput.prototype, "additionalContext", void 0);
exports.AnalyzeDocumentsForCourseInput = AnalyzeDocumentsForCourseInput = __decorate([
    (0, graphql_1.InputType)()
], AnalyzeDocumentsForCourseInput);
//# sourceMappingURL=analyze-documents-for-course.input.js.map