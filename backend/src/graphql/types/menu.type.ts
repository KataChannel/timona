import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Enums
export enum MenuTypeEnum {
  SIDEBAR = 'SIDEBAR',
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  MOBILE = 'MOBILE',
  CUSTOM = 'CUSTOM',
}

export enum MenuTargetEnum {
  SELF = 'SELF',
  BLANK = 'BLANK',
  MODAL = 'MODAL',
}

export enum MenuLinkTypeEnum {
  URL = 'URL',
  PRODUCT_LIST = 'PRODUCT_LIST',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  BLOG_LIST = 'BLOG_LIST',
  BLOG_DETAIL = 'BLOG_DETAIL',
  PAGE = 'PAGE',
  CATEGORY = 'CATEGORY',
  BLOG_CATEGORY = 'BLOG_CATEGORY',
}

registerEnumType(MenuTypeEnum, {
  name: 'MenuTypeEnum',
  description: 'Loại menu',
});

registerEnumType(MenuTargetEnum, {
  name: 'MenuTargetEnum',
  description: 'Target khi click menu',
});

registerEnumType(MenuLinkTypeEnum, {
  name: 'MenuLinkTypeEnum',
  description: 'Loại liên kết động',
});

// Menu Object Type
@ObjectType()
export class MenuType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String)
  type: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => [MenuType], { nullable: true })
  children?: MenuType[];

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  level: number;

  @Field({ nullable: true })
  path?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  externalUrl?: string;

  @Field(() => String)
  target: string;

  // Dynamic Linking
  @Field(() => String, { nullable: true })
  linkType?: string;

  @Field({ nullable: true })
  productId?: string;

  @Field({ nullable: true })
  blogPostId?: string;

  @Field({ nullable: true })
  pageId?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  blogCategoryId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  queryConditions?: any;

  // Display
  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  iconType?: string;

  @Field({ nullable: true })
  badge?: string;

  @Field({ nullable: true })
  badgeColor?: string;

  @Field({ nullable: true })
  image?: string;

  // Permissions
  @Field(() => [String], { nullable: true })
  requiredPermissions?: string[];

  @Field(() => [String], { nullable: true })
  requiredRoles?: string[];

  @Field()
  isPublic: boolean;

  // State
  @Field()
  isActive: boolean;

  @Field()
  isVisible: boolean;

  @Field()
  isProtected: boolean;

  // Metadata
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field({ nullable: true })
  cssClass?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  customData?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;

  // Computed field for final URL
  @Field({ nullable: true })
  finalUrl?: string;
}
