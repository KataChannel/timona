"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(userId, input) {
        const { courseId, rating, comment } = input;
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('You must be enrolled in this course to leave a review');
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId,
                },
            },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('You have already reviewed this course. Use update instead.');
        }
        const review = await this.prisma.review.create({
            data: {
                courseId,
                userId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        await this.updateCourseRating(courseId);
        return review;
    }
    async updateReview(userId, input) {
        const { reviewId, rating, comment } = input;
        const existingReview = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!existingReview) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (existingReview.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        const review = await this.prisma.review.update({
            where: { id: reviewId },
            data: {
                ...(rating !== undefined && { rating }),
                ...(comment !== undefined && { comment }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        if (rating !== undefined) {
            await this.updateCourseRating(existingReview.courseId);
        }
        return review;
    }
    async deleteReview(userId, reviewId) {
        const existingReview = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!existingReview) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (existingReview.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        const courseId = existingReview.courseId;
        await this.prisma.review.delete({
            where: { id: reviewId },
        });
        await this.updateCourseRating(courseId);
        return true;
    }
    async getReviews(input) {
        const { courseId, page = 1, pageSize = 10, sortBy = 'recent', filterByRating } = input;
        const where = { courseId };
        if (filterByRating) {
            where.rating = filterByRating;
        }
        let orderBy = {};
        switch (sortBy) {
            case 'helpful':
                orderBy = { helpfulCount: 'desc' };
                break;
            case 'rating':
                orderBy = { rating: 'desc' };
                break;
            case 'recent':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
            this.prisma.review.count({ where }),
        ]);
        const stats = await this.getReviewStats(courseId);
        return {
            reviews: reviews,
            stats,
            total,
            page,
            pageSize,
        };
    }
    async getReviewStats(courseId) {
        const reviews = await this.prisma.review.findMany({
            where: { courseId },
            select: { rating: true },
        });
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        const fiveStars = reviews.filter(r => r.rating === 5).length;
        const fourStars = reviews.filter(r => r.rating === 4).length;
        const threeStars = reviews.filter(r => r.rating === 3).length;
        const twoStars = reviews.filter(r => r.rating === 2).length;
        const oneStar = reviews.filter(r => r.rating === 1).length;
        return {
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews,
            fiveStars,
            fourStars,
            threeStars,
            twoStars,
            oneStar,
        };
    }
    async getUserReview(userId, courseId) {
        const review = await this.prisma.review.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return review;
    }
    async markReviewHelpful(userId, reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        const helpfulVoters = review.helpfulVoters || [];
        const hasVoted = helpfulVoters.includes(userId);
        let updatedVoters;
        let updatedCount;
        if (hasVoted) {
            updatedVoters = helpfulVoters.filter(id => id !== userId);
            updatedCount = Math.max(0, review.helpfulCount - 1);
        }
        else {
            updatedVoters = [...helpfulVoters, userId];
            updatedCount = review.helpfulCount + 1;
        }
        const updatedReview = await this.prisma.review.update({
            where: { id: reviewId },
            data: {
                helpfulVoters: updatedVoters,
                helpfulCount: updatedCount,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return updatedReview;
    }
    async updateCourseRating(courseId) {
        const stats = await this.getReviewStats(courseId);
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                avgRating: stats.avgRating,
                reviewCount: stats.totalReviews,
            },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map