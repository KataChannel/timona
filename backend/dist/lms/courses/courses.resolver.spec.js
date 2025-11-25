"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const courses_resolver_1 = require("./courses.resolver");
const courses_service_1 = require("./courses.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const client_1 = require("@prisma/client");
describe('CoursesResolver', () => {
    let resolver;
    let coursesService;
    const mockCoursesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findBySlug: jest.fn(),
        getMyCourses: jest.fn(),
        update: jest.fn(),
        publish: jest.fn(),
        archive: jest.fn(),
        remove: jest.fn(),
        createModule: jest.fn(),
        updateModule: jest.fn(),
        deleteModule: jest.fn(),
        reorderModules: jest.fn(),
        createLesson: jest.fn(),
        updateLesson: jest.fn(),
        deleteLesson: jest.fn(),
        reorderLessons: jest.fn(),
    };
    const mockUser = {
        userId: 'user-1',
        email: 'instructor@example.com',
        role: client_1.UserRoleType.ADMIN,
    };
    const mockCourse = {
        id: 'course-1',
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test Description',
        instructorId: 'user-1',
        status: client_1.CourseStatus.DRAFT,
        price: 99.99,
        thumbnail: 'https://example.com/thumb.jpg',
        level: 'BEGINNER',
        duration: 3600,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                courses_resolver_1.CoursesResolver,
                {
                    provide: courses_service_1.CoursesService,
                    useValue: mockCoursesService,
                },
            ],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(roles_guard_1.RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();
        resolver = module.get(courses_resolver_1.CoursesResolver);
        coursesService = module.get(courses_service_1.CoursesService);
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });
    describe('Queries', () => {
        describe('courses', () => {
            it('should return all courses', async () => {
                const mockCourses = [mockCourse];
                mockCoursesService.findAll.mockResolvedValue(mockCourses);
                const result = await resolver.findAll();
                expect(result).toEqual(mockCourses);
                expect(mockCoursesService.findAll).toHaveBeenCalledWith(expect.any(Object));
            });
            it('should return courses with filters', async () => {
                const filters = {
                    status: client_1.CourseStatus.PUBLISHED,
                    minPrice: 0,
                    maxPrice: 100,
                    page: 1,
                    limit: 20,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                };
                mockCoursesService.findAll.mockResolvedValue([mockCourse]);
                const result = await resolver.findAll(filters);
                expect(result).toEqual([mockCourse]);
                expect(mockCoursesService.findAll).toHaveBeenCalledWith(filters);
            });
        });
        describe('course', () => {
            it('should return a single course by id', async () => {
                mockCoursesService.findOne.mockResolvedValue(mockCourse);
                const result = await resolver.findOne('course-1');
                expect(result).toEqual(mockCourse);
                expect(mockCoursesService.findOne).toHaveBeenCalledWith('course-1');
            });
        });
        describe('courseBySlug', () => {
            it('should return a course by slug', async () => {
                mockCoursesService.findBySlug.mockResolvedValue(mockCourse);
                const result = await resolver.findBySlug('test-course');
                expect(result).toEqual(mockCourse);
                expect(mockCoursesService.findBySlug).toHaveBeenCalledWith('test-course');
            });
        });
        describe('myCourses', () => {
            it('should return courses for authenticated user', async () => {
                const mockCourses = [mockCourse];
                mockCoursesService.getMyCourses.mockResolvedValue(mockCourses);
                const result = await resolver.getMyCourses(mockUser);
                expect(result).toEqual(mockCourses);
                expect(mockCoursesService.getMyCourses).toHaveBeenCalledWith('user-1');
            });
        });
    });
    describe('Mutations - Course', () => {
        describe('createCourse', () => {
            it('should create a new course', async () => {
                const createInput = {
                    title: 'New Course',
                    description: 'New Description',
                    price: 49.99,
                    level: 'BEGINNER',
                    status: client_1.CourseStatus.DRAFT,
                    tags: ['javascript', 'web-dev'],
                };
                mockCoursesService.create.mockResolvedValue(mockCourse);
                const result = await resolver.createCourse(mockUser, createInput);
                expect(result).toEqual(mockCourse);
                expect(mockCoursesService.create).toHaveBeenCalledWith('user-1', createInput);
            });
        });
        describe('updateCourse', () => {
            it('should update a course', async () => {
                const updateInput = {
                    id: 'course-1',
                    title: 'Updated Course',
                    price: 79.99,
                };
                const updatedCourse = { ...mockCourse, ...updateInput };
                mockCoursesService.update.mockResolvedValue(updatedCourse);
                const result = await resolver.updateCourse(mockUser, updateInput);
                expect(result).toEqual(updatedCourse);
                expect(mockCoursesService.update).toHaveBeenCalledWith('course-1', 'user-1', updateInput);
            });
        });
        describe('publishCourse', () => {
            it('should publish a course', async () => {
                const publishedCourse = { ...mockCourse, status: client_1.CourseStatus.PUBLISHED };
                mockCoursesService.publish.mockResolvedValue(publishedCourse);
                const result = await resolver.publishCourse(mockUser, 'course-1');
                expect(result).toEqual(publishedCourse);
                expect(mockCoursesService.publish).toHaveBeenCalledWith('course-1', 'user-1');
            });
        });
        describe('archiveCourse', () => {
            it('should archive a course', async () => {
                const archivedCourse = { ...mockCourse, status: client_1.CourseStatus.ARCHIVED };
                mockCoursesService.archive.mockResolvedValue(archivedCourse);
                const result = await resolver.archiveCourse(mockUser, 'course-1');
                expect(result).toEqual(archivedCourse);
                expect(mockCoursesService.archive).toHaveBeenCalledWith('course-1', 'user-1');
            });
        });
        describe('deleteCourse', () => {
            it('should delete a course', async () => {
                mockCoursesService.remove.mockResolvedValue({ success: true });
                const result = await resolver.removeCourse(mockUser, 'course-1');
                expect(result).toBe(true);
                expect(mockCoursesService.remove).toHaveBeenCalledWith('course-1', 'user-1');
            });
        });
    });
    describe('Mutations - Modules', () => {
        const mockModule = {
            id: 'module-1',
            courseId: 'course-1',
            title: 'Module 1',
            description: 'Module Description',
            order: 1,
        };
        describe('createModule', () => {
            it('should create a new module', async () => {
                const createInput = {
                    courseId: 'course-1',
                    title: 'New Module',
                    description: 'Module Description',
                };
                mockCoursesService.createModule.mockResolvedValue(mockModule);
                const result = await resolver.createModule(mockUser, createInput);
                expect(result).toEqual(mockModule);
                expect(mockCoursesService.createModule).toHaveBeenCalledWith('user-1', createInput);
            });
        });
        describe('updateModule', () => {
            it('should update a module', async () => {
                const updateInput = {
                    id: 'module-1',
                    title: 'Updated Module',
                };
                const updatedModule = { ...mockModule, ...updateInput };
                mockCoursesService.updateModule.mockResolvedValue(updatedModule);
                const result = await resolver.updateModule(mockUser, updateInput);
                expect(result).toEqual(updatedModule);
                expect(mockCoursesService.updateModule).toHaveBeenCalledWith('user-1', updateInput);
            });
        });
        describe('deleteModule', () => {
            it('should delete a module', async () => {
                mockCoursesService.deleteModule.mockResolvedValue({ success: true });
                const result = await resolver.deleteModule(mockUser, 'module-1');
                expect(result).toBe(true);
                expect(mockCoursesService.deleteModule).toHaveBeenCalledWith('user-1', 'module-1');
            });
        });
        describe('reorderModules', () => {
            it('should reorder modules', async () => {
                const reorderInput = {
                    courseId: 'course-1',
                    moduleIds: ['module-2', 'module-1'],
                };
                const reorderedModules = [
                    { ...mockModule, id: 'module-2', order: 1 },
                    { ...mockModule, id: 'module-1', order: 2 },
                ];
                mockCoursesService.reorderModules.mockResolvedValue(reorderedModules);
                const result = await resolver.reorderModules(mockUser, reorderInput);
                expect(result).toEqual(reorderedModules);
                expect(mockCoursesService.reorderModules).toHaveBeenCalledWith('user-1', reorderInput);
            });
        });
    });
    describe('Mutations - Lessons', () => {
        const mockLesson = {
            id: 'lesson-1',
            courseModuleId: 'module-1',
            title: 'Lesson 1',
            description: 'Lesson Description',
            videoUrl: 'https://example.com/video.mp4',
            duration: 600,
            order: 1,
            isFree: false,
        };
        describe('createLesson', () => {
            it('should create a new lesson', async () => {
                const createInput = {
                    moduleId: 'module-1',
                    title: 'New Lesson',
                    type: 'VIDEO',
                    content: 'https://example.com/new-video.mp4',
                    duration: 300,
                };
                mockCoursesService.createLesson.mockResolvedValue(mockLesson);
                const result = await resolver.createLesson(mockUser, createInput);
                expect(result).toEqual(mockLesson);
                expect(mockCoursesService.createLesson).toHaveBeenCalledWith('user-1', createInput);
            });
        });
        describe('updateLesson', () => {
            it('should update a lesson', async () => {
                const updateInput = {
                    id: 'lesson-1',
                    title: 'Updated Lesson',
                    duration: 900,
                };
                const updatedLesson = { ...mockLesson, ...updateInput };
                mockCoursesService.updateLesson.mockResolvedValue(updatedLesson);
                const result = await resolver.updateLesson(mockUser, updateInput);
                expect(result).toEqual(updatedLesson);
                expect(mockCoursesService.updateLesson).toHaveBeenCalledWith('user-1', updateInput);
            });
        });
        describe('deleteLesson', () => {
            it('should delete a lesson', async () => {
                mockCoursesService.deleteLesson.mockResolvedValue({ success: true });
                const result = await resolver.deleteLesson(mockUser, 'lesson-1');
                expect(result).toBe(true);
                expect(mockCoursesService.deleteLesson).toHaveBeenCalledWith('user-1', 'lesson-1');
            });
        });
        describe('reorderLessons', () => {
            it('should reorder lessons', async () => {
                const reorderInput = {
                    moduleId: 'module-1',
                    lessonIds: ['lesson-2', 'lesson-1'],
                };
                const reorderedLessons = [
                    { ...mockLesson, id: 'lesson-2', order: 1 },
                    { ...mockLesson, id: 'lesson-1', order: 2 },
                ];
                mockCoursesService.reorderLessons.mockResolvedValue(reorderedLessons);
                const result = await resolver.reorderLessons(mockUser, reorderInput);
                expect(result).toEqual(reorderedLessons);
                expect(mockCoursesService.reorderLessons).toHaveBeenCalledWith('user-1', reorderInput);
            });
        });
    });
});
//# sourceMappingURL=courses.resolver.spec.js.map