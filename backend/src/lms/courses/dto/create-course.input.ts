import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber, Min, IsArray, MaxLength, MinLength } from 'class-validator';
import { CourseLevel, CourseStatus } from '@prisma/client';

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  trailer?: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  price: number = 0;

  @Field(() => CourseLevel, { defaultValue: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel = CourseLevel.BEGINNER;

  @Field(() => CourseStatus, { defaultValue: CourseStatus.DRAFT })
  @IsEnum(CourseStatus)
  status: CourseStatus = CourseStatus.DRAFT;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn: string[] = [];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[] = [];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  targetAudience: string[] = [];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
