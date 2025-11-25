import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Menu } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class MenuResponseDto {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  type!: string;

  @Field({ nullable: true })
  parentId?: string | null;

  @Field(() => Int)
  order!: number;

  @Field(() => Int)
  level!: number;

  @Field({ nullable: true })
  path?: string | null;

  @Field({ nullable: true })
  url?: string | null;

  @Field({ nullable: true })
  route?: string | null;

  @Field({ nullable: true })
  externalUrl?: string | null;

  @Field()
  target!: string;

  @Field({ nullable: true })
  icon?: string | null;

  @Field({ nullable: true })
  iconType?: string | null;

  @Field({ nullable: true })
  badge?: string | null;

  @Field({ nullable: true })
  badgeColor?: string | null;

  @Field({ nullable: true })
  image?: string | null;

  @Field({ nullable: true })
  cssClass?: string | null;

  // Dynamic linking fields
  @Field({ nullable: true })
  linkType?: string | null;

  @Field({ nullable: true })
  productId?: string | null;

  @Field({ nullable: true })
  blogPostId?: string | null;

  @Field({ nullable: true })
  pageId?: string | null;

  @Field({ nullable: true })
  categoryId?: string | null;

  @Field({ nullable: true })
  blogCategoryId?: string | null;

  @Field({ nullable: true })
  queryConditions?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  customData?: Record<string, any> | null;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any> | null;

  @Field(() => [String])
  requiredPermissions!: string[];

  @Field(() => [String])
  requiredRoles!: string[];

  @Field()
  isPublic!: boolean;

  @Field()
  isActive!: boolean;

  @Field()
  isVisible!: boolean;

  @Field()
  isProtected!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field({ nullable: true })
  createdBy?: string | null;

  @Field({ nullable: true })
  updatedBy?: string | null;

  // ✅ ADD: Children field for hierarchical menu structure
  @Field(() => [MenuResponseDto], { nullable: true })
  children?: MenuResponseDto[];

  static fromEntity(menu: Menu & { children?: Menu[] }): MenuResponseDto {
    const dto = new MenuResponseDto();
    Object.assign(dto, menu);
    
    // ✅ Map children recursively
    if (menu.children && menu.children.length > 0) {
      dto.children = menu.children.map(child => MenuResponseDto.fromEntity(child));
    }
    
    return dto;
  }

  static fromEntities(menus: (Menu & { children?: Menu[] })[]): MenuResponseDto[] {
    return menus.map(menu => MenuResponseDto.fromEntity(menu));
  }
}

@ObjectType()
export class MenuPaginationResponseDto {
  @Field(() => [MenuResponseDto])
  items!: MenuResponseDto[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;

  @Field(() => Int)
  totalPages!: number;

  @Field()
  hasMore!: boolean;
}
