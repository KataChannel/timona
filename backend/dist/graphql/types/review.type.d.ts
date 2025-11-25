export declare class ReviewUserType {
    id: string;
    email?: string;
    fullName?: string;
    avatar?: string;
}
export declare class ReviewProductType {
    id: string;
    name: string;
    slug: string;
}
export declare class ProductReviewType {
    id: string;
    productId: string;
    product?: ReviewProductType;
    userId?: string;
    user?: ReviewUserType;
    guestName?: string;
    guestEmail?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    orderId?: string;
    isApproved: boolean;
    moderatedBy?: string;
    moderatedAt?: Date;
    helpfulCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RatingDistributionType {
    rating5: number;
    rating4: number;
    rating3: number;
    rating2: number;
    rating1: number;
}
export declare class ProductRatingSummaryType {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistributionType;
}
export declare class ReviewsResponse {
    items: ProductReviewType[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}
export declare class CanReviewResponse {
    canReview: boolean;
    reason?: string;
    isVerifiedPurchase?: boolean;
}
export declare class ReviewResponse {
    success: boolean;
    message?: string;
    helpfulCount?: number;
}
export declare class CreateReviewInput {
    productId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
}
export declare class UpdateReviewInput {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
}
export declare class GetReviewsInput {
    productId?: string;
    userId?: string;
    rating?: number;
    isVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class ReviewHelpfulInput {
    reviewId: string;
    helpful: boolean;
}
