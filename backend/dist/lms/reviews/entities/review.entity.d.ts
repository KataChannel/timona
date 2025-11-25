export declare class ReviewUser {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}
export declare class Review {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
    comment?: string;
    helpfulCount: number;
    helpfulVoters: string[];
    createdAt: Date;
    updatedAt: Date;
    user?: ReviewUser;
}
export declare class ReviewStats {
    avgRating: number;
    totalReviews: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
}
export declare class ReviewsWithStats {
    reviews: Review[];
    stats: ReviewStats;
    total: number;
    page: number;
    pageSize: number;
}
