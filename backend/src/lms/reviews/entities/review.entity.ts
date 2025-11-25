import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

// Define ReviewUser first (before Review uses it)
@ObjectType()
export class ReviewUser {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class Review {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Int, { description: 'Rating from 1 to 5 stars' })
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Int, { defaultValue: 0 })
  helpfulCount: number;

  @Field(() => [String], { defaultValue: [] })
  helpfulVoters: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => ReviewUser, { nullable: true })
  user?: ReviewUser;
}

@ObjectType()
export class ReviewStats {
  @Field(() => Float)
  avgRating: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => Int)
  fiveStars: number;

  @Field(() => Int)
  fourStars: number;

  @Field(() => Int)
  threeStars: number;

  @Field(() => Int)
  twoStars: number;

  @Field(() => Int)
  oneStar: number;
}

@ObjectType()
export class ReviewsWithStats {
  @Field(() => [Review])
  reviews: Review[];

  @Field(() => ReviewStats)
  stats: ReviewStats;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}
