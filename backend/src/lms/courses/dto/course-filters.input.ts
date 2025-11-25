import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { CourseLevel, CourseStatus } from '@prisma/client';

@InputType()
export class CourseFiltersInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @Field(() => CourseLevel, { nullable: true })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @Field(() => CourseStatus, { nullable: true })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  instructorId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsNumber()
  @Min(1)
  limit: number = 20;

  @Field({ defaultValue: 'createdAt' })
  @IsString()
  sortBy: string = 'createdAt';

  @Field({ defaultValue: 'desc' })
  @IsString()
  sortOrder: 'asc' | 'desc' = 'desc';
}
