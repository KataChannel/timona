import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsEnum, IsUrl } from 'class-validator';
import { LessonType } from '@prisma/client';

@InputType()
export class CreateLessonInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsEnum(LessonType, { message: 'Type must be VIDEO, TEXT, or QUIZ' })
  type: LessonType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Module ID is required' })
  moduleId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class UpdateLessonInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Lesson ID is required' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(LessonType, { message: 'Type must be VIDEO, TEXT, or QUIZ' })
  type?: LessonType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class ReorderLessonsInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Module ID is required' })
  moduleId: string;

  @Field(() => [ID])
  @IsNotEmpty({ message: 'Lesson order is required' })
  lessonIds: string[];
}
