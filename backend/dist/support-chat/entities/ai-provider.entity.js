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
exports.AIProviderStats = exports.AIProviderTestResult = exports.AIProvider = void 0;
const graphql_1 = require("@nestjs/graphql");
const ai_provider_input_1 = require("../dto/ai-provider.input");
const user_model_1 = require("../../graphql/models/user.model");
let AIProvider = class AIProvider {
};
exports.AIProvider = AIProvider;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AIProvider.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => ai_provider_input_1.AIProviderType),
    __metadata("design:type", String)
], AIProvider.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AIProvider.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AIProvider.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AIProvider.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AIProvider.prototype, "temperature", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProvider.prototype, "maxTokens", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProvider.prototype, "systemPrompt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AIProvider.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProvider.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AIProvider.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProvider.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AIProvider.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProvider.prototype, "totalRequests", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProvider.prototype, "successCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProvider.prototype, "failureCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AIProvider.prototype, "avgResponseTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AIProvider.prototype, "lastUsedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProvider.prototype, "lastError", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AIProvider.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AIProvider.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProvider.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], AIProvider.prototype, "creator", void 0);
exports.AIProvider = AIProvider = __decorate([
    (0, graphql_1.ObjectType)()
], AIProvider);
let AIProviderTestResult = class AIProviderTestResult {
};
exports.AIProviderTestResult = AIProviderTestResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AIProviderTestResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProviderTestResult.prototype, "response", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AIProviderTestResult.prototype, "error", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AIProviderTestResult.prototype, "responseTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProviderTestResult.prototype, "tokensUsed", void 0);
exports.AIProviderTestResult = AIProviderTestResult = __decorate([
    (0, graphql_1.ObjectType)()
], AIProviderTestResult);
let AIProviderStats = class AIProviderStats {
};
exports.AIProviderStats = AIProviderStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProviderStats.prototype, "totalProviders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProviderStats.prototype, "activeProviders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AIProviderStats.prototype, "totalRequests", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AIProviderStats.prototype, "successRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AIProviderStats.prototype, "avgResponseTime", void 0);
exports.AIProviderStats = AIProviderStats = __decorate([
    (0, graphql_1.ObjectType)()
], AIProviderStats);
//# sourceMappingURL=ai-provider.entity.js.map