export declare class CreateReviewInput {
    courseId: string;
    rating: number;
    comment?: string;
}
export declare class UpdateReviewInput {
    reviewId: string;
    rating?: number;
    comment?: string;
}
export declare class GetReviewsInput {
    courseId: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'recent' | 'helpful' | 'rating';
    filterByRating?: number;
}
