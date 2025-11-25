import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateMenuInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string; // MenuType

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  externalUrl?: string;

  @Field({ nullable: true })
  target?: string; // MenuTarget

  // Dynamic Linking
  @Field({ nullable: true })
  linkType?: string; // MenuLinkType

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

  @Field({ nullable: true })
  isPublic?: boolean;

  // State
  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field({ nullable: true })
  cssClass?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  customData?: any;
}

@InputType()
export class UpdateMenuInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  externalUrl?: string;

  @Field({ nullable: true })
  target?: string;

  // Dynamic Linking
  @Field({ nullable: true })
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

  @Field({ nullable: true })
  isPublic?: boolean;

  // State
  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field({ nullable: true })
  cssClass?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  customData?: any;
}
