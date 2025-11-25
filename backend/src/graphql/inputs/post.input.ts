import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PostStatus } from '@prisma/client';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  excerpt?: string;

  @Field()
  @IsNotEmpty()
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  featuredImage?: string;

  @Field(() => PostStatus, { defaultValue: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  excerpt?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  featuredImage?: string;

  @Field(() => PostStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class PostFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  @Field(() => PostStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field({ nullable: true })
  @IsOptional()
  authorId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}
