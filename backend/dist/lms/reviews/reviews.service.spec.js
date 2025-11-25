"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const reviews_service_1 = require("./reviews.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
describe('ReviewsService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        review: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        enrollment: {
            findFirst: jest.fn(),
        },
        course: {
            update: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                reviews_service_1.ReviewsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(reviews_service_1.ReviewsService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createReview', () => {
        it('should create a review for enrolled user', async () => {
            const userId = 'user-1';
            const createInput = {
                courseId: 'course-1',
                rating: 5,
                comment: 'Great course!',
            };
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId: 'course-1',
            };
            const mockReview = {
                id: 'review-1',
                courseId: 'course-1',
                userId,
                rating: 5,
                comment: 'Great course!',
                user: {
                    id: userId,
                    username: 'john',
                },
            };
            mockPrismaService.enrollment.findFirst.mockResolvedValue(mockEnrollment);
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            mockPrismaService.review.create.mockResolvedValue(mockReview);
            mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
            mockPrismaService.course.update.mockResolvedValue({});
            const result = await service.createReview(userId, createInput);
            expect(result).toEqual(mockReview);
            expect(mockPrismaService.review.create).toHaveBeenCalledWith({
                data: {
                    courseId: 'course-1',
                    userId,
                    rating: 5,
                    comment: 'Great course!',
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
        });
        it('should throw BadRequestException if user not enrolled', async () => {
            mockPrismaService.enrollment.findFirst.mockResolvedValue(null);
            await expect(service.createReview('user-1', { courseId: 'course-1', rating: 5 })).rejects.toThrow(new common_1.BadRequestException('You must be enrolled in this course to leave a review'));
        });
        it('should throw BadRequestException if user already reviewed', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                courseId: 'course-1',
            };
            const existingReview = {
                id: 'review-1',
                userId: 'user-1',
                courseId: 'course-1',
            };
            mockPrismaService.enrollment.findFirst.mockResolvedValue(mockEnrollment);
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            await expect(service.createReview('user-1', { courseId: 'course-1', rating: 5 })).rejects.toThrow(new common_1.BadRequestException('You have already reviewed this course. Use update instead.'));
        });
        it('should update course rating after creating review', async () => {
            const mockEnrollment = { id: 'enrollment-1', userId: 'user-1', courseId: 'course-1' };
            const mockReview = { id: 'review-1', rating: 5 };
            mockPrismaService.enrollment.findFirst.mockResolvedValue(mockEnrollment);
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            mockPrismaService.review.create.mockResolvedValue(mockReview);
            mockPrismaService.review.findMany.mockResolvedValue([mockReview]);
            mockPrismaService.course.update.mockResolvedValue({});
            await service.createReview('user-1', { courseId: 'course-1', rating: 5 });
            expect(mockPrismaService.course.update).toHaveBeenCalledWith({
                where: { id: 'course-1' },
                data: expect.objectContaining({
                    avgRating: 5,
                    reviewCount: 1,
                }),
            });
        });
    });
    describe('updateReview', () => {
        it('should update a review', async () => {
            const userId = 'user-1';
            const updateInput = {
                reviewId: 'review-1',
                rating: 4,
                comment: 'Updated comment',
            };
            const existingReview = {
                id: 'review-1',
                userId,
                courseId: 'course-1',
                rating: 5,
            };
            const updatedReview = {
                ...existingReview,
                rating: 4,
                comment: 'Updated comment',
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.update.mockResolvedValue(updatedReview);
            mockPrismaService.review.findMany.mockResolvedValue([updatedReview]);
            mockPrismaService.course.update.mockResolvedValue({});
            const result = await service.updateReview(userId, updateInput);
            expect(result.rating).toBe(4);
            expect(result.comment).toBe('Updated comment');
            expect(mockPrismaService.review.update).toHaveBeenCalledWith({
                where: { id: 'review-1' },
                data: {
                    rating: 4,
                    comment: 'Updated comment',
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
        });
        it('should throw NotFoundException if review not found', async () => {
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            await expect(service.updateReview('user-1', { reviewId: 'non-existent', rating: 5 })).rejects.toThrow(new common_1.NotFoundException('Review not found'));
        });
        it('should throw ForbiddenException if user is not review owner', async () => {
            const existingReview = {
                id: 'review-1',
                userId: 'different-user',
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            await expect(service.updateReview('user-1', { reviewId: 'review-1', rating: 5 })).rejects.toThrow(new common_1.ForbiddenException('You can only update your own reviews'));
        });
        it('should update course rating if rating changed', async () => {
            const existingReview = {
                id: 'review-1',
                userId: 'user-1',
                courseId: 'course-1',
                rating: 5,
            };
            const updatedReview = { ...existingReview, rating: 3 };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.update.mockResolvedValue(updatedReview);
            mockPrismaService.review.findMany.mockResolvedValue([updatedReview]);
            mockPrismaService.course.update.mockResolvedValue({});
            await service.updateReview('user-1', { reviewId: 'review-1', rating: 3 });
            expect(mockPrismaService.course.update).toHaveBeenCalled();
        });
    });
    describe('deleteReview', () => {
        it('should delete a review', async () => {
            const userId = 'user-1';
            const existingReview = {
                id: 'review-1',
                userId,
                courseId: 'course-1',
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.delete.mockResolvedValue(existingReview);
            mockPrismaService.review.findMany.mockResolvedValue([]);
            mockPrismaService.course.update.mockResolvedValue({});
            const result = await service.deleteReview(userId, 'review-1');
            expect(result).toBe(true);
            expect(mockPrismaService.review.delete).toHaveBeenCalledWith({
                where: { id: 'review-1' },
            });
        });
        it('should throw NotFoundException if review not found', async () => {
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            await expect(service.deleteReview('user-1', 'non-existent')).rejects.toThrow(new common_1.NotFoundException('Review not found'));
        });
        it('should throw ForbiddenException if user is not review owner', async () => {
            const existingReview = {
                id: 'review-1',
                userId: 'different-user',
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            await expect(service.deleteReview('user-1', 'review-1')).rejects.toThrow(new common_1.ForbiddenException('You can only delete your own reviews'));
        });
        it('should update course rating after deleting review', async () => {
            const existingReview = {
                id: 'review-1',
                userId: 'user-1',
                courseId: 'course-1',
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.delete.mockResolvedValue(existingReview);
            mockPrismaService.review.findMany.mockResolvedValue([]);
            mockPrismaService.course.update.mockResolvedValue({});
            await service.deleteReview('user-1', 'review-1');
            expect(mockPrismaService.course.update).toHaveBeenCalled();
        });
    });
    describe('getReviews', () => {
        it('should return paginated reviews with stats', async () => {
            const input = {
                courseId: 'course-1',
                page: 1,
                pageSize: 10,
                sortBy: 'recent',
            };
            const mockReviews = [
                { id: 'review-1', rating: 5, comment: 'Great!' },
                { id: 'review-2', rating: 4, comment: 'Good' },
            ];
            mockPrismaService.review.findMany.mockResolvedValueOnce(mockReviews).mockResolvedValueOnce(mockReviews);
            mockPrismaService.review.count.mockResolvedValue(2);
            const result = await service.getReviews(input);
            expect(result.reviews).toEqual(mockReviews);
            expect(result.total).toBe(2);
            expect(result.stats).toBeDefined();
            expect(result.stats.avgRating).toBe(4.5);
        });
        it('should filter by rating', async () => {
            const input = {
                courseId: 'course-1',
                filterByRating: 5,
            };
            mockPrismaService.review.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
            mockPrismaService.review.count.mockResolvedValue(0);
            await service.getReviews(input);
            expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    courseId: 'course-1',
                    rating: 5,
                }),
            }));
        });
        it('should sort by helpful count', async () => {
            const input = {
                courseId: 'course-1',
                sortBy: 'helpful',
            };
            mockPrismaService.review.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
            mockPrismaService.review.count.mockResolvedValue(0);
            await service.getReviews(input);
            expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { helpfulCount: 'desc' },
            }));
        });
    });
    describe('getReviewStats', () => {
        it('should calculate review statistics correctly', async () => {
            const mockReviews = [
                { rating: 5 },
                { rating: 5 },
                { rating: 4 },
                { rating: 3 },
                { rating: 1 },
            ];
            mockPrismaService.review.findMany.mockResolvedValue(mockReviews);
            const result = await service.getReviewStats('course-1');
            expect(result.totalReviews).toBe(5);
            expect(result.avgRating).toBe(3.6);
            expect(result.fiveStars).toBe(2);
            expect(result.fourStars).toBe(1);
            expect(result.threeStars).toBe(1);
            expect(result.twoStars).toBe(0);
            expect(result.oneStar).toBe(1);
        });
        it('should return zero stats for course with no reviews', async () => {
            mockPrismaService.review.findMany.mockResolvedValue([]);
            const result = await service.getReviewStats('course-1');
            expect(result.totalReviews).toBe(0);
            expect(result.avgRating).toBe(0);
            expect(result.fiveStars).toBe(0);
        });
    });
    describe('getUserReview', () => {
        it('should return user review for a course', async () => {
            const mockReview = {
                id: 'review-1',
                userId: 'user-1',
                courseId: 'course-1',
                rating: 5,
            };
            mockPrismaService.review.findUnique.mockResolvedValue(mockReview);
            const result = await service.getUserReview('user-1', 'course-1');
            expect(result).toEqual(mockReview);
            expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
                where: {
                    courseId_userId: {
                        courseId: 'course-1',
                        userId: 'user-1',
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
        });
        it('should return null if user has not reviewed the course', async () => {
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            const result = await service.getUserReview('user-1', 'course-1');
            expect(result).toBeNull();
        });
    });
    describe('markReviewHelpful', () => {
        it('should add helpful vote if not already voted', async () => {
            const userId = 'user-1';
            const existingReview = {
                id: 'review-1',
                helpfulVoters: [],
                helpfulCount: 0,
            };
            const updatedReview = {
                ...existingReview,
                helpfulVoters: [userId],
                helpfulCount: 1,
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.update.mockResolvedValue(updatedReview);
            const result = await service.markReviewHelpful(userId, 'review-1');
            expect(result.helpfulCount).toBe(1);
            expect(result.helpfulVoters).toContain(userId);
            expect(mockPrismaService.review.update).toHaveBeenCalledWith({
                where: { id: 'review-1' },
                data: {
                    helpfulVoters: [userId],
                    helpfulCount: 1,
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
        });
        it('should remove helpful vote if already voted (toggle)', async () => {
            const userId = 'user-1';
            const existingReview = {
                id: 'review-1',
                helpfulVoters: [userId, 'user-2'],
                helpfulCount: 2,
            };
            const updatedReview = {
                ...existingReview,
                helpfulVoters: ['user-2'],
                helpfulCount: 1,
            };
            mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
            mockPrismaService.review.update.mockResolvedValue(updatedReview);
            const result = await service.markReviewHelpful(userId, 'review-1');
            expect(result.helpfulCount).toBe(1);
            expect(result.helpfulVoters).not.toContain(userId);
            expect(mockPrismaService.review.update).toHaveBeenCalledWith({
                where: { id: 'review-1' },
                data: {
                    helpfulVoters: ['user-2'],
                    helpfulCount: 1,
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
        });
        it('should throw NotFoundException if review not found', async () => {
            mockPrismaService.review.findUnique.mockResolvedValue(null);
            await expect(service.markReviewHelpful('user-1', 'non-existent')).rejects.toThrow(new common_1.NotFoundException('Review not found'));
        });
    });
});
//# sourceMappingURL=reviews.service.spec.js.map