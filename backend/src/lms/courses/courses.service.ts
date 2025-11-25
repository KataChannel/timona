import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CourseFiltersInput } from './dto/course-filters.input';
import { CreateModuleInput, UpdateModuleInput, ReorderModulesInput } from './dto/module.input';
import { CreateLessonInput, UpdateLessonInput, ReorderLessonsInput } from './dto/lesson.input';
import { Prisma, CourseStatus } from '@prisma/client';
import { NotificationService } from '../../services/notification.service';
import { PushNotificationService } from '../../services/push-notification.service';
import slugify from 'slugify';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async create(userId: string, createCourseInput: CreateCourseInput) {
    const { title, categoryId, ...rest } = createCourseInput;
    
    // Generate slug from title
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await this.prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await this.prisma.courseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    return this.prisma.course.create({
      data: {
        ...rest,
        title,
        slug,
        instructorId: userId,
        categoryId,
      },
      include: {
        instructor: true,
        category: true,
      },
    });
  }

  async findAll(filters: CourseFiltersInput) {
    const { 
      search, 
      categoryId, 
      level, 
      status, 
      minPrice, 
      maxPrice, 
      instructorId,
      tags,
      page, 
      limit, 
      sortBy, 
      sortOrder 
    } = filters;

    const where: Prisma.CourseWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    // Tags filter removed - field doesn't exist in schema

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
          _count: {
            select: {
              sourceDocuments: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    // Map courses to include sourceDocumentsCount
    const coursesWithCount = courses.map(course => ({
      ...course,
      sourceDocumentsCount: course._count.sourceDocuments,
    }));

    return {
      data: coursesWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
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
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            sourceDocuments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      ...course,
      sourceDocumentsCount: course._count.sourceDocuments,
    };
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
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
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            sourceDocuments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    return {
      ...course,
      sourceDocumentsCount: course._count.sourceDocuments,
    };
  }

  async update(id: string, userId: string, updateCourseInput: UpdateCourseInput) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if user is the instructor or admin
    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this course');
    }

    const { id: _, categoryId, ...rest } = updateCourseInput;

    // Validate category exists if provided
    if (categoryId) {
      const category = await this.prisma.courseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...rest,
        categoryId,
      },
      include: {
        instructor: true,
        category: true,
      },
    });
  }

  async publish(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to publish this course');
    }

    // Validation: Course must have at least one module with lessons
    if (course.modules.length === 0) {
      throw new BadRequestException('Course must have at least one module before publishing');
    }

    const hasLessons = course.modules.some(module => module.lessons.length > 0);
    if (!hasLessons) {
      throw new BadRequestException('Course must have at least one lesson before publishing');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.PUBLISHED,
      },
    });
  }

  async archive(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to archive this course');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.ARCHIVED,
      },
    });
  }

  // ============== Approval Workflow ==============

  /**
   * Request approval for a course (Instructor -> Admin)
   */
  async requestApproval(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to request approval for this course');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new BadRequestException('Only draft courses can be submitted for approval');
    }

    if (course.approvalRequested) {
      throw new BadRequestException('Approval already requested for this course');
    }

    // Validation: Course must have at least one module with lessons
    if (course.modules.length === 0) {
      throw new BadRequestException('Course must have at least one module before requesting approval');
    }

    const hasLessons = course.modules.some(module => module.lessons.length > 0);
    if (!hasLessons) {
      throw new BadRequestException('Course must have at least one lesson before requesting approval');
    }

    // Update course
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        approvalRequested: true,
        approvalRequestedAt: new Date(),
      },
    });

    // Get instructor info
    const instructor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, firstName: true, lastName: true },
    });

    const instructorName = instructor?.firstName && instructor?.lastName
      ? `${instructor.firstName} ${instructor.lastName}`
      : instructor?.username || 'Giảng viên';

    // Send notification to all admins
    const admins = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'ADMIN',
            },
          },
        },
      },
      select: { id: true },
    });

    // Send notification and push to each admin
    for (const admin of admins) {
      try {
        await this.notificationService.create({
          userId: admin.id,
          title: 'Yêu cầu phê duyệt khóa học',
          message: `${instructorName} đã gửi yêu cầu phê duyệt khóa học "${updated.title}"`,
          type: 'SYSTEM',
          data: {
            courseId: updated.id,
            courseTitle: updated.title,
            courseSlug: updated.slug,
            instructorId: userId,
            instructorName,
            type: 'course_approval_request',
          },
        });

        // Send push notification
        await this.pushNotificationService.sendToUser(admin.id, {
          title: 'Yêu cầu phê duyệt khóa học',
          message: `${instructorName} đã gửi yêu cầu phê duyệt khóa học "${updated.title}"`,
          url: `/admin/lms/courses/approvals`,
          data: {
            courseId: updated.id,
            type: 'course_approval_request',
          },
        });
      } catch (error) {
        console.error(`Failed to notify admin ${admin.id}:`, error);
      }
    }

    return updated;
  }

  /**
   * Approve a course (Admin only)
   */
  async approveCourse(courseId: string, adminUserId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (!course.approvalRequested) {
      throw new BadRequestException('No approval request found for this course');
    }

    if (course.status === CourseStatus.PUBLISHED) {
      throw new BadRequestException('Course is already published');
    }

    // Update course to PUBLISHED
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
        approvedBy: adminUserId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Reject a course approval request (Admin only)
   */
  async rejectCourse(courseId: string, adminUserId: string, reason: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (!course.approvalRequested) {
      throw new BadRequestException('No approval request found for this course');
    }

    // Reset approval request
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        approvalRequested: false,
        approvalRequestedAt: null,
        rejectionReason: reason,
      },
    });
  }

  async remove(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this course');
    }

    // Prevent deletion if there are active enrollments
    if (course.enrollments.length > 0) {
      throw new BadRequestException('Cannot delete course with active enrollments. Archive it instead.');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { success: true, message: 'Course deleted successfully' };
  }

  async getMyCourses(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        category: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
            sourceDocuments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map(course => ({
      ...course,
      sourceDocumentsCount: course._count.sourceDocuments,
    }));
  }

  // ==================== MODULE OPERATIONS ====================

  async createModule(userId: string, input: CreateModuleInput) {
    const { courseId, order, ...rest } = input;

    // Verify user owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to add modules to this course');
    }

    // Get next order if not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await this.prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 0;
    }

    return this.prisma.courseModule.create({
      data: {
        ...rest,
        courseId,
        order: moduleOrder,
      },
      include: {
        lessons: true,
      },
    });
  }

  async updateModule(userId: string, input: UpdateModuleInput) {
    const { id, ...updateData } = input;

    const module = await this.prisma.courseModule.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this module');
    }

    return this.prisma.courseModule.update({
      where: { id },
      data: updateData,
      include: {
        lessons: true,
      },
    });
  }

  async deleteModule(userId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true, lessons: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this module');
    }

    // Prevent deletion if module has lessons
    if (module.lessons.length > 0) {
      throw new BadRequestException('Cannot delete module with existing lessons. Delete lessons first.');
    }

    await this.prisma.courseModule.delete({
      where: { id: moduleId },
    });

    return { success: true, message: 'Module deleted successfully' };
  }

  async reorderModules(userId: string, input: ReorderModulesInput) {
    const { courseId, moduleIds } = input;

    // Verify user owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to reorder modules');
    }

    // Update order for each module
    await Promise.all(
      moduleIds.map((moduleId, index) =>
        this.prisma.courseModule.update({
          where: { id: moduleId },
          data: { order: index },
        })
      )
    );

    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { lessons: true },
    });
  }

  // ==================== LESSON OPERATIONS ====================

  async createLesson(userId: string, input: CreateLessonInput) {
    const { moduleId, order, ...rest } = input;

    // Verify user owns the course
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to add lessons to this module');
    }

    // Get next order if not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' },
      });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
    }

    return this.prisma.lesson.create({
      data: {
        ...rest,
        moduleId,
        order: lessonOrder,
      },
    });
  }

  async updateLesson(userId: string, input: UpdateLessonInput) {
    const { id, ...updateData } = input;

    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        courseModule: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this lesson');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        courseModule: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this lesson');
    }

    await this.prisma.lesson.delete({
      where: { id: lessonId },
    });

    return { success: true, message: 'Lesson deleted successfully' };
  }

  async reorderLessons(userId: string, input: ReorderLessonsInput) {
    const { moduleId, lessonIds } = input;

    // Verify user owns the course
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to reorder lessons');
    }

    // Update order for each lesson
    await Promise.all(
      lessonIds.map((lessonId, index) =>
        this.prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index },
        })
      )
    );

    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }
}
