import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

// Mock Prisma enums
enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

describe('CoursesService', () => {
  let service: CoursesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    course: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    courseCategory: {
      findUnique: jest.fn(),
    },
    courseModule: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    lesson: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Course 1',
          slug: 'course-1',
          description: 'Description 1',
          price: 99.99,
          level: 'BEGINNER',
          status: CourseStatus.PUBLISHED,
          instructorId: 'instructor-1',
        },
        {
          id: '2',
          title: 'Course 2',
          slug: 'course-2',
          description: 'Description 2',
          price: 149.99,
          level: 'INTERMEDIATE',
          status: CourseStatus.PUBLISHED,
          instructorId: 'instructor-1',
        },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);
      mockPrismaService.course.count.mockResolvedValue(2);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result).toEqual({
        data: mockCourses,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrismaService.course.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.course.count).toHaveBeenCalledTimes(1);
    });

    it('should filter courses by status', async () => {
      const filters = {
        status: CourseStatus.PUBLISHED,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.course.count.mockResolvedValue(0);

      await service.findAll(filters);

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: CourseStatus.PUBLISHED }),
        }),
      );
    });

    it('should search courses by title or description', async () => {
      const filters = {
        search: 'TypeScript',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.course.count.mockResolvedValue(0);

      await service.findAll(filters);

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'TypeScript', mode: 'insensitive' } },
              { description: { contains: 'TypeScript', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      const filters = {
        minPrice: 50,
        maxPrice: 150,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.course.count.mockResolvedValue(0);

      await service.findAll(filters);

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 50,
              lte: 150,
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a course by ID', async () => {
      const mockCourse = {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        description: 'Description',
        instructor: { id: 'instructor-1', username: 'john' },
        modules: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCourse);
      expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
        },
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Course with ID non-existent not found'),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a course by slug', async () => {
      const mockCourse = {
        id: '1',
        title: 'Course 1',
        slug: 'course-1',
        description: 'Description',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findBySlug('course-1');

      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        new NotFoundException('Course with slug non-existent not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a course with unique slug', async () => {
      const userId = 'instructor-1';
      const createInput: any = {
        title: 'New Course',
        description: 'Description',
        price: 99.99,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.DRAFT,
        tags: [],
      };

      const mockCourse = {
        id: '1',
        ...createInput,
        slug: 'new-course',
        instructorId: userId,
      };

      // Slug is unique
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      mockPrismaService.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(userId, createInput);

      expect(result).toEqual(mockCourse);
      expect(mockPrismaService.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Course',
          slug: 'new-course',
          instructorId: userId,
        }),
        include: {
          instructor: true,
          category: true,
        },
      });
    });

    it('should generate unique slug if collision occurs', async () => {
      const userId = 'instructor-1';
      const createInput: any = {
        title: 'Duplicate Course',
        description: 'Description',
        price: 99.99,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.DRAFT,
        tags: [],
      };

      // First slug check: exists
      // Second slug check: unique
      mockPrismaService.course.findUnique
        .mockResolvedValueOnce({ id: '1', slug: 'duplicate-course' })
        .mockResolvedValueOnce(null);

      mockPrismaService.course.create.mockResolvedValue({
        id: '2',
        ...createInput,
        slug: 'duplicate-course-1',
        instructorId: userId,
      });

      await service.create(userId, createInput);

      expect(mockPrismaService.course.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'duplicate-course-1',
          }),
        }),
      );
    });

    it('should validate category exists if provided', async () => {
      const userId = 'instructor-1';
      const createInput: any = {
        title: 'New Course',
        description: 'Description',
        price: 99.99,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.DRAFT,
        tags: [],
        categoryId: 'category-1',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(null);
      mockPrismaService.courseCategory.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createInput)).rejects.toThrow(
        new BadRequestException('Category not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const userId = 'instructor-1';
      const courseId = '1';
      const updateInput: any = {
        id: courseId,
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const mockCourse = {
        id: courseId,
        title: 'Original Title',
        instructorId: userId,
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.update.mockResolvedValue({
        ...mockCourse,
        ...updateInput,
      });

      const result = await service.update(courseId, userId, updateInput);

      expect(result.title).toBe('Updated Title');
      expect(mockPrismaService.course.update).toHaveBeenCalledWith({
        where: { id: courseId },
        data: expect.objectContaining({
          title: 'Updated Title',
          description: 'Updated Description',
        }),
        include: {
          instructor: true,
          category: true,
        },
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.update('1', 'user-1', { id: '1', title: 'New' } as any)).rejects.toThrow(
        new NotFoundException('Course with ID 1 not found'),
      );
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'instructor-1',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(
        service.update('1', 'different-user', { id: '1', title: 'New' } as any),
      ).rejects.toThrow(
        new ForbiddenException('You do not have permission to update this course'),
      );
    });
  });

  describe('publish', () => {
    it('should publish a course with valid content', async () => {
      const userId = 'instructor-1';
      const courseId = '1';

      const mockCourse = {
        id: courseId,
        instructorId: userId,
        status: CourseStatus.DRAFT,
        modules: [
          {
            id: 'module-1',
            lessons: [{ id: 'lesson-1' }],
          },
        ],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.update.mockResolvedValue({
        ...mockCourse,
        status: CourseStatus.PUBLISHED,
      });

      const result = await service.publish(courseId, userId);

      expect(result.status).toBe(CourseStatus.PUBLISHED);
      expect(mockPrismaService.course.update).toHaveBeenCalledWith({
        where: { id: courseId },
        data: { status: CourseStatus.PUBLISHED },
      });
    });

    it('should throw BadRequestException if course has no modules', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'user-1',
        modules: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.publish('1', 'user-1')).rejects.toThrow(
        new BadRequestException('Course must have at least one module before publishing'),
      );
    });

    it('should throw BadRequestException if course has no lessons', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'user-1',
        modules: [{ id: 'module-1', lessons: [] }],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.publish('1', 'user-1')).rejects.toThrow(
        new BadRequestException('Course must have at least one lesson before publishing'),
      );
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'instructor-1',
        modules: [{ id: 'module-1', lessons: [{ id: 'lesson-1' }] }],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.publish('1', 'different-user')).rejects.toThrow(
        new ForbiddenException('You do not have permission to publish this course'),
      );
    });
  });

  describe('archive', () => {
    it('should archive a course', async () => {
      const userId = 'instructor-1';
      const courseId = '1';

      const mockCourse = {
        id: courseId,
        instructorId: userId,
        status: CourseStatus.PUBLISHED,
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.update.mockResolvedValue({
        ...mockCourse,
        status: CourseStatus.ARCHIVED,
      });

      const result = await service.archive(courseId, userId);

      expect(result.status).toBe(CourseStatus.ARCHIVED);
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'instructor-1',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.archive('1', 'different-user')).rejects.toThrow(
        new ForbiddenException('You do not have permission to archive this course'),
      );
    });
  });

  describe('remove', () => {
    it('should delete a course without enrollments', async () => {
      const userId = 'instructor-1';
      const courseId = '1';

      const mockCourse = {
        id: courseId,
        instructorId: userId,
        enrollments: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.delete.mockResolvedValue(mockCourse);

      const result = await service.remove(courseId, userId);

      expect(result).toEqual({
        success: true,
        message: 'Course deleted successfully',
      });
      expect(mockPrismaService.course.delete).toHaveBeenCalledWith({
        where: { id: courseId },
      });
    });

    it('should throw BadRequestException if course has enrollments', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'user-1',
        enrollments: [{ id: 'enrollment-1' }],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.remove('1', 'user-1')).rejects.toThrow(
        new BadRequestException(
          'Cannot delete course with active enrollments. Archive it instead.',
        ),
      );
    });

    it('should throw ForbiddenException if user is not instructor', async () => {
      const mockCourse = {
        id: '1',
        instructorId: 'instructor-1',
        enrollments: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.remove('1', 'different-user')).rejects.toThrow(
        new ForbiddenException('You do not have permission to delete this course'),
      );
    });
  });

  describe('getMyCourses', () => {
    it('should return all courses for an instructor', async () => {
      const userId = 'instructor-1';
      const mockCourses = [
        { id: '1', title: 'Course 1', instructorId: userId },
        { id: '2', title: 'Course 2', instructorId: userId },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);

      const result = await service.getMyCourses(userId);

      expect(result).toEqual(mockCourses);
      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith({
        where: { instructorId: userId },
        include: {
          category: true,
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
