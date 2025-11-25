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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
let CoursesService = class CoursesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createCourseInput) {
        const { title, categoryId, ...rest } = createCourseInput;
        const baseSlug = (0, slugify_1.default)(title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.course.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        if (categoryId) {
            const category = await this.prisma.courseCategory.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
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
    async findAll(filters) {
        const { search, categoryId, level, status, minPrice, maxPrice, instructorId, tags, page, limit, sortBy, sortOrder } = filters;
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        return {
            ...course,
            sourceDocumentsCount: course._count.sourceDocuments,
        };
    }
    async findBySlug(slug) {
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
            throw new common_1.NotFoundException(`Course with slug ${slug} not found`);
        }
        return {
            ...course,
            sourceDocumentsCount: course._count.sourceDocuments,
        };
    }
    async update(id, userId, updateCourseInput) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this course');
        }
        const { id: _, categoryId, ...rest } = updateCourseInput;
        if (categoryId) {
            const category = await this.prisma.courseCategory.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
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
    async publish(id, userId) {
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
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to publish this course');
        }
        if (course.modules.length === 0) {
            throw new common_1.BadRequestException('Course must have at least one module before publishing');
        }
        const hasLessons = course.modules.some(module => module.lessons.length > 0);
        if (!hasLessons) {
            throw new common_1.BadRequestException('Course must have at least one lesson before publishing');
        }
        return this.prisma.course.update({
            where: { id },
            data: {
                status: client_1.CourseStatus.PUBLISHED,
            },
        });
    }
    async archive(id, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to archive this course');
        }
        return this.prisma.course.update({
            where: { id },
            data: {
                status: client_1.CourseStatus.ARCHIVED,
            },
        });
    }
    async remove(id, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                enrollments: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this course');
        }
        if (course.enrollments.length > 0) {
            throw new common_1.BadRequestException('Cannot delete course with active enrollments. Archive it instead.');
        }
        await this.prisma.course.delete({
            where: { id },
        });
        return { success: true, message: 'Course deleted successfully' };
    }
    async getMyCourses(userId) {
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
    async createModule(userId, input) {
        const { courseId, order, ...rest } = input;
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to add modules to this course');
        }
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
    async updateModule(userId, input) {
        const { id, ...updateData } = input;
        const module = await this.prisma.courseModule.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (module.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this module');
        }
        return this.prisma.courseModule.update({
            where: { id },
            data: updateData,
            include: {
                lessons: true,
            },
        });
    }
    async deleteModule(userId, moduleId) {
        const module = await this.prisma.courseModule.findUnique({
            where: { id: moduleId },
            include: { course: true, lessons: true },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (module.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this module');
        }
        if (module.lessons.length > 0) {
            throw new common_1.BadRequestException('Cannot delete module with existing lessons. Delete lessons first.');
        }
        await this.prisma.courseModule.delete({
            where: { id: moduleId },
        });
        return { success: true, message: 'Module deleted successfully' };
    }
    async reorderModules(userId, input) {
        const { courseId, moduleIds } = input;
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to reorder modules');
        }
        await Promise.all(moduleIds.map((moduleId, index) => this.prisma.courseModule.update({
            where: { id: moduleId },
            data: { order: index },
        })));
        return this.prisma.courseModule.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: { lessons: true },
        });
    }
    async createLesson(userId, input) {
        const { moduleId, order, ...rest } = input;
        const module = await this.prisma.courseModule.findUnique({
            where: { id: moduleId },
            include: { course: true },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (module.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to add lessons to this module');
        }
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
    async updateLesson(userId, input) {
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
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this lesson');
        }
        return this.prisma.lesson.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteLesson(userId, lessonId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                courseModule: {
                    include: { course: true },
                },
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this lesson');
        }
        await this.prisma.lesson.delete({
            where: { id: lessonId },
        });
        return { success: true, message: 'Lesson deleted successfully' };
    }
    async reorderLessons(userId, input) {
        const { moduleId, lessonIds } = input;
        const module = await this.prisma.courseModule.findUnique({
            where: { id: moduleId },
            include: { course: true },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        if (module.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to reorder lessons');
        }
        await Promise.all(lessonIds.map((lessonId, index) => this.prisma.lesson.update({
            where: { id: lessonId },
            data: { order: index },
        })));
        return this.prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' },
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map