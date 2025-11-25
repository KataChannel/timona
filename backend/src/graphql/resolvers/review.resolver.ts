import { Resolver, Query, Mutation, Args, Context, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from '../../services/review.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { 
  ProductReviewType, 
  ReviewsResponse, 
  ProductRatingSummaryType, 
  CanReviewResponse, 
  ReviewResponse,
  GetReviewsInput,
  CreateReviewInput,
  UpdateReviewInput,
  ReviewHelpfulInput
} from '../types/review.type';


@Resolver(() => ProductReviewType)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Get reviews with filters
   */
  @Query(() => ReviewsResponse)
  async reviews(
    @Args('input', { type: () => GetReviewsInput, nullable: true }) input?: GetReviewsInput,
  ): Promise<ReviewsResponse> {
    // Cast GraphQL input to service input type
    const result = await this.reviewService.getReviews(input as any || {});
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    };
  }

  /**
   * Get product reviews
   */
  @Query(() => ReviewsResponse)
  async productReviews(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit?: number,
    @Args('rating', { type: () => Int, nullable: true }) rating?: number,
  ): Promise<ReviewsResponse> {
    return this.reviews({ productId, page, limit, rating });
  }

  /**
   * Get review by ID
   */
  @Query(() => ProductReviewType, { nullable: true })
  async review(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<any> {
    return this.reviewService.getReviewById(id);
  }

  /**
   * Get product rating summary
   */
  @Query(() => ProductRatingSummaryType)
  async productRatingSummary(
    @Args('productId', { type: () => ID }) productId: string,
  ): Promise<ProductRatingSummaryType> {
    return this.reviewService.getProductRatingSummary(productId);
  }

  /**
   * Check if user can review product
   */
  @Query(() => CanReviewResponse)
  @UseGuards(JwtAuthGuard)
  async canReviewProduct(
    @Args('productId', { type: () => ID }) productId: string,
    @Context() context: any,
  ): Promise<CanReviewResponse> {
    const userId = context.req.user.id;
    return this.reviewService.canReview(userId, productId);
  }

  /**
   * Create review
   */
  @Mutation(() => ProductReviewType)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Args('input') input: CreateReviewInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.reviewService.createReview(userId, input);
  }

  /**
   * Update review
   */
  @Mutation(() => ProductReviewType)
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateReviewInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.reviewService.updateReview(id, userId, input);
  }

  /**
   * Delete review
   */
  @Mutation(() => ReviewResponse)
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<ReviewResponse> {
    const userId = context.req.user.id;
    const isAdmin = context.req.user.roleType === 'ADMIN';
    return this.reviewService.deleteReview(id, userId, isAdmin);
  }

  /**
   * Mark review as helpful
   */
  @Mutation(() => ReviewResponse)
  @UseGuards(JwtAuthGuard)
  async markReviewHelpful(
    @Args('input') input: ReviewHelpfulInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.reviewService.markHelpful(userId, input);
  }
}
