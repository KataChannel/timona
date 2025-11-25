import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewInput, UpdateReviewInput, GetReviewsInput } from './dto/review.input';
import { Review, ReviewStats, ReviewsWithStats } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review for a course
   * User must be enrolled in the course to leave a review
   */
  async createReview(userId: string, input: CreateReviewInput): Promise<Review> {
    const { courseId, rating, comment } = input;

    // Check if user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You must be enrolled in this course to leave a review');
    }

    // Check if user already reviewed this course
    const existingReview = await this.prisma.review.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this course. Use update instead.');
    }

    // Create the review
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

    // Update course average rating
    await this.updateCourseRating(courseId);

    return review as any;
  }

  /**
   * Update an existing review
   */
  async updateReview(userId: string, input: UpdateReviewInput): Promise<Review> {
    const { reviewId, rating, comment } = input;

    // Check if review exists and belongs to user
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update the review
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

    // Update course average rating if rating changed
    if (rating !== undefined) {
      await this.updateCourseRating(existingReview.courseId);
    }

    return review as any;
  }

  /**
   * Delete a review
   */
  async deleteReview(userId: string, reviewId: string): Promise<boolean> {
    // Check if review exists and belongs to user
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const courseId = existingReview.courseId;

    // Delete the review
    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update course average rating
    await this.updateCourseRating(courseId);

    return true;
  }

  /**
   * Get reviews for a course with pagination and filtering
   */
  async getReviews(input: GetReviewsInput): Promise<ReviewsWithStats> {
    const { courseId, page = 1, pageSize = 10, sortBy = 'recent', filterByRating } = input;

    // Build where clause
    const where: any = { courseId };
    if (filterByRating) {
      where.rating = filterByRating;
    }

    // Build order by clause
    let orderBy: any = {};
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

    // Get reviews with pagination
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

    // Get review statistics
    const stats = await this.getReviewStats(courseId);

    return {
      reviews: reviews as any,
      stats,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get review statistics for a course
   */
  async getReviewStats(courseId: string): Promise<ReviewStats> {
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
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar,
    };
  }

  /**
   * Get a user's review for a specific course
   */
  async getUserReview(userId: string, courseId: string): Promise<Review | null> {
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

    return review as any;
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(userId: string, reviewId: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user already marked this review as helpful
    const helpfulVoters = review.helpfulVoters || [];
    const hasVoted = helpfulVoters.includes(userId);

    let updatedVoters: string[];
    let updatedCount: number;

    if (hasVoted) {
      // Remove vote (toggle off)
      updatedVoters = helpfulVoters.filter(id => id !== userId);
      updatedCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add vote
      updatedVoters = [...helpfulVoters, userId];
      updatedCount = review.helpfulCount + 1;
    }

    // Update the review
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

    return updatedReview as any;
  }

  /**
   * Update course average rating and review count
   */
  private async updateCourseRating(courseId: string): Promise<void> {
    const stats = await this.getReviewStats(courseId);

    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        avgRating: stats.avgRating,
        reviewCount: stats.totalReviews,
      },
    });
  }
}
