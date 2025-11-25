import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewsWithStats, ReviewStats } from './entities/review.entity';
import { CreateReviewInput, UpdateReviewInput, GetReviewsInput } from './dto/review.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @CurrentUser() user: any,
    @Args('input') input: CreateReviewInput,
  ): Promise<Review> {
    return this.reviewsService.createReview(user.id, input);
  }

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @CurrentUser() user: any,
    @Args('input') input: UpdateReviewInput,
  ): Promise<Review> {
    return this.reviewsService.updateReview(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @CurrentUser() user: any,
    @Args('reviewId', { type: () => ID }) reviewId: string,
  ): Promise<boolean> {
    return this.reviewsService.deleteReview(user.id, reviewId);
  }

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async markReviewHelpful(
    @CurrentUser() user: any,
    @Args('reviewId', { type: () => ID }) reviewId: string,
  ): Promise<Review> {
    return this.reviewsService.markReviewHelpful(user.id, reviewId);
  }

  @Query(() => ReviewsWithStats)
  async reviews(@Args('input') input: GetReviewsInput): Promise<ReviewsWithStats> {
    return this.reviewsService.getReviews(input);
  }

  @Query(() => ReviewStats)
  async reviewStats(
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<ReviewStats> {
    return this.reviewsService.getReviewStats(courseId);
  }

  @Query(() => Review, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async userReview(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<Review | null> {
    return this.reviewsService.getUserReview(user.id, courseId);
  }
}
