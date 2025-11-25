import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateDiscussionInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  lessonId?: string;

  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @Field()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString()
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content: string;
}

@InputType()
export class CreateReplyInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Discussion ID is required' })
  discussionId: string;

  @Field()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString()
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  parentId?: string;
}

@InputType()
export class UpdateDiscussionInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Discussion ID is required' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content?: string;
}
