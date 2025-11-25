import { InputType, Field, Int, ID } from '@nestjs/graphql';

// Create Category Input
@InputType()
export class CreateCategoryInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field({ defaultValue: false })
  isFeatured: boolean;

  @Field(() => Int, { defaultValue: 0 })
  displayOrder: number;
}

// Update Category Input
@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isFeatured?: boolean;

  @Field(() => Int, { nullable: true })
  displayOrder?: number;
}

// Category Filters
@InputType()
export class CategoryFiltersInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isFeatured?: boolean;

  @Field({ nullable: true })
  hasProducts?: boolean;
}

// Get Categories Input
@InputType()
export class GetCategoriesInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field({ nullable: true, defaultValue: 'displayOrder' })
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'asc' })
  sortOrder?: 'asc' | 'desc';

  @Field(() => CategoryFiltersInput, { nullable: true })
  filters?: CategoryFiltersInput;

  @Field({ nullable: true, defaultValue: false })
  includeChildren?: boolean;
}
