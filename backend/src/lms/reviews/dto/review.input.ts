import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @Field(() => Int)
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  comment?: string;
}

@InputType()
export class UpdateReviewInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Review ID is required' })
  reviewId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  comment?: string;
}

@InputType()
export class GetReviewsInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 10;

  @Field(() => String, { nullable: true, defaultValue: 'recent' })
  @IsOptional()
  @IsString()
  sortBy?: 'recent' | 'helpful' | 'rating' = 'recent';

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  filterByRating?: number;
}
