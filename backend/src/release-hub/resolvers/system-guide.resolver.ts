import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SystemGuideEntity, GuideType } from '../entities/system-guide.entity';
import { SystemGuideService } from '../services/system-guide.service';
import { CreateSystemGuideInput, UpdateSystemGuideInput } from '../dto/system-guide.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => SystemGuideEntity)
export class SystemGuideResolver {
  constructor(private readonly systemGuideService: SystemGuideService) {}

  // Field resolvers
  @ResolveField(() => Number)
  order(@Parent() guide: any) {
    return guide.orderIndex;
  }

  @ResolveField(() => String, { nullable: true })
  icon(@Parent() guide: any) {
    return guide.icon || null;
  }

  @Query(() => [SystemGuideEntity], { name: 'systemGuides' })
  async getSystemGuides(
    @Args('type', { type: () => GuideType, nullable: true }) type?: GuideType,
    @Args('parentId', { type: () => String, nullable: true }) parentId?: string | null,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.systemGuideService.findAll({
      type,
      parentId,
      search,
      isPublished: true,
    });
  }

  @Query(() => SystemGuideEntity, { name: 'systemGuide' })
  async getSystemGuide(@Args('id') id: string) {
    return this.systemGuideService.findOne(id);
  }

  @Query(() => SystemGuideEntity, { name: 'systemGuideBySlug' })
  async getSystemGuideBySlug(@Args('slug') slug: string) {
    return this.systemGuideService.findBySlug(slug);
  }

  @Mutation(() => SystemGuideEntity)
  @UseGuards(JwtAuthGuard)
  async createSystemGuide(
    @Args('input') input: CreateSystemGuideInput,
    @CurrentUser() user: any,
  ) {
    return this.systemGuideService.create({
      ...input,
      authorId: user.id,
    });
  }

  @Mutation(() => SystemGuideEntity)
  @UseGuards(JwtAuthGuard)
  async updateSystemGuide(@Args('input') input: UpdateSystemGuideInput) {
    return this.systemGuideService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteSystemGuide(@Args('id') id: string) {
    return this.systemGuideService.delete(id);
  }

  @Mutation(() => SystemGuideEntity)
  async incrementGuideView(@Args('id') id: string) {
    return this.systemGuideService.incrementViewCount(id);
  }

  @Mutation(() => SystemGuideEntity)
  async voteGuideHelpful(
    @Args('id') id: string,
    @Args('isHelpful') isHelpful: boolean,
  ) {
    return this.systemGuideService.voteHelpful(id, isHelpful);
  }
}
