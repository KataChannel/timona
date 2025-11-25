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
exports.CourseCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const slugify_1 = __importDefault(require("slugify"));
let CourseCategoriesService = class CourseCategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCourseCategoryInput) {
        const { name, parentId, ...rest } = createCourseCategoryInput;
        const baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.courseCategory.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        if (parentId) {
            const parent = await this.prisma.courseCategory.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new common_1.BadRequestException('Parent category not found');
            }
        }
        return this.prisma.courseCategory.create({
            data: {
                ...rest,
                name,
                slug,
                parentId,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async findAll() {
        return this.prisma.courseCategory.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        courses: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findTree() {
        const rootCategories = await this.prisma.courseCategory.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true,
                        _count: {
                            select: {
                                courses: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        courses: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return rootCategories;
    }
    async findOne(id) {
        const category = await this.prisma.courseCategory.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        courses: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCourseCategoryInput) {
        const { id: _, parentId, ...rest } = updateCourseCategoryInput;
        const category = await this.prisma.courseCategory.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (parentId) {
            if (parentId === id) {
                throw new common_1.BadRequestException('Category cannot be its own parent');
            }
            const parent = await this.prisma.courseCategory.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new common_1.BadRequestException('Parent category not found');
            }
            const isDescendant = await this.isDescendant(id, parentId);
            if (isDescendant) {
                throw new common_1.BadRequestException('Cannot set a descendant as parent (circular reference)');
            }
        }
        return this.prisma.courseCategory.update({
            where: { id },
            data: {
                ...rest,
                parentId,
            },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async remove(id) {
        const category = await this.prisma.courseCategory.findUnique({
            where: { id },
            include: {
                children: true,
                courses: true,
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (category.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with subcategories');
        }
        if (category.courses.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with associated courses');
        }
        await this.prisma.courseCategory.delete({
            where: { id },
        });
        return { success: true, message: 'Category deleted successfully' };
    }
    async isDescendant(ancestorId, potentialDescendantId) {
        const category = await this.prisma.courseCategory.findUnique({
            where: { id: potentialDescendantId },
            include: { parent: true },
        });
        if (!category || !category.parentId) {
            return false;
        }
        if (category.parentId === ancestorId) {
            return true;
        }
        return this.isDescendant(ancestorId, category.parentId);
    }
};
exports.CourseCategoriesService = CourseCategoriesService;
exports.CourseCategoriesService = CourseCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseCategoriesService);
//# sourceMappingURL=course-categories.service.js.map