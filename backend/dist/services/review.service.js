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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewService = class ReviewService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(userId, input) {
        const { productId, orderId, rating, title, comment, images } = input;
        if (rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const existingReview = await this.prisma.productReview.findFirst({
            where: {
                productId,
                userId,
            },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('You have already reviewed this product');
        }
        let isVerifiedPurchase = false;
        if (orderId) {
            const order = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                    status: 'DELIVERED',
                    items: {
                        some: {
                            productId,
                        },
                    },
                },
            });
            if (order) {
                isVerifiedPurchase = true;
            }
        }
        const review = await this.prisma.productReview.create({
            data: {
                productId,
                userId,
                orderId,
                rating,
                title,
                comment,
                images: images || [],
                isVerifiedPurchase,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        await this.updateProductRatingStats(productId);
        return review;
    }
    async getReviews(input) {
        const { productId, userId, rating, isVerified, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = input;
        const skip = (page - 1) * limit;
        const where = {};
        if (productId)
            where.productId = productId;
        if (userId)
            where.userId = userId;
        if (rating)
            where.rating = rating;
        if (isVerified !== undefined)
            where.isVerifiedPurchase = isVerified;
        const orderBy = {};
        if (sortBy === 'helpful') {
            orderBy.helpfulCount = sortOrder;
        }
        else if (sortBy === 'rating') {
            orderBy.rating = sortOrder;
        }
        else {
            orderBy.createdAt = sortOrder;
        }
        const [items, total] = await Promise.all([
            this.prisma.productReview.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
            this.prisma.productReview.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            items,
            total,
            page,
            pageSize: limit,
            totalPages,
            hasMore: page < totalPages,
        };
    }
    async getReviewById(id) {
        const review = await this.prisma.productReview.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async updateReview(reviewId, userId, input) {
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        if (input.rating && (input.rating < 1 || input.rating > 5)) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        const updated = await this.prisma.productReview.update({
            where: { id: reviewId },
            data: {
                ...input,
                updatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        if (input.rating) {
            await this.updateProductRatingStats(review.productId);
        }
        return updated;
    }
    async deleteReview(reviewId, userId, isAdmin = false) {
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (!isAdmin && review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.prisma.productReview.delete({
            where: { id: reviewId },
        });
        await this.updateProductRatingStats(review.productId);
        return { success: true, message: 'Review deleted successfully' };
    }
    async markHelpful(userId, input) {
        const { reviewId, helpful } = input;
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        const existingVote = await this.prisma.reviewHelpful.findUnique({
            where: {
                userId_reviewId: {
                    userId,
                    reviewId,
                },
            },
        });
        if (existingVote) {
            await this.prisma.reviewHelpful.update({
                where: {
                    userId_reviewId: {
                        userId,
                        reviewId,
                    },
                },
                data: { helpful },
            });
        }
        else {
            await this.prisma.reviewHelpful.create({
                data: {
                    userId,
                    reviewId,
                    helpful,
                },
            });
        }
        const helpfulCount = await this.prisma.reviewHelpful.count({
            where: {
                reviewId,
                helpful: true,
            },
        });
        await this.prisma.productReview.update({
            where: { id: reviewId },
            data: { helpfulCount },
        });
        return { success: true, helpfulCount };
    }
    async getProductRatingSummary(productId) {
        const reviews = await this.prisma.productReview.findMany({
            where: { productId },
            select: { rating: true },
        });
        const total = reviews.length;
        if (total === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: {
                    rating5: 0,
                    rating4: 0,
                    rating3: 0,
                    rating2: 0,
                    rating1: 0,
                },
            };
        }
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = sum / total;
        const distribution = reviews.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
        }, {});
        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: total,
            ratingDistribution: {
                rating5: distribution[5] || 0,
                rating4: distribution[4] || 0,
                rating3: distribution[3] || 0,
                rating2: distribution[2] || 0,
                rating1: distribution[1] || 0,
            },
        };
    }
    async updateProductRatingStats(productId) {
        const summary = await this.getProductRatingSummary(productId);
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                attributes: {
                    averageRating: summary.averageRating,
                    totalReviews: summary.totalReviews,
                },
            },
        });
    }
    async canReview(userId, productId) {
        const existingReview = await this.prisma.productReview.findFirst({
            where: { productId, userId },
        });
        if (existingReview) {
            return {
                canReview: false,
                reason: 'Already reviewed',
            };
        }
        const hasPurchased = await this.prisma.order.findFirst({
            where: {
                userId,
                status: 'DELIVERED',
                items: {
                    some: { productId },
                },
            },
        });
        return {
            canReview: true,
            isVerifiedPurchase: !!hasPurchased,
        };
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map