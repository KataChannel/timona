import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface GetReviewsInput {
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewHelpfulInput {
  reviewId: string;
  helpful: boolean;
}

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review
   */
  async createReview(userId: string, input: CreateReviewInput) {
    const { productId, orderId, rating, title, comment, images } = input;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.productReview.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Check if purchase is verified (if orderId provided)
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

    // Create review
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

    // Update product rating stats
    await this.updateProductRatingStats(productId);

    return review;
  }

  /**
   * Get reviews with filters
   */
  async getReviews(input: GetReviewsInput) {
    const {
      productId,
      userId,
      rating,
      isVerified,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = input;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (rating) where.rating = rating;
    if (isVerified !== undefined) where.isVerifiedPurchase = isVerified;

    const orderBy: any = {};
    if (sortBy === 'helpful') {
      orderBy.helpfulCount = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else {
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

  /**
   * Get review by ID
   */
  async getReviewById(id: string) {
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
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Update review (only by owner)
   */
  async updateReview(reviewId: string, userId: string, input: UpdateReviewInput) {
    // Check ownership
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (input.rating && (input.rating < 1 || input.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
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

    // Update product rating stats if rating changed
    if (input.rating) {
      await this.updateProductRatingStats(review.productId);
    }

    return updated;
  }

  /**
   * Delete review (only by owner or admin)
   */
  async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.productReview.delete({
      where: { id: reviewId },
    });

    // Update product rating stats
    await this.updateProductRatingStats(review.productId);

    return { success: true, message: 'Review deleted successfully' };
  }

  /**
   * Mark review as helpful/not helpful
   */
  async markHelpful(userId: string, input: ReviewHelpfulInput) {
    const { reviewId, helpful } = input;

    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already voted
    const existingVote = await this.prisma.reviewHelpful.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (existingVote) {
      // Update vote
      await this.prisma.reviewHelpful.update({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
        data: { helpful },
      });
    } else {
      // Create vote
      await this.prisma.reviewHelpful.create({
        data: {
          userId,
          reviewId,
          helpful,
        },
      });
    }

    // Recalculate helpful count
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

  /**
   * Get product rating summary
   */
  async getProductRatingSummary(productId: string) {
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

    const distribution = reviews.reduce(
      (acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

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

  /**
   * Update product rating stats (internal)
   */
  private async updateProductRatingStats(productId: string) {
    const summary = await this.getProductRatingSummary(productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        // Store in attributes JSON for now
        attributes: {
          averageRating: summary.averageRating,
          totalReviews: summary.totalReviews,
        },
      },
    });
  }

  /**
   * Check if user can review product
   */
  async canReview(userId: string, productId: string) {
    // Check if already reviewed
    const existingReview = await this.prisma.productReview.findFirst({
      where: { productId, userId },
    });

    if (existingReview) {
      return {
        canReview: false,
        reason: 'Already reviewed',
      };
    }

    // Check if purchased
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
}
