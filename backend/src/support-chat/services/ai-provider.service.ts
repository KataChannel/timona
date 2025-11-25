import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAIProviderInput, UpdateAIProviderInput, AIProviderType } from '../dto/ai-provider.input';
import { AIProvider, AIProviderStats } from '../entities/ai-provider.entity';

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Tạo AI Provider mới
   */
  async createProvider(input: CreateAIProviderInput, userId?: string): Promise<AIProvider> {
    try {
      // Nếu isDefault = true, set tất cả providers khác thành false
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
          apiKey: input.apiKey, // TODO: Encrypt API key
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
      return provider as AIProvider;
    } catch (error) {
      this.logger.error(`Failed to create AI provider: ${error.message}`);
      throw new BadRequestException(`Failed to create AI provider: ${error.message}`);
    }
  }

  /**
   * Cập nhật AI Provider
   */
  async updateProvider(id: string, input: UpdateAIProviderInput): Promise<AIProvider> {
    const existing = await this.prisma.aIProvider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`AI Provider with ID ${id} not found`);
    }

    // Nếu isDefault = true, set tất cả providers khác thành false
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
          ...(input.apiKey && { apiKey: input.apiKey }), // TODO: Encrypt
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
      return provider as AIProvider;
    } catch (error) {
      this.logger.error(`Failed to update AI provider: ${error.message}`);
      throw new BadRequestException(`Failed to update AI provider: ${error.message}`);
    }
  }

  /**
   * Xóa AI Provider
   */
  async deleteProvider(id: string): Promise<boolean> {
    const existing = await this.prisma.aIProvider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`AI Provider with ID ${id} not found`);
    }

    try {
      await this.prisma.aIProvider.delete({ where: { id } });
      this.logger.log(`AI Provider deleted: ${existing.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete AI provider: ${error.message}`);
      throw new BadRequestException(`Failed to delete AI provider: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả AI Providers
   */
  async getAllProviders(): Promise<AIProvider[]> {
    const providers = await this.prisma.aIProvider.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        creator: true,
      },
    });

    // Mask API keys
    return providers.map(p => ({
      ...p,
      apiKey: this.maskApiKey(p.apiKey),
    })) as AIProvider[];
  }

  /**
   * Lấy AI Provider theo ID
   */
  async getProviderById(id: string): Promise<AIProvider> {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!provider) {
      throw new NotFoundException(`AI Provider with ID ${id} not found`);
    }

    return {
      ...provider,
      apiKey: this.maskApiKey(provider.apiKey),
    } as AIProvider;
  }

  /**
   * Lấy provider đang active theo priority cao nhất
   */
  async getActiveProvider(providerType?: AIProviderType): Promise<AIProvider | null> {
    const where: any = { isActive: true };
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

    return provider as AIProvider | null;
  }

  /**
   * Lấy default provider theo type
   */
  async getDefaultProvider(providerType: AIProviderType): Promise<AIProvider | null> {
    const provider = await this.prisma.aIProvider.findFirst({
      where: {
        provider: providerType,
        isDefault: true,
      },
      include: {
        creator: true,
      },
    });

    return provider as AIProvider | null;
  }

  /**
   * Update stats sau khi sử dụng provider
   */
  async updateStats(
    id: string,
    success: boolean,
    responseTime: number,
    error?: string,
  ): Promise<void> {
    try {
      const provider = await this.prisma.aIProvider.findUnique({ where: { id } });
      if (!provider) return;

      const totalRequests = provider.totalRequests + 1;
      const successCount = success ? provider.successCount + 1 : provider.successCount;
      const failureCount = success ? provider.failureCount : provider.failureCount + 1;

      // Calculate new average response time
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
    } catch (err) {
      this.logger.error(`Failed to update provider stats: ${err.message}`);
    }
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getStats(): Promise<AIProviderStats> {
    const providers = await this.prisma.aIProvider.findMany();
    const activeProviders = providers.filter(p => p.isActive);

    const totalRequests = providers.reduce((sum, p) => sum + p.totalRequests, 0);
    const totalSuccess = providers.reduce((sum, p) => sum + p.successCount, 0);
    const avgResponseTimes = providers
      .filter(p => p.avgResponseTime !== null)
      .map(p => p.avgResponseTime);
    const avgResponseTime =
      avgResponseTimes.length > 0
        ? avgResponseTimes.reduce((sum, t) => sum + t!, 0) / avgResponseTimes.length
        : 0;

    return {
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
      totalRequests,
      successRate: totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0,
      avgResponseTime,
    };
  }

  /**
   * Mask API key cho security
   */
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '****';
    return `${apiKey.substring(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
  }
}
