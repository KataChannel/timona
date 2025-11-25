import { ReviewsService } from './reviews.service';
import { Review, ReviewsWithStats, ReviewStats } from './entities/review.entity';
import { CreateReviewInput, UpdateReviewInput, GetReviewsInput } from './dto/review.input';
export declare class ReviewsResolver {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(user: any, input: CreateReviewInput): Promise<Review>;
    updateReview(user: any, input: UpdateReviewInput): Promise<Review>;
    deleteReview(user: any, reviewId: string): Promise<boolean>;
    markReviewHelpful(user: any, reviewId: string): Promise<Review>;
    reviews(input: GetReviewsInput): Promise<ReviewsWithStats>;
    reviewStats(courseId: string): Promise<ReviewStats>;
    userReview(user: any, courseId: string): Promise<Review | null>;
}
