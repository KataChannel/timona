"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const enrollments_service_1 = require("./enrollments.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "ACTIVE";
    EnrollmentStatus["COMPLETED"] = "COMPLETED";
    EnrollmentStatus["DROPPED"] = "DROPPED";
})(EnrollmentStatus || (EnrollmentStatus = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "DRAFT";
    CourseStatus["PUBLISHED"] = "PUBLISHED";
    CourseStatus["ARCHIVED"] = "ARCHIVED";
})(CourseStatus || (CourseStatus = {}));
describe('EnrollmentsService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        course: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        enrollment: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        lessonProgress: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        lesson: {
            findUnique: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                enrollments_service_1.EnrollmentsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(enrollments_service_1.EnrollmentsService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('enroll', () => {
        it('should enroll a user in a published course', async () => {
            const userId = 'user-1';
            const courseId = 'course-1';
            const mockCourse = {
                id: courseId,
                title: 'Test Course',
                status: CourseStatus.PUBLISHED,
            };
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId,
                status: EnrollmentStatus.ACTIVE,
                progress: 0,
                enrolledAt: new Date(),
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            mockPrismaService.enrollment.create.mockResolvedValue(mockEnrollment);
            mockPrismaService.course.update.mockResolvedValue(mockCourse);
            const result = await service.enroll(userId, courseId);
            expect(result).toEqual(mockEnrollment);
            expect(mockPrismaService.enrollment.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    courseId,
                    status: EnrollmentStatus.ACTIVE,
                },
                include: {
                    course: true,
                },
            });
            expect(mockPrismaService.course.update).toHaveBeenCalledWith({
                where: { id: courseId },
                data: {
                    enrollmentCount: { increment: 1 },
                },
            });
        });
        it('should throw NotFoundException if course not found', async () => {
            mockPrismaService.course.findUnique.mockResolvedValue(null);
            await expect(service.enroll('user-1', 'non-existent')).rejects.toThrow(new common_1.NotFoundException('Course not found'));
        });
        it('should throw BadRequestException if course is not published', async () => {
            const mockCourse = {
                id: 'course-1',
                status: CourseStatus.DRAFT,
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            await expect(service.enroll('user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Cannot enroll in unpublished course'));
        });
        it('should throw BadRequestException if already enrolled', async () => {
            const mockCourse = {
                id: 'course-1',
                status: CourseStatus.PUBLISHED,
            };
            const existingEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                courseId: 'course-1',
                status: EnrollmentStatus.ACTIVE,
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockPrismaService.enrollment.findUnique.mockResolvedValue(existingEnrollment);
            await expect(service.enroll('user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Already enrolled in this course'));
        });
        it('should reactivate enrollment if previously dropped', async () => {
            const mockCourse = {
                id: 'course-1',
                status: CourseStatus.PUBLISHED,
            };
            const droppedEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                courseId: 'course-1',
                status: EnrollmentStatus.DROPPED,
            };
            const reactivatedEnrollment = {
                ...droppedEnrollment,
                status: EnrollmentStatus.ACTIVE,
                enrolledAt: new Date(),
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockPrismaService.enrollment.findUnique.mockResolvedValue(droppedEnrollment);
            mockPrismaService.enrollment.update.mockResolvedValue(reactivatedEnrollment);
            const result = await service.enroll('user-1', 'course-1');
            expect(result.status).toBe(EnrollmentStatus.ACTIVE);
            expect(mockPrismaService.enrollment.update).toHaveBeenCalledWith({
                where: { id: droppedEnrollment.id },
                data: {
                    status: EnrollmentStatus.ACTIVE,
                    enrolledAt: expect.any(Date),
                },
                include: {
                    course: true,
                },
            });
        });
    });
    describe('getMyEnrollments', () => {
        it('should return all enrollments for a user', async () => {
            const userId = 'user-1';
            const mockEnrollments = [
                {
                    id: 'enrollment-1',
                    userId,
                    courseId: 'course-1',
                    status: EnrollmentStatus.ACTIVE,
                    progress: 50,
                },
                {
                    id: 'enrollment-2',
                    userId,
                    courseId: 'course-2',
                    status: EnrollmentStatus.COMPLETED,
                    progress: 100,
                },
            ];
            mockPrismaService.enrollment.findMany.mockResolvedValue(mockEnrollments);
            const result = await service.getMyEnrollments(userId);
            expect(result).toEqual(mockEnrollments);
            expect(mockPrismaService.enrollment.findMany).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    course: {
                        include: {
                            instructor: {
                                select: {
                                    id: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                            category: true,
                        },
                    },
                },
                orderBy: { enrolledAt: 'desc' },
            });
        });
    });
    describe('getEnrollment', () => {
        it('should return a specific enrollment with progress', async () => {
            const userId = 'user-1';
            const courseId = 'course-1';
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId,
                status: EnrollmentStatus.ACTIVE,
                progress: 50,
                course: {
                    id: courseId,
                    title: 'Test Course',
                    modules: [],
                },
                lessonProgress: [],
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            const result = await service.getEnrollment(userId, courseId);
            expect(result).toEqual(mockEnrollment);
            expect(mockPrismaService.enrollment.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    },
                },
                include: {
                    course: {
                        include: {
                            modules: {
                                orderBy: { order: 'asc' },
                                include: {
                                    lessons: {
                                        orderBy: { order: 'asc' },
                                    },
                                },
                            },
                        },
                    },
                    lessonProgress: {
                        include: {
                            lesson: true,
                        },
                    },
                },
            });
        });
        it('should return null if enrollment not found', async () => {
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            const result = await service.getEnrollment('user-1', 'course-1');
            expect(result).toBeNull();
        });
    });
    describe('updateProgress', () => {
        it('should update enrollment progress based on completed lessons', async () => {
            const userId = 'user-1';
            const courseId = 'course-1';
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId,
                status: EnrollmentStatus.ACTIVE,
                progress: 0,
                course: {
                    modules: [
                        {
                            id: 'module-1',
                            lessons: [
                                { id: 'lesson-1' },
                                { id: 'lesson-2' },
                                { id: 'lesson-3' },
                                { id: 'lesson-4' },
                            ],
                        },
                    ],
                },
                lessonProgress: [
                    { id: 'progress-1', lessonId: 'lesson-1', completed: true },
                    { id: 'progress-2', lessonId: 'lesson-2', completed: true },
                ],
            };
            const updatedEnrollment = {
                ...mockEnrollment,
                progress: 50,
                lastAccessedAt: expect.any(Date),
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.enrollment.update.mockResolvedValue(updatedEnrollment);
            const result = await service.updateProgress(userId, courseId);
            expect(result.progress).toBe(50);
            expect(mockPrismaService.enrollment.update).toHaveBeenCalledWith({
                where: { id: mockEnrollment.id },
                data: {
                    progress: 50,
                    lastAccessedAt: expect.any(Date),
                },
            });
        });
        it('should mark enrollment as completed when 100% progress', async () => {
            const userId = 'user-1';
            const courseId = 'course-1';
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId,
                status: EnrollmentStatus.ACTIVE,
                progress: 75,
                completedAt: null,
                course: {
                    modules: [
                        {
                            id: 'module-1',
                            lessons: [
                                { id: 'lesson-1' },
                                { id: 'lesson-2' },
                            ],
                        },
                    ],
                },
                lessonProgress: [
                    { id: 'progress-1', lessonId: 'lesson-1', completed: true },
                    { id: 'progress-2', lessonId: 'lesson-2', completed: true },
                ],
            };
            const completedEnrollment = {
                ...mockEnrollment,
                progress: 100,
                status: EnrollmentStatus.COMPLETED,
                completedAt: expect.any(Date),
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.enrollment.update.mockResolvedValue(completedEnrollment);
            const result = await service.updateProgress(userId, courseId);
            expect(result.progress).toBe(100);
            expect(mockPrismaService.enrollment.update).toHaveBeenCalledWith({
                where: { id: mockEnrollment.id },
                data: {
                    progress: 100,
                    status: EnrollmentStatus.COMPLETED,
                    completedAt: expect.any(Date),
                    lastAccessedAt: expect.any(Date),
                },
            });
        });
        it('should throw NotFoundException if enrollment not found', async () => {
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            await expect(service.updateProgress('user-1', 'course-1')).rejects.toThrow(new common_1.NotFoundException('Enrollment not found'));
        });
        it('should return enrollment unchanged if course has no lessons', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                courseId: 'course-1',
                course: {
                    modules: [],
                },
                lessonProgress: [],
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            const result = await service.updateProgress('user-1', 'course-1');
            expect(result).toEqual(mockEnrollment);
            expect(mockPrismaService.enrollment.update).not.toHaveBeenCalled();
        });
    });
    describe('dropCourse', () => {
        it('should drop an active enrollment', async () => {
            const userId = 'user-1';
            const courseId = 'course-1';
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId,
                status: EnrollmentStatus.ACTIVE,
            };
            const droppedEnrollment = {
                ...mockEnrollment,
                status: EnrollmentStatus.DROPPED,
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.enrollment.update.mockResolvedValue(droppedEnrollment);
            const result = await service.dropCourse(userId, courseId);
            expect(result.status).toBe(EnrollmentStatus.DROPPED);
            expect(mockPrismaService.enrollment.update).toHaveBeenCalledWith({
                where: { id: mockEnrollment.id },
                data: {
                    status: EnrollmentStatus.DROPPED,
                },
            });
        });
        it('should throw NotFoundException if enrollment not found', async () => {
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            await expect(service.dropCourse('user-1', 'course-1')).rejects.toThrow(new common_1.NotFoundException('Enrollment not found'));
        });
        it('should throw BadRequestException if trying to drop completed course', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                status: EnrollmentStatus.COMPLETED,
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            await expect(service.dropCourse('user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Cannot drop a completed course'));
        });
    });
    describe('getCourseEnrollments', () => {
        it('should return all enrollments for a course', async () => {
            const courseId = 'course-1';
            const instructorId = 'instructor-1';
            const mockCourse = {
                id: courseId,
                instructorId,
            };
            const mockEnrollments = [
                { id: 'enrollment-1', courseId, userId: 'user-1' },
                { id: 'enrollment-2', courseId, userId: 'user-2' },
            ];
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockPrismaService.enrollment.findMany.mockResolvedValue(mockEnrollments);
            const result = await service.getCourseEnrollments(courseId, instructorId);
            expect(result).toEqual(mockEnrollments);
            expect(mockPrismaService.enrollment.findMany).toHaveBeenCalledWith({
                where: { courseId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { enrolledAt: 'desc' },
            });
        });
        it('should throw NotFoundException if course not found', async () => {
            mockPrismaService.course.findUnique.mockResolvedValue(null);
            await expect(service.getCourseEnrollments('course-1')).rejects.toThrow(new common_1.NotFoundException('Course not found'));
        });
        it('should throw ForbiddenException if user is not course instructor', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'instructor-1',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            await expect(service.getCourseEnrollments('course-1', 'different-user')).rejects.toThrow(new common_1.ForbiddenException('You do not have permission to view these enrollments'));
        });
    });
    describe('markLessonComplete', () => {
        it('should mark a lesson as complete', async () => {
            const userId = 'user-1';
            const enrollmentId = 'enrollment-1';
            const lessonId = 'lesson-1';
            const mockEnrollment = {
                id: enrollmentId,
                userId,
                courseId: 'course-1',
                course: {
                    modules: [
                        {
                            id: 'module-1',
                            lessons: [{ id: lessonId }],
                        },
                    ],
                },
                lessonProgress: [],
            };
            const mockLesson = {
                id: lessonId,
                title: 'Lesson 1',
            };
            const mockProgress = {
                id: 'progress-1',
                enrollmentId,
                lessonId,
                completed: true,
                completedAt: new Date(),
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.lessonProgress.findUnique.mockResolvedValue(null);
            mockPrismaService.lessonProgress.create.mockResolvedValue(mockProgress);
            mockPrismaService.enrollment.findUnique.mockResolvedValueOnce({
                ...mockEnrollment,
                lessonProgress: [mockProgress],
            });
            mockPrismaService.enrollment.update.mockResolvedValue({});
            const result = await service.markLessonComplete(userId, enrollmentId, lessonId);
            expect(result).toEqual(mockProgress);
            expect(mockPrismaService.lessonProgress.create).toHaveBeenCalledWith({
                data: {
                    enrollmentId,
                    lessonId,
                    completed: true,
                    completedAt: expect.any(Date),
                },
            });
        });
        it('should throw NotFoundException if enrollment not found', async () => {
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            await expect(service.markLessonComplete('user-1', 'enrollment-1', 'lesson-1')).rejects.toThrow(new common_1.NotFoundException('Enrollment not found'));
        });
        it('should throw ForbiddenException if enrollment does not belong to user', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'different-user',
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            await expect(service.markLessonComplete('user-1', 'enrollment-1', 'lesson-1')).rejects.toThrow(new common_1.ForbiddenException('Not authorized to update this enrollment'));
        });
        it('should throw NotFoundException if lesson not found', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                course: { modules: [] },
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.lesson.findUnique.mockResolvedValue(null);
            await expect(service.markLessonComplete('user-1', 'enrollment-1', 'lesson-1')).rejects.toThrow(new common_1.NotFoundException('Lesson not found'));
        });
        it('should return existing progress if lesson already completed', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                course: { modules: [] },
            };
            const mockLesson = { id: 'lesson-1' };
            const existingProgress = {
                id: 'progress-1',
                completed: true,
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.lessonProgress.findUnique.mockResolvedValue(existingProgress);
            const result = await service.markLessonComplete('user-1', 'enrollment-1', 'lesson-1');
            expect(result).toEqual(existingProgress);
            expect(mockPrismaService.lessonProgress.create).not.toHaveBeenCalled();
        });
        it('should update incomplete progress to complete', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                course: { modules: [{ lessons: [] }] },
            };
            const mockLesson = { id: 'lesson-1' };
            const incompleteProgress = {
                id: 'progress-1',
                completed: false,
            };
            const completedProgress = {
                ...incompleteProgress,
                completed: true,
                completedAt: new Date(),
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.lessonProgress.findUnique.mockResolvedValue(incompleteProgress);
            mockPrismaService.lessonProgress.update.mockResolvedValue(completedProgress);
            const result = await service.markLessonComplete('user-1', 'enrollment-1', 'lesson-1');
            expect(result.completed).toBe(true);
            expect(mockPrismaService.lessonProgress.update).toHaveBeenCalledWith({
                where: { id: incompleteProgress.id },
                data: {
                    completed: true,
                    completedAt: expect.any(Date),
                },
            });
        });
    });
});
//# sourceMappingURL=enrollments.service.spec.js.map