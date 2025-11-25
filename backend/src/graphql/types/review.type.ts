import { ObjectType, Field, ID, Int, InputType, Float } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// User Type (simplified for reviews)
@ObjectType()
export class ReviewUserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  avatar?: string;
}

// Product Type (simplified for reviews)
@ObjectType()
export class ReviewProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

// Product Review Type
@ObjectType()
export class ProductReviewType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field(() => ReviewProductType, { nullable: true })
  product?: ReviewProductType;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => ReviewUserType, { nullable: true })
  user?: ReviewUserType;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field()
  isVerifiedPurchase: boolean;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field()
  isApproved: boolean;

  @Field({ nullable: true })
  moderatedBy?: string;

  @Field({ nullable: true })
  moderatedAt?: Date;

  @Field(() => Int)
  helpfulCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Rating Distribution Type
@ObjectType()
export class RatingDistributionType {
  @Field(() => Int)
  rating5: number;

  @Field(() => Int)
  rating4: number;

  @Field(() => Int)
  rating3: number;

  @Field(() => Int)
  rating2: number;

  @Field(() => Int)
  rating1: number;
}

// Product Rating Summary Type
@ObjectType()
export class ProductRatingSummaryType {
  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => RatingDistributionType)
  ratingDistribution: RatingDistributionType;
}

// Reviews Response
@ObjectType()
export class ReviewsResponse {
  @Field(() => [ProductReviewType])
  items: ProductReviewType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasMore: boolean;
}

// Can Review Response
@ObjectType()
export class CanReviewResponse {
  @Field()
  canReview: boolean;

  @Field({ nullable: true })
  reason?: string;

  @Field({ nullable: true })
  isVerifiedPurchase?: boolean;
}

// Generic Review Response
@ObjectType()
export class ReviewResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Int, { nullable: true })
  helpfulCount?: number;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

@InputType()
export class CreateReviewInput {
  @Field(() => ID)
  productId: string;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];
}

@InputType()
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];
}

@InputType()
export class GetReviewsInput {
  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  isVerified?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'desc' })
  sortOrder?: string;
}

@InputType()
export class ReviewHelpfulInput {
  @Field(() => ID)
  reviewId: string;

  @Field()
  helpful: boolean;
}
