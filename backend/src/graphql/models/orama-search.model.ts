import { ObjectType, Field, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

// Search result hit
@ObjectType()
export class OramaSearchHit {
  @Field()
  id: string;

  @Field(() => Float)
  score: number;

  @Field(() => GraphQLJSON)
  document: any;
}

// Elapsed time
@ObjectType()
export class OramaElapsed {
  @Field()
  formatted: string;
}

// Generic search result
@ObjectType()
export class OramaSearchResult {
  @Field(() => [OramaSearchHit])
  hits: OramaSearchHit[];

  @Field(() => Int)
  count: number;

  @Field(() => OramaElapsed)
  elapsed: OramaElapsed;

  @Field(() => GraphQLJSON, { nullable: true })
  facets?: any;
}

// Universal search result containing all entity types
@ObjectType()
export class UniversalSearchResult {
  @Field(() => OramaSearchResult)
  tasks: OramaSearchResult;

  @Field(() => OramaSearchResult)
  users: OramaSearchResult;

  @Field(() => OramaSearchResult)
  projects: OramaSearchResult;

  @Field(() => OramaSearchResult)
  affiliateCampaigns: OramaSearchResult;

  @Field(() => OramaSearchResult)
  affiliateLinks: OramaSearchResult;
}

// Sort order enum
export enum OramaSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(OramaSortOrder, {
  name: 'OramaSortOrder',
  description: 'Sort order for search results',
});

// Sort input
@InputType()
export class OramaSortInput {
  @Field()
  @IsString()
  property: string;

  @Field(() => OramaSortOrder)
  @IsEnum(OramaSortOrder)
  order: OramaSortOrder;
}

// Search query input
@InputType()
export class OramaSearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  term?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  where?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  facets?: any;

  @Field(() => OramaSortInput, { nullable: true })
  @IsOptional()
  sortBy?: OramaSortInput;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// Health check result
@ObjectType()
export class OramaHealthCheck {
  @Field()
  status: string;

  @Field(() => [String])
  indexes: string[];
}

// Reindex result
@ObjectType()
export class ReindexResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int, { nullable: true })
  totalIndexed?: number;
}
