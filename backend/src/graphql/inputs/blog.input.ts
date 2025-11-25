import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { PostStatus, PostVisibility } from '@prisma/client';

@InputType()
export class CreateBlogInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  excerpt?: string;

  // Author is optional - will be set from context if not provided
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  // Featured image (aligns with Prisma schema)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  // Additional images
  @Field(() => [String], { nullable: true })
  @IsOptional()
  images?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tagIds?: string[];

  // Status field (DRAFT, PUBLISHED, etc.)
  @Field(() => String, { nullable: true, defaultValue: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  // Visibility field
  @Field(() => String, { nullable: true, defaultValue: PostVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  publishedAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  metaKeywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  readingTime?: number;
}

@InputType()
export class UpdateBlogInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty({ message: 'Blog post ID is required' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  images?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tagIds?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  publishedAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  metaKeywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  readingTime?: number;
}

@InputType()
export class GetBlogsInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 12 })
  limit?: number;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true, defaultValue: 'latest' })
  sort?: string;
}

@InputType()
export class CreateBlogCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class UpdateBlogCategoryInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class CreateBlogTagInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Tag name is required' })
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;
}

@InputType()
export class UpdateBlogTagInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;
}
