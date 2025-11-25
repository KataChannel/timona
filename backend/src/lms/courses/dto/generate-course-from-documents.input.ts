import { InputType, Field, ID } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator';

@InputType()
export class GenerateCourseFromDocumentsInput {
  @Field(() => [ID], { description: 'Array of source document IDs to analyze' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one document ID is required' })
  @IsNotEmpty({ message: 'documentIds cannot be empty' })
  documentIds: string[];

  @Field({ nullable: true, description: 'Optional category for the generated course' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true, description: 'Optional additional instructions for AI' })
  @IsOptional()
  @IsString()
  additionalPrompt?: string;

  // User-edited fields from analysis step
  @Field({ nullable: true, description: 'Course title (user can edit AI suggestion)' })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true, description: 'Course description (user can edit AI suggestion)' })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true, description: 'Course level (user can edit AI suggestion)' })
  @IsOptional()
  @IsString()
  level?: string;

  @Field(() => [String], { nullable: true, description: 'Learning objectives (user can edit AI suggestion)' })
  @IsOptional()
  @IsArray()
  learningObjectives?: string[];

  @Field(() => [String], { nullable: true, description: 'What you will learn (user can edit AI suggestion)' })
  @IsOptional()
  @IsArray()
  whatYouWillLearn?: string[];

  @Field(() => [String], { nullable: true, description: 'Requirements (user can edit AI suggestion)' })
  @IsOptional()
  @IsArray()
  requirements?: string[];

  @Field(() => [String], { nullable: true, description: 'Target audience (user can edit AI suggestion)' })
  @IsOptional()
  @IsArray()
  targetAudience?: string[];

  @Field({ nullable: true, description: 'Additional context for generation' })
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

