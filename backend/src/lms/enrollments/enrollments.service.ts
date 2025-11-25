import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus, CourseStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    // Check if course exists and is published
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        throw new BadRequestException('Already enrolled in this course');
      }
      // Reactivate if previously dropped
      return this.prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
        },
        include: {
          course: true,
        },
      });
    }

    // Create new enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        course: true,
      },
    });

    // Increment enrollment count
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: { increment: 1 },
      },
    });

    return enrollment;
  }

  async getMyEnrollments(userId: string) {
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

  async getEnrollment(userId: string, courseId: string) {
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

    // Return null instead of throwing error - let frontend handle unenrolled state
    return enrollment;
  }

  async updateProgress(userId: string, courseId: string) {
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
      throw new NotFoundException('Enrollment not found');
    }

    // Calculate total lessons
    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0,
    );

    if (totalLessons === 0) {
      return enrollment;
    }

    // Calculate completed lessons
    const completedLessons = enrollment.lessonProgress.filter(
      (progress) => progress.completed,
    ).length;

    // Calculate progress percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    // Update enrollment
    const updateData: any = {
      progress: progressPercentage,
      lastAccessedAt: new Date(),
    };

    // Mark as completed if 100%
    if (progressPercentage === 100 && !enrollment.completedAt) {
      updateData.status = EnrollmentStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: updateData,
    });
  }

  async dropCourse(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot drop a completed course');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.DROPPED,
      },
    });
  }

  async getCourseEnrollments(courseId: string, instructorId?: string) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check instructor permission if provided
    if (instructorId && course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to view these enrollments');
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

  async markLessonComplete(userId: string, enrollmentId: string, lessonId: string) {
    // Verify enrollment belongs to user
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
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this enrollment');
    }

    // Verify lesson exists in course
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if already completed
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

      // Update to completed
      return this.prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // Create new progress record
    const lessonProgress = await this.prisma.lessonProgress.create({
      data: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Recalculate enrollment progress
    await this.updateEnrollmentProgress(enrollmentId);

    return lessonProgress;
  }

  private async updateEnrollmentProgress(enrollmentId: string) {
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

    if (!enrollment) return;

    // Calculate total lessons
    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );

    if (totalLessons === 0) return;

    // Calculate completed lessons
    const completedLessons = enrollment.lessonProgress.filter(p => p.completed).length;

    const progress = (completedLessons / totalLessons) * 100;

    // Update enrollment
    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        status: progress === 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        completedAt: progress === 100 ? new Date() : null,
      },
    });
  }
}
