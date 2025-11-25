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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoryService = class CategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategories(input) {
        const { page = 1, limit = 50, sortBy = 'displayOrder', sortOrder = 'asc', filters, includeChildren = false, } = input || {};
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(filters);
        const [items, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    parent: true,
                    children: includeChildren,
                    _count: {
                        select: { products: true },
                    },
                },
            }),
            this.prisma.category.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        };
    }
    async getCategoryTree() {
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
                children: {
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        children: {
                            orderBy: { displayOrder: 'asc' },
                        },
                        _count: {
                            select: { products: true },
                        },
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
        return categories.filter((cat) => !cat.parentId);
    }
    async getCategoryById(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    orderBy: { displayOrder: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async getCategoryBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: {
                    orderBy: { displayOrder: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with slug ${slug} not found`);
        }
        return category;
    }
    async createCategory(input) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { slug: input.slug },
        });
        if (existingCategory) {
            throw new common_1.BadRequestException(`Category with slug ${input.slug} already exists`);
        }
        if (input.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: input.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID ${input.parentId} not found`);
            }
            if (await this.wouldCreateCircularReference(input.parentId, input.parentId)) {
                throw new common_1.BadRequestException('Cannot create circular category reference');
            }
        }
        return this.prisma.category.create({
            data: input,
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
    }
    async updateCategory(input) {
        const { id, ...data } = input;
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (data.slug && data.slug !== category.slug) {
            const existingCategory = await this.prisma.category.findUnique({
                where: { slug: data.slug },
            });
            if (existingCategory) {
                throw new common_1.BadRequestException(`Category with slug ${data.slug} already exists`);
            }
        }
        if (data.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: data.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID ${data.parentId} not found`);
            }
            if (await this.wouldCreateCircularReference(id, data.parentId)) {
                throw new common_1.BadRequestException('Cannot create circular category reference');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data,
            include: {
                parent: true,
                children: {
                    orderBy: { displayOrder: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
    }
    async deleteCategory(id, deleteProducts = false) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true, children: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (category._count.children > 0) {
            throw new common_1.BadRequestException('Cannot delete category with child categories. Delete or reassign children first.');
        }
        if (category._count.products > 0 && !deleteProducts) {
            throw new common_1.BadRequestException('Cannot delete category with products. Delete or reassign products first.');
        }
        if (deleteProducts) {
            await this.prisma.product.deleteMany({
                where: { categoryId: id },
            });
        }
        return this.prisma.category.delete({ where: { id } });
    }
    async getProductCount(categoryId) {
        return this.prisma.product.count({
            where: { categoryId },
        });
    }
    async wouldCreateCircularReference(categoryId, newParentId) {
        if (categoryId === newParentId) {
            return true;
        }
        let currentParentId = newParentId;
        while (currentParentId) {
            if (currentParentId === categoryId) {
                return true;
            }
            const parent = await this.prisma.category.findUnique({
                where: { id: currentParentId },
                select: { parentId: true },
            });
            currentParentId = parent?.parentId || null;
        }
        return false;
    }
    buildWhereClause(filters) {
        if (!filters)
            return {};
        const where = {};
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.isFeatured !== undefined) {
            where.isFeatured = filters.isFeatured;
        }
        if (filters.hasProducts !== undefined && filters.hasProducts) {
            where.products = {
                some: {},
            };
        }
        return where;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryService);
//# sourceMappingURL=category.service.js.map