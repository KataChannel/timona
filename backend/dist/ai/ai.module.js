"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const feature_extraction_service_1 = require("./services/feature-extraction.service");
const task_prioritization_service_1 = require("./services/task-prioritization.service");
const intelligent_suggestions_service_1 = require("./services/intelligent-suggestions.service");
const gemini_service_1 = require("./gemini.service");
const ai_controller_1 = require("./ai.controller");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [ai_controller_1.AiController],
        providers: [
            feature_extraction_service_1.FeatureExtractionService,
            task_prioritization_service_1.TaskPrioritizationService,
            intelligent_suggestions_service_1.IntelligentSuggestionsService,
            gemini_service_1.GeminiService,
        ],
        exports: [
            feature_extraction_service_1.FeatureExtractionService,
            task_prioritization_service_1.TaskPrioritizationService,
            intelligent_suggestions_service_1.IntelligentSuggestionsService,
            gemini_service_1.GeminiService,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map