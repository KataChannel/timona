import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CustomTemplate, TemplateShare } from '../models/custom-template.model';
import { User } from '../models/user.model';
import { TemplateCategory } from '@prisma/client';
import {
  CreateCustomTemplateInput,
  UpdateCustomTemplateInput,
  ShareTemplateInput,
  UpdateTemplatePublicityInput,
} from '../inputs/custom-template.input';
import { CustomTemplateService } from '../../services/custom-template.service';

@Resolver(() => CustomTemplate)
export class CustomTemplateResolver {
  constructor(private readonly customTemplateService: CustomTemplateService) {}

  // Queries
  @Query(() => [CustomTemplate], { name: 'getMyCustomTemplates' })
  @UseGuards(JwtAuthGuard)
  async getMyCustomTemplates(
    @CurrentUser() user: User,
    @Args('archived', { type: () => Boolean, nullable: true }) archived: boolean = false,
    @Args('category', { type: () => TemplateCategory, nullable: true }) category?: TemplateCategory,
  ): Promise<CustomTemplate[]> {
    return this.customTemplateService.getUserTemplates(user.id, {
      archived,
      category,
    });
  }

  @Query(() => CustomTemplate, { name: 'getCustomTemplate' })
  @UseGuards(JwtAuthGuard)
  async getCustomTemplate(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.getTemplate(id, user.id);
  }

  @Query(() => [CustomTemplate], { name: 'getPublicTemplates' })
  async getPublicTemplates(
    @Args('category', { type: () => TemplateCategory, nullable: true }) category?: TemplateCategory,
  ): Promise<CustomTemplate[]> {
    return this.customTemplateService.getPublicTemplates(category);
  }

  @Query(() => [CustomTemplate], { name: 'getSharedTemplates' })
  @UseGuards(JwtAuthGuard)
  async getSharedTemplates(@CurrentUser() user: User): Promise<CustomTemplate[]> {
    return this.customTemplateService.getSharedTemplates(user.id);
  }

  // Mutations
  @Mutation(() => CustomTemplate, { name: 'createCustomTemplate' })
  @UseGuards(JwtAuthGuard)
  async createCustomTemplate(
    @CurrentUser() user: User,
    @Args('input') input: CreateCustomTemplateInput,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.createTemplate(user.id, input);
  }

  @Mutation(() => CustomTemplate, { name: 'updateCustomTemplate' })
  @UseGuards(JwtAuthGuard)
  async updateCustomTemplate(
    @CurrentUser() user: User,
    @Args('input') input: UpdateCustomTemplateInput,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.updateTemplate(user.id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteCustomTemplate' })
  @UseGuards(JwtAuthGuard)
  async deleteCustomTemplate(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.customTemplateService.deleteTemplate(id, user.id);
  }

  @Mutation(() => CustomTemplate, { name: 'duplicateCustomTemplate' })
  @UseGuards(JwtAuthGuard)
  async duplicateCustomTemplate(
    @CurrentUser() user: User,
    @Args('templateId') templateId: string,
    @Args('newName', { nullable: true }) newName?: string,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.duplicateTemplate(templateId, user.id, newName);
  }

  @Mutation(() => [TemplateShare], { name: 'shareTemplate' })
  @UseGuards(JwtAuthGuard)
  async shareTemplate(
    @CurrentUser() user: User,
    @Args('input') input: ShareTemplateInput,
  ): Promise<TemplateShare[]> {
    return this.customTemplateService.shareTemplate(input.templateId, user.id, input.userIds);
  }

  @Mutation(() => Boolean, { name: 'unshareTemplate' })
  @UseGuards(JwtAuthGuard)
  async unshareTemplate(
    @CurrentUser() user: User,
    @Args('templateId') templateId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    return this.customTemplateService.unshareTemplate(templateId, user.id, userId);
  }

  @Mutation(() => CustomTemplate, { name: 'updateTemplatePublicity' })
  @UseGuards(JwtAuthGuard)
  async updateTemplatePublicity(
    @CurrentUser() user: User,
    @Args('input') input: UpdateTemplatePublicityInput,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.updatePublicity(
      input.templateId,
      user.id,
      input.isPublic,
    );
  }

  @Mutation(() => CustomTemplate, { name: 'incrementTemplateUsage' })
  @UseGuards(JwtAuthGuard)
  async incrementTemplateUsage(
    @Args('templateId') templateId: string,
  ): Promise<CustomTemplate> {
    return this.customTemplateService.incrementUsage(templateId);
  }
}
