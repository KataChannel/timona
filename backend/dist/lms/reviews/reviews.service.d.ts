import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewInput, UpdateReviewInput, GetReviewsInput } from './dto/review.input';
import { Review, ReviewStats, ReviewsWithStats } from './entities/review.entity';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(userId: string, input: CreateReviewInput): Promise<Review>;
    updateReview(userId: string, input: UpdateReviewInput): Promise<Review>;
    deleteReview(userId: string, reviewId: string): Promise<boolean>;
    getReviews(input: GetReviewsInput): Promise<ReviewsWithStats>;
    getReviewStats(courseId: string): Promise<ReviewStats>;
    getUserReview(userId: string, courseId: string): Promise<Review | null>;
    markReviewHelpful(userId: string, reviewId: string): Promise<Review>;
    private updateCourseRating;
}
