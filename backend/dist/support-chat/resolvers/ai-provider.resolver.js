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
exports.AIProviderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const ai_provider_service_1 = require("../services/ai-provider.service");
const ai_response_service_1 = require("../services/ai-response.service");
const ai_provider_input_1 = require("../dto/ai-provider.input");
const ai_provider_entity_1 = require("../entities/ai-provider.entity");
let AIProviderResolver = class AIProviderResolver {
    constructor(aiProviderService, aiResponseService) {
        this.aiProviderService = aiProviderService;
        this.aiResponseService = aiResponseService;
    }
    async getAIProviders() {
        return this.aiProviderService.getAllProviders();
    }
    async getAIProvider(id) {
        return this.aiProviderService.getProviderById(id);
    }
    async getActiveAIProvider(providerType) {
        return this.aiProviderService.getActiveProvider(providerType);
    }
    async getAIProviderStats() {
        return this.aiProviderService.getStats();
    }
    async createAIProvider(input, user) {
        return this.aiProviderService.createProvider(input, user.id);
    }
    async updateAIProvider(id, input) {
        return this.aiProviderService.updateProvider(id, input);
    }
    async deleteAIProvider(id) {
        return this.aiProviderService.deleteProvider(id);
    }
    async testAIProvider(input) {
        return this.aiResponseService.testProvider(input.providerId, input.testMessage);
    }
    async setDefaultAIProvider(id) {
        return this.aiProviderService.updateProvider(id, { isDefault: true });
    }
    async toggleAIProviderStatus(id, isActive) {
        return this.aiProviderService.updateProvider(id, { isActive });
    }
};
exports.AIProviderResolver = AIProviderResolver;
__decorate([
    (0, graphql_1.Query)(() => [ai_provider_entity_1.AIProvider], { name: 'getAIProviders', description: 'Lấy danh sách tất cả AI providers' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "getAIProviders", null);
__decorate([
    (0, graphql_1.Query)(() => ai_provider_entity_1.AIProvider, { name: 'getAIProvider', description: 'Lấy AI provider theo ID', nullable: true }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "getAIProvider", null);
__decorate([
    (0, graphql_1.Query)(() => ai_provider_entity_1.AIProvider, { name: 'getActiveAIProvider', description: 'Lấy AI provider đang active', nullable: true }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('providerType', { type: () => ai_provider_input_1.AIProviderType, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "getActiveAIProvider", null);
__decorate([
    (0, graphql_1.Query)(() => ai_provider_entity_1.AIProviderStats, { name: 'getAIProviderStats', description: 'Lấy thống kê AI providers' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "getAIProviderStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => ai_provider_entity_1.AIProvider, { name: 'createAIProvider', description: 'Tạo AI provider mới' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_provider_input_1.CreateAIProviderInput, Object]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "createAIProvider", null);
__decorate([
    (0, graphql_1.Mutation)(() => ai_provider_entity_1.AIProvider, { name: 'updateAIProvider', description: 'Cập nhật AI provider' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_provider_input_1.UpdateAIProviderInput]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "updateAIProvider", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteAIProvider', description: 'Xóa AI provider' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "deleteAIProvider", null);
__decorate([
    (0, graphql_1.Mutation)(() => ai_provider_entity_1.AIProviderTestResult, { name: 'testAIProvider', description: 'Test kết nối AI provider' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_provider_input_1.TestAIProviderInput]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "testAIProvider", null);
__decorate([
    (0, graphql_1.Mutation)(() => ai_provider_entity_1.AIProvider, { name: 'setDefaultAIProvider', description: 'Đặt AI provider làm mặc định' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "setDefaultAIProvider", null);
__decorate([
    (0, graphql_1.Mutation)(() => ai_provider_entity_1.AIProvider, { name: 'toggleAIProviderStatus', description: 'Bật/tắt AI provider' }),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AIProviderResolver.prototype, "toggleAIProviderStatus", null);
exports.AIProviderResolver = AIProviderResolver = __decorate([
    (0, graphql_1.Resolver)(() => ai_provider_entity_1.AIProvider),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ai_provider_service_1.AIProviderService,
        ai_response_service_1.AIResponseService])
], AIProviderResolver);
//# sourceMappingURL=ai-provider.resolver.js.map