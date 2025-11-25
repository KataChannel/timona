import { Resolver, Query, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleType } from '@prisma/client';
import { CreateWebsiteSettingInput, UpdateWebsiteSettingInput } from '../dto/website-setting.input';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class WebsiteSetting {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  type: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  group?: string;

  @Field()
  order: number;

  @Field(() => GraphQLJSON, { nullable: true })
  options?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  validation?: any;

  @Field()
  isActive: boolean;

  @Field()
  isPublic: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}

@Resolver(() => WebsiteSetting)
export class WebsiteSettingResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [WebsiteSetting], { name: 'websiteSettings' })
  async getWebsiteSettings(
    @Args('category', { nullable: true }) category?: string,
    @Args('group', { nullable: true }) group?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @Args('isPublic', { nullable: true }) isPublic?: boolean,
  ): Promise<WebsiteSetting[]> {
    const where: any = {};
    if (category) where.category = category;
    if (group) where.group = group;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isPublic === 'boolean') where.isPublic = isPublic;

    return await this.prisma.websiteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    }) as WebsiteSetting[];
  }

  @Query(() => [WebsiteSetting], { name: 'publicWebsiteSettings' })
  async getPublicWebsiteSettings(
    @Args('category', { nullable: true }) category?: string,
    @Args('group', { nullable: true }) group?: string,
    @Args('keys', { type: () => [String], nullable: true }) keys?: string[],
  ): Promise<WebsiteSetting[]> {
    const where: any = {
      isActive: true,
      isPublic: true,
    };
    if (category) where.category = category;
    if (group) where.group = group;
    if (keys && keys.length > 0) where.key = { in: keys };

    return await this.prisma.websiteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    }) as WebsiteSetting[];
  }

  @Query(() => WebsiteSetting, { name: 'websiteSetting', nullable: true })
  async getWebsiteSetting(@Args('key') key: string): Promise<WebsiteSetting | null> {
    return await this.prisma.websiteSetting.findUnique({
      where: { key },
    }) as WebsiteSetting | null;
  }

  @Query(() => [WebsiteSetting], { name: 'websiteSettingsByCategory' })
  async getWebsiteSettingsByCategory(@Args('category') category: string): Promise<WebsiteSetting[]> {
    return await this.prisma.websiteSetting.findMany({
      where: {
        category: category as any,
        isActive: true,
        isPublic: true,
      },
      orderBy: { order: 'asc' },
    }) as WebsiteSetting[];
  }

  @Query(() => [WebsiteSetting], { name: 'headerSettings' })
  async getHeaderSettings(): Promise<WebsiteSetting[]> {
    return await this.prisma.websiteSetting.findMany({
      where: {
        category: 'HEADER' as any,
        isActive: true,
        isPublic: true,
      },
      orderBy: { order: 'asc' },
    }) as WebsiteSetting[];
  }

  @Query(() => [WebsiteSetting], { name: 'footerSettings' })
  async getFooterSettings(): Promise<WebsiteSetting[]> {
    return await this.prisma.websiteSetting.findMany({
      where: {
        category: 'FOOTER' as any,
        isActive: true,
        isPublic: true,
      },
      orderBy: { order: 'asc' },
    }) as WebsiteSetting[];
  }

  @Mutation(() => WebsiteSetting, { name: 'updateWebsiteSetting' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  async updateWebsiteSetting(
    @Args('key') key: string,
    @Args('input') input: UpdateWebsiteSettingInput,
  ): Promise<WebsiteSetting> {
    return await this.prisma.websiteSetting.update({
      where: { key },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    }) as WebsiteSetting;
  }

  @Mutation(() => WebsiteSetting, { name: 'createWebsiteSetting' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  async createWebsiteSetting(@Args('input') input: CreateWebsiteSettingInput): Promise<WebsiteSetting> {
    return await this.prisma.websiteSetting.create({
      data: {
        ...input,
      },
    }) as WebsiteSetting;
  }

  @Mutation(() => WebsiteSetting, { name: 'deleteWebsiteSetting' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  async deleteWebsiteSetting(@Args('key') key: string): Promise<WebsiteSetting> {
    return await this.prisma.websiteSetting.delete({
      where: { key },
    }) as WebsiteSetting;
  }
}
