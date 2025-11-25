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
var AIProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AIProviderService = AIProviderService_1 = class AIProviderService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AIProviderService_1.name);
    }
    async createProvider(input, userId) {
        try {
            if (input.isDefault) {
                await this.prisma.aIProvider.updateMany({
                    where: { provider: input.provider },
                    data: { isDefault: false },
                });
            }
            const provider = await this.prisma.aIProvider.create({
                data: {
                    provider: input.provider,
                    name: input.name,
                    apiKey: input.apiKey,
                    model: input.model,
                    temperature: input.temperature ?? 0.7,
                    maxTokens: input.maxTokens ?? 2000,
                    systemPrompt: input.systemPrompt,
                    isActive: input.isActive ?? false,
                    priority: input.priority ?? 0,
                    isDefault: input.isDefault ?? false,
                    description: input.description,
                    tags: input.tags || [],
                    createdBy: userId,
                },
                include: {
                    creator: true,
                },
            });
            this.logger.log(`AI Provider created: ${provider.name} (${provider.provider})`);
            return provider;
        }
        catch (error) {
            this.logger.error(`Failed to create AI provider: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create AI provider: ${error.message}`);
        }
    }
    async updateProvider(id, input) {
        const existing = await this.prisma.aIProvider.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`AI Provider with ID ${id} not found`);
        }
        if (input.isDefault === true) {
            await this.prisma.aIProvider.updateMany({
                where: { provider: existing.provider, id: { not: id } },
                data: { isDefault: false },
            });
        }
        try {
            const provider = await this.prisma.aIProvider.update({
                where: { id },
                data: {
                    ...(input.name && { name: input.name }),
                    ...(input.apiKey && { apiKey: input.apiKey }),
                    ...(input.model && { model: input.model }),
                    ...(input.temperature !== undefined && { temperature: input.temperature }),
                    ...(input.maxTokens !== undefined && { maxTokens: input.maxTokens }),
                    ...(input.systemPrompt !== undefined && { systemPrompt: input.systemPrompt }),
                    ...(input.isActive !== undefined && { isActive: input.isActive }),
                    ...(input.priority !== undefined && { priority: input.priority }),
                    ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
                    ...(input.description !== undefined && { description: input.description }),
                    ...(input.tags !== undefined && { tags: input.tags }),
                },
                include: {
                    creator: true,
                },
            });
            this.logger.log(`AI Provider updated: ${provider.name}`);
            return provider;
        }
        catch (error) {
            this.logger.error(`Failed to update AI provider: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update AI provider: ${error.message}`);
        }
    }
    async deleteProvider(id) {
        const existing = await this.prisma.aIProvider.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`AI Provider with ID ${id} not found`);
        }
        try {
            await this.prisma.aIProvider.delete({ where: { id } });
            this.logger.log(`AI Provider deleted: ${existing.name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete AI provider: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete AI provider: ${error.message}`);
        }
    }
    async getAllProviders() {
        const providers = await this.prisma.aIProvider.findMany({
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            include: {
                creator: true,
            },
        });
        return providers.map(p => ({
            ...p,
            apiKey: this.maskApiKey(p.apiKey),
        }));
    }
    async getProviderById(id) {
        const provider = await this.prisma.aIProvider.findUnique({
            where: { id },
            include: {
                creator: true,
            },
        });
        if (!provider) {
            throw new common_1.NotFoundException(`AI Provider with ID ${id} not found`);
        }
        return {
            ...provider,
            apiKey: this.maskApiKey(provider.apiKey),
        };
    }
    async getActiveProvider(providerType) {
        const where = { isActive: true };
        if (providerType) {
            where.provider = providerType;
        }
        const provider = await this.prisma.aIProvider.findFirst({
            where,
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            include: {
                creator: true,
            },
        });
        return provider;
    }
    async getDefaultProvider(providerType) {
        const provider = await this.prisma.aIProvider.findFirst({
            where: {
                provider: providerType,
                isDefault: true,
            },
            include: {
                creator: true,
            },
        });
        return provider;
    }
    async updateStats(id, success, responseTime, error) {
        try {
            const provider = await this.prisma.aIProvider.findUnique({ where: { id } });
            if (!provider)
                return;
            const totalRequests = provider.totalRequests + 1;
            const successCount = success ? provider.successCount + 1 : provider.successCount;
            const failureCount = success ? provider.failureCount : provider.failureCount + 1;
            const currentAvg = provider.avgResponseTime || 0;
            const newAvg = (currentAvg * provider.totalRequests + responseTime) / totalRequests;
            await this.prisma.aIProvider.update({
                where: { id },
                data: {
                    totalRequests,
                    successCount,
                    failureCount,
                    avgResponseTime: newAvg,
                    lastUsedAt: new Date(),
                    ...(error && { lastError: error }),
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to update provider stats: ${err.message}`);
        }
    }
    async getStats() {
        const providers = await this.prisma.aIProvider.findMany();
        const activeProviders = providers.filter(p => p.isActive);
        const totalRequests = providers.reduce((sum, p) => sum + p.totalRequests, 0);
        const totalSuccess = providers.reduce((sum, p) => sum + p.successCount, 0);
        const avgResponseTimes = providers
            .filter(p => p.avgResponseTime !== null)
            .map(p => p.avgResponseTime);
        const avgResponseTime = avgResponseTimes.length > 0
            ? avgResponseTimes.reduce((sum, t) => sum + t, 0) / avgResponseTimes.length
            : 0;
        return {
            totalProviders: providers.length,
            activeProviders: activeProviders.length,
            totalRequests,
            successRate: totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0,
            avgResponseTime,
        };
    }
    maskApiKey(apiKey) {
        if (!apiKey || apiKey.length < 8)
            return '****';
        return `${apiKey.substring(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
    }
};
exports.AIProviderService = AIProviderService;
exports.AIProviderService = AIProviderService = AIProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIProviderService);
//# sourceMappingURL=ai-provider.service.js.map