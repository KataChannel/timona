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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EnrollmentsService = class EnrollmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enroll(userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.status !== client_1.CourseStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Cannot enroll in unpublished course');
        }
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (existingEnrollment) {
            if (existingEnrollment.status === client_1.EnrollmentStatus.ACTIVE) {
                throw new common_1.BadRequestException('Already enrolled in this course');
            }
            return this.prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    status: client_1.EnrollmentStatus.ACTIVE,
                    enrolledAt: new Date(),
                },
                include: {
                    course: true,
                },
            });
        }
        const enrollment = await this.prisma.enrollment.create({
            data: {
                userId,
                courseId,
                status: client_1.EnrollmentStatus.ACTIVE,
            },
            include: {
                course: true,
            },
        });
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                enrollmentCount: { increment: 1 },
            },
        });
        return enrollment;
    }
    async getMyEnrollments(userId) {
        return this.prisma.enrollment.findMany({
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
    }
    async getEnrollment(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
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
        return enrollment;
    }
    async updateProgress(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
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
                            include: {
                                lessons: true,
                            },
                        },
                    },
                },
                lessonProgress: true,
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        const totalLessons = enrollment.course.modules.reduce((total, module) => total + module.lessons.length, 0);
        if (totalLessons === 0) {
            return enrollment;
        }
        const completedLessons = enrollment.lessonProgress.filter((progress) => progress.completed).length;
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        const updateData = {
            progress: progressPercentage,
            lastAccessedAt: new Date(),
        };
        if (progressPercentage === 100 && !enrollment.completedAt) {
            updateData.status = client_1.EnrollmentStatus.COMPLETED;
            updateData.completedAt = new Date();
        }
        return this.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: updateData,
        });
    }
    async dropCourse(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.status === client_1.EnrollmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot drop a completed course');
        }
        return this.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
                status: client_1.EnrollmentStatus.DROPPED,
            },
        });
    }
    async getCourseEnrollments(courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (instructorId && course.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to view these enrollments');
        }
        return this.prisma.enrollment.findMany({
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
    }
    async markLessonComplete(userId, enrollmentId, lessonId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: true,
                            },
                        },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to update this enrollment');
        }
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        const existingProgress = await this.prisma.lessonProgress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId,
                    lessonId,
                },
            },
        });
        if (existingProgress) {
            if (existingProgress.completed) {
                return existingProgress;
            }
            return this.prisma.lessonProgress.update({
                where: { id: existingProgress.id },
                data: {
                    completed: true,
                    completedAt: new Date(),
                },
            });
        }
        const lessonProgress = await this.prisma.lessonProgress.create({
            data: {
                enrollmentId,
                lessonId,
                completed: true,
                completedAt: new Date(),
            },
        });
        await this.updateEnrollmentProgress(enrollmentId);
        return lessonProgress;
    }
    async updateEnrollmentProgress(enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: true,
                            },
                        },
                    },
                },
                lessonProgress: true,
            },
        });
        if (!enrollment)
            return;
        const totalLessons = enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        if (totalLessons === 0)
            return;
        const completedLessons = enrollment.lessonProgress.filter(p => p.completed).length;
        const progress = (completedLessons / totalLessons) * 100;
        await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                progress,
                status: progress === 100 ? client_1.EnrollmentStatus.COMPLETED : client_1.EnrollmentStatus.ACTIVE,
                completedAt: progress === 100 ? new Date() : null,
            },
        });
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map