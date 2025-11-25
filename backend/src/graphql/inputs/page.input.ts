import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { PageStatus, BlockType } from '../models/page.model';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';

@InputType()
export class CreatePageBlockInput {
  @Field(() => BlockType)
  @IsEnum(BlockType)
  type: BlockType;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  content?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  style?: any;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  // Nested blocks support
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  depth?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  config?: any;

  @Field(() => [CreatePageBlockInput], { nullable: true })
  @IsOptional()
  children?: CreatePageBlockInput[];
}

@InputType()
export class UpdatePageBlockInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field(() => BlockType, { nullable: true })
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  content?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  style?: any;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  // Nested blocks support
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  depth?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  config?: any;

  @Field(() => [UpdatePageBlockInput], { nullable: true })
  @IsOptional()
  children?: UpdatePageBlockInput[];
}

@InputType()
export class CreatePageInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  slug: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  content?: any;

  @Field(() => PageStatus, { defaultValue: PageStatus.DRAFT })
  @IsEnum(PageStatus)
  status: PageStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  seoKeywords?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  isHomepage?: boolean;

  // 🆕 Dynamic Page Template Support
  @Field(() => Boolean, { defaultValue: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  isDynamic?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  dynamicConfig?: any;

  @Field(() => [CreatePageBlockInput], { nullable: true })
  @IsOptional()
  blocks?: CreatePageBlockInput[];
}

@InputType()
export class UpdatePageInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  content?: any;

  @Field(() => PageStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  seoKeywords?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHomepage?: boolean;

  // 🆕 Dynamic Page Template Support
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isDynamic?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  dynamicConfig?: any;

  @Field(() => [UpdatePageBlockInput], { nullable: true })
  @IsOptional()
  blocks?: UpdatePageBlockInput[];
}

@InputType()
export class PageFiltersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => PageStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

@InputType()
export class BulkUpdateBlockOrderInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  order: number;
}