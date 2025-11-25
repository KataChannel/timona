import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { SourceDocumentType, SourceDocumentStatus } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsArray } from 'class-validator';

// ============== Category DTOs ==============

@InputType()
export class CreateSourceDocumentCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;
}

@InputType()
export class UpdateSourceDocumentCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;
}

// ============== Source Document DTOs ==============

@InputType()
export class CreateSourceDocumentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => SourceDocumentType)
  @IsEnum(SourceDocumentType)
  type: SourceDocumentType;

  @Field(() => SourceDocumentStatus, { defaultValue: SourceDocumentStatus.DRAFT })
  @IsEnum(SourceDocumentStatus)
  status: SourceDocumentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class UpdateSourceDocumentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => SourceDocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(SourceDocumentType)
  type?: SourceDocumentType;

  @Field(() => SourceDocumentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SourceDocumentStatus)
  status?: SourceDocumentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class SourceDocumentFilterInput {
  @Field(() => [SourceDocumentType], { nullable: true })
  types?: SourceDocumentType[];

  @Field(() => [SourceDocumentStatus], { nullable: true })
  statuses?: SourceDocumentStatus[];

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  isAiAnalyzed?: boolean;
}

// ============== Course Link DTOs ==============

@InputType()
export class LinkDocumentToCourseInput {
  @Field(() => ID)
  courseId: string;

  @Field(() => ID)
  documentId: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field({ defaultValue: false })
  isRequired: boolean;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateCourseDocumentLinkInput {
  @Field(() => Int, { nullable: true })
  order?: number;

  @Field({ nullable: true })
  isRequired?: boolean;

  @Field({ nullable: true })
  description?: string;
}
