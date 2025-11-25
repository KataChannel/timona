import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

// ===============================
// QUERY INPUT TYPES (Prisma-like)
// ===============================

@InputType('UnifiedFindManyInput')
export class UnifiedFindManyInput {
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' })
  @IsOptional()
  @IsObject()
  where?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Order by fields (Prisma orderBy clause)' })
  @IsOptional()
  @IsObject()
  orderBy?: any;

  @Field(() => Int, { nullable: true, description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Field(() => Int, { nullable: true, description: 'Maximum number of records to return' })
  @IsOptional()
  @IsNumber()
  take?: number;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedPaginatedInput')
export class UnifiedPaginatedInput {
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' })
  @IsOptional()
  @IsObject()
  where?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Order by fields (Prisma orderBy clause)' })
  @IsOptional()
  @IsObject()
  orderBy?: any;

  @Field(() => Int, { defaultValue: 1, description: 'Page number (starts from 1)' })
  @IsNumber()
  page: number = 1;

  @Field(() => Int, { defaultValue: 10, description: 'Number of records per page' })
  @IsNumber()
  limit: number = 10;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedFindByIdInput')
export class UnifiedFindByIdInput {
  @Field(() => ID, { description: 'Unique identifier of the record' })
  @IsString()
  id: string;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

// ===============================
// MUTATION INPUT TYPES (Prisma-like)
// ===============================

@InputType('UnifiedCreateInput')
export class UnifiedCreateInput {
  @Field(() => GraphQLJSONObject, { description: 'Data for record creation (Prisma data clause)' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedUpdateInput')
export class UnifiedUpdateInput {
  @Field(() => ID, { description: 'Unique identifier of the record to update' })
  @IsString()
  id: string;

  @Field(() => GraphQLJSONObject, { description: 'Data for record update (Prisma data clause)' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedDeleteInput')
export class UnifiedDeleteInput {
  @Field(() => ID, { description: 'Unique identifier of the record to delete' })
  @IsString()
  id: string;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from deleted record (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data from deleted record (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

// ===============================
// BULK OPERATION INPUT TYPES (Prisma-like)
// ===============================

@InputType('UnifiedBulkCreateInput')
export class UnifiedBulkCreateInput {
  @Field(() => [GraphQLJSONObject], { description: 'Array of data objects for bulk creation' })
  @IsArray()
  data: Record<string, any>[];

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Skip duplicate records during bulk creation' })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from results (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data in results (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedBulkUpdateInput')
export class UnifiedBulkUpdateInput {
  @Field(() => GraphQLJSONObject, { description: 'Filter conditions for records to update (Prisma where clause)' })
  @IsObject()
  where: any;

  @Field(() => GraphQLJSONObject, { description: 'Data for bulk update (Prisma data clause)' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from results (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data in results (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

@InputType('UnifiedBulkDeleteInput')
export class UnifiedBulkDeleteInput {
  @Field(() => GraphQLJSONObject, { description: 'Filter conditions for records to delete (Prisma where clause)' })
  @IsObject()
  where: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from deleted records (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data from deleted records (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

// ===============================
// UTILITY INPUT TYPES
// ===============================

@InputType('UnifiedUpsertInput')
export class UnifiedUpsertInput {
  @Field(() => GraphQLJSONObject, { description: 'Conditions to find existing record (Prisma where clause)' })
  @IsObject()
  where: any;

  @Field(() => GraphQLJSONObject, { description: 'Data for creating new record if not found (Prisma create clause)' })
  @IsObject()
  create: any;

  @Field(() => GraphQLJSONObject, { description: 'Data for updating existing record if found (Prisma update clause)' })
  @IsObject()
  update: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' })
  @IsOptional()
  @IsObject()
  select?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' })
  @IsOptional()
  @IsObject()
  include?: any;
}

// ===============================
// ADVANCED QUERY INPUT TYPES
// ===============================

@InputType('UnifiedAggregateInput')
export class UnifiedAggregateInput {
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' })
  @IsOptional()
  @IsObject()
  where?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Group by fields (Prisma groupBy clause)' })
  @IsOptional()
  @IsObject()
  groupBy?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Aggregation operations (count, sum, avg, min, max)' })
  @IsOptional()
  @IsObject()
  aggregate?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Having conditions for grouped results' })
  @IsOptional()
  @IsObject()
  having?: any;
}

// ===============================
// FILTER HELPERS (Common Prisma filters)
// ===============================

@InputType('StringFilter')
export class StringFilter {
  @Field(() => String, { nullable: true })
  equals?: string;

  @Field(() => [String], { nullable: true })
  in?: string[];

  @Field(() => [String], { nullable: true })
  notIn?: string[];

  @Field(() => String, { nullable: true })
  contains?: string;

  @Field(() => String, { nullable: true })
  startsWith?: string;

  @Field(() => String, { nullable: true })
  endsWith?: string;
}

@InputType('NumberFilter')
export class NumberFilter {
  @Field(() => Number, { nullable: true })
  equals?: number;

  @Field(() => [Number], { nullable: true })
  in?: number[];

  @Field(() => [Number], { nullable: true })
  notIn?: number[];

  @Field(() => Number, { nullable: true })
  lt?: number;

  @Field(() => Number, { nullable: true })
  lte?: number;

  @Field(() => Number, { nullable: true })
  gt?: number;

  @Field(() => Number, { nullable: true })
  gte?: number;
}

@InputType('DateFilter')
export class DateFilter {
  @Field(() => Date, { nullable: true })
  equals?: Date;

  @Field(() => [Date], { nullable: true })
  in?: Date[];

  @Field(() => [Date], { nullable: true })
  notIn?: Date[];

  @Field(() => Date, { nullable: true })
  lt?: Date;

  @Field(() => Date, { nullable: true })
  lte?: Date;

  @Field(() => Date, { nullable: true })
  gt?: Date;

  @Field(() => Date, { nullable: true })
  gte?: Date;
}