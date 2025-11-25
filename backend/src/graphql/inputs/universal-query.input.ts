import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

/**
 * Universal Dynamic Query Input
 * Supports all Prisma query operations
 */
@InputType()
export class UniversalQueryInput {
  @Field(() => String)
  model: string;

  @Field(() => String)
  operation: string; // findMany, findUnique, findFirst, create, update, delete, count, aggregate

  @Field(() => GraphQLJSONObject, { nullable: true })
  where?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  include?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  orderBy?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  cursor?: Record<string, any>;

  @Field(() => [String], { nullable: true })
  distinct?: string[];
}

/**
 * Pagination Input
 */
@InputType()
export class PaginationQueryInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  @Field(() => String, { nullable: true })
  sortBy?: string;

  @Field(() => String, { defaultValue: 'desc' })
  sortOrder: string;
}

/**
 * Find Many Input with Pagination
 */
@InputType()
export class FindManyInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  where?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  orderBy?: Record<string, any>;

  @Field(() => PaginationQueryInput, { nullable: true })
  @IsOptional()
  pagination?: PaginationQueryInput;
}

/**
 * Find Unique Input
 */
@InputType()
export class FindUniqueInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

/**
 * Create Input
 */
@InputType()
export class CreateInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

/**
 * Create Many Input
 */
@InputType()
export class CreateManyInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => [GraphQLJSONObject])
  @IsObject({ each: true })
  data: Array<Record<string, any>>;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  skipDuplicates: boolean;
}

/**
 * Update Input
 */
@InputType()
export class UpdateInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

/**
 * Update Many Input
 */
@InputType()
export class UpdateManyInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  data: Record<string, any>;
}

/**
 * Upsert Input
 */
@InputType()
export class UpsertInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  create: Record<string, any>;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  update: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

/**
 * Delete Input
 */
@InputType()
export class DeleteInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

/**
 * Delete Many Input
 */
@InputType()
export class DeleteManyInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  where: Record<string, any>;
}

/**
 * Count Input
 */
@InputType()
export class CountInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  where?: Record<string, any>;
}

/**
 * Aggregate Input
 */
@InputType()
export class AggregateInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  where?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _count?: Record<string, boolean> | boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _sum?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _avg?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _min?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _max?: Record<string, boolean>;
}

/**
 * Group By Input
 */
@InputType()
export class GroupByInput {
  @Field(() => String)
  @IsString()
  model: string;

  @Field(() => [String])
  @IsString({ each: true })
  by: string[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  where?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  having?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  orderBy?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  take?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _count?: Record<string, boolean> | boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _sum?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _avg?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _min?: Record<string, boolean>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  _max?: Record<string, boolean>;
}

/**
 * Raw Query Input
 */
@InputType()
export class RawQueryInput {
  @Field(() => String)
  @IsString()
  query: string;

  @Field(() => [GraphQLJSONObject], { nullable: true })
  @IsOptional()
  params?: any[];
}
