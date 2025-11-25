import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRoleType } from '@prisma/client';

import { AIProviderService } from '../services/ai-provider.service';
import { AIResponseService } from '../services/ai-response.service';
import { CreateAIProviderInput, UpdateAIProviderInput, TestAIProviderInput, AIProviderType } from '../dto/ai-provider.input';
import { AIProvider, AIProviderTestResult, AIProviderStats } from '../entities/ai-provider.entity';

@Resolver(() => AIProvider)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIProviderResolver {
  constructor(
    private aiProviderService: AIProviderService,
    private aiResponseService: AIResponseService,
  ) {}

  @Query(() => [AIProvider], { name: 'getAIProviders', description: 'Lấy danh sách tất cả AI providers' })
  @Roles(UserRoleType.ADMIN)
  async getAIProviders(): Promise<AIProvider[]> {
    return this.aiProviderService.getAllProviders();
  }

  @Query(() => AIProvider, { name: 'getAIProvider', description: 'Lấy AI provider theo ID', nullable: true })
  @Roles(UserRoleType.ADMIN)
  async getAIProvider(@Args('id') id: string): Promise<AIProvider> {
    return this.aiProviderService.getProviderById(id);
  }

  @Query(() => AIProvider, { name: 'getActiveAIProvider', description: 'Lấy AI provider đang active', nullable: true })
  @Roles(UserRoleType.ADMIN)
  async getActiveAIProvider(
    @Args('providerType', { type: () => AIProviderType, nullable: true }) providerType?: AIProviderType,
  ): Promise<AIProvider | null> {
    return this.aiProviderService.getActiveProvider(providerType);
  }

  @Query(() => AIProviderStats, { name: 'getAIProviderStats', description: 'Lấy thống kê AI providers' })
  @Roles(UserRoleType.ADMIN)
  async getAIProviderStats(): Promise<AIProviderStats> {
    return this.aiProviderService.getStats();
  }

  @Mutation(() => AIProvider, { name: 'createAIProvider', description: 'Tạo AI provider mới' })
  @Roles(UserRoleType.ADMIN)
  async createAIProvider(
    @Args('input') input: CreateAIProviderInput,
    @CurrentUser() user: any,
  ): Promise<AIProvider> {
    return this.aiProviderService.createProvider(input, user.id);
  }

  @Mutation(() => AIProvider, { name: 'updateAIProvider', description: 'Cập nhật AI provider' })
  @Roles(UserRoleType.ADMIN)
  async updateAIProvider(
    @Args('id') id: string,
    @Args('input') input: UpdateAIProviderInput,
  ): Promise<AIProvider> {
    return this.aiProviderService.updateProvider(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteAIProvider', description: 'Xóa AI provider' })
  @Roles(UserRoleType.ADMIN)
  async deleteAIProvider(@Args('id') id: string): Promise<boolean> {
    return this.aiProviderService.deleteProvider(id);
  }

  @Mutation(() => AIProviderTestResult, { name: 'testAIProvider', description: 'Test kết nối AI provider' })
  @Roles(UserRoleType.ADMIN)
  async testAIProvider(@Args('input') input: TestAIProviderInput): Promise<AIProviderTestResult> {
    return this.aiResponseService.testProvider(input.providerId, input.testMessage);
  }

  @Mutation(() => AIProvider, { name: 'setDefaultAIProvider', description: 'Đặt AI provider làm mặc định' })
  @Roles(UserRoleType.ADMIN)
  async setDefaultAIProvider(@Args('id') id: string): Promise<AIProvider> {
    return this.aiProviderService.updateProvider(id, { isDefault: true });
  }

  @Mutation(() => AIProvider, { name: 'toggleAIProviderStatus', description: 'Bật/tắt AI provider' })
  @Roles(UserRoleType.ADMIN)
  async toggleAIProviderStatus(
    @Args('id') id: string,
    @Args('isActive') isActive: boolean,
  ): Promise<AIProvider> {
    return this.aiProviderService.updateProvider(id, { isActive });
  }
}
