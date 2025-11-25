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
exports.TestAIProviderInput = exports.UpdateAIProviderInput = exports.CreateAIProviderInput = exports.AIProviderType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var AIProviderType;
(function (AIProviderType) {
    AIProviderType["CHATGPT"] = "CHATGPT";
    AIProviderType["GROK"] = "GROK";
    AIProviderType["GEMINI"] = "GEMINI";
})(AIProviderType || (exports.AIProviderType = AIProviderType = {}));
(0, graphql_1.registerEnumType)(AIProviderType, {
    name: 'AIProviderType',
    description: 'AI Provider types: ChatGPT, Grok, Gemini',
});
let CreateAIProviderInput = class CreateAIProviderInput {
};
exports.CreateAIProviderInput = CreateAIProviderInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(AIProviderType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true, defaultValue: 0.7 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAIProviderInput.prototype, "temperature", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 2000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(8000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAIProviderInput.prototype, "maxTokens", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "systemPrompt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAIProviderInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAIProviderInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAIProviderInput.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAIProviderInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAIProviderInput.prototype, "tags", void 0);
exports.CreateAIProviderInput = CreateAIProviderInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAIProviderInput);
let UpdateAIProviderInput = class UpdateAIProviderInput {
};
exports.UpdateAIProviderInput = UpdateAIProviderInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAIProviderInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAIProviderInput.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAIProviderInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAIProviderInput.prototype, "temperature", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(8000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAIProviderInput.prototype, "maxTokens", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAIProviderInput.prototype, "systemPrompt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAIProviderInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAIProviderInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAIProviderInput.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAIProviderInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateAIProviderInput.prototype, "tags", void 0);
exports.UpdateAIProviderInput = UpdateAIProviderInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateAIProviderInput);
let TestAIProviderInput = class TestAIProviderInput {
};
exports.TestAIProviderInput = TestAIProviderInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestAIProviderInput.prototype, "providerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'Hello, how are you?' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestAIProviderInput.prototype, "testMessage", void 0);
exports.TestAIProviderInput = TestAIProviderInput = __decorate([
    (0, graphql_1.InputType)()
], TestAIProviderInput);
//# sourceMappingURL=ai-provider.input.js.map