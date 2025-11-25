import { ReviewService } from '../../services/review.service';
import { ReviewsResponse, ProductRatingSummaryType, CanReviewResponse, ReviewResponse, GetReviewsInput, CreateReviewInput, UpdateReviewInput, ReviewHelpfulInput } from '../types/review.type';
export declare class ReviewResolver {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    reviews(input?: GetReviewsInput): Promise<ReviewsResponse>;
    productReviews(productId: string, page?: number, limit?: number, rating?: number): Promise<ReviewsResponse>;
    review(id: string): Promise<any>;
    productRatingSummary(productId: string): Promise<ProductRatingSummaryType>;
    canReviewProduct(productId: string, context: any): Promise<CanReviewResponse>;
    createReview(input: CreateReviewInput, context: any): Promise<any>;
    updateReview(id: string, input: UpdateReviewInput, context: any): Promise<any>;
    deleteReview(id: string, context: any): Promise<ReviewResponse>;
    markReviewHelpful(input: ReviewHelpfulInput, context: any): Promise<any>;
}
