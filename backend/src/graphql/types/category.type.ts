import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { ProductType } from './product.type';

@ObjectType()
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  icon?: string;

  // Hierarchy
  @Field({ nullable: true })
  parentId?: string;

  @Field(() => CategoryType, { nullable: true })
  parent?: CategoryType;

  @Field(() => [CategoryType], { nullable: true })
  children?: CategoryType[];

  // SEO
  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  // Display
  @Field(() => Int)
  displayOrder: number;

  @Field()
  isActive: boolean;

  @Field()
  isFeatured: boolean;

  // Relations
  @Field(() => [ProductType], { nullable: true })
  products?: ProductType[];

  @Field(() => Int, { nullable: true })
  productCount?: number;

  // Metadata
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}

// Paginated Categories
@ObjectType()
export class PaginatedCategories {
  @Field(() => [CategoryType])
  items: CategoryType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasMore: boolean;
}
