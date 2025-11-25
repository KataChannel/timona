import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoriesInput,
  CategoryFiltersInput,
} from '../graphql/inputs/category.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Get Categories with pagination and filters
  async getCategories(input?: GetCategoriesInput) {
    const {
      page = 1,
      limit = 50,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
      filters,
      includeChildren = false,
    } = input || {};

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

  // Get all categories as tree
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

    // Return only root categories (no parent)
    return categories.filter((cat) => !cat.parentId);
  }

  // Get single category by ID
  async getCategoryById(id: string) {
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
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
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
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  // Create category
  async createCategory(input: CreateCategoryInput) {
    // Check if slug exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: input.slug },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category with slug ${input.slug} already exists`);
    }

    // Check if parent exists if provided
    if (input.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${input.parentId} not found`);
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(input.parentId, input.parentId)) {
        throw new BadRequestException('Cannot create circular category reference');
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

  // Update category
  async updateCategory(input: UpdateCategoryInput) {
    const { id, ...data } = input;

    // Check if category exists
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if slug is being updated and if it's unique
    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingCategory) {
        throw new BadRequestException(`Category with slug ${data.slug} already exists`);
      }
    }

    // Check if parent exists if being updated
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${data.parentId} not found`);
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(id, data.parentId)) {
        throw new BadRequestException('Cannot create circular category reference');
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

  // Delete category
  async deleteCategory(id: string, deleteProducts = false) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for child categories
    if (category._count.children > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories. Delete or reassign children first.',
      );
    }

    // Check for products
    if (category._count.products > 0 && !deleteProducts) {
      throw new BadRequestException(
        'Cannot delete category with products. Delete or reassign products first.',
      );
    }

    // Delete products if requested
    if (deleteProducts) {
      await this.prisma.product.deleteMany({
        where: { categoryId: id },
      });
    }

    return this.prisma.category.delete({ where: { id } });
  }

  // Get product count for category
  async getProductCount(categoryId: string): Promise<number> {
    return this.prisma.product.count({
      where: { categoryId },
    });
  }

  // Helper: Check for circular reference in category hierarchy
  private async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    if (categoryId === newParentId) {
      return true;
    }

    let currentParentId: string | null = newParentId;

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

  // Helper: Build where clause from filters
  private buildWhereClause(filters?: CategoryFiltersInput): Prisma.CategoryWhereInput {
    if (!filters) return {};

    const where: Prisma.CategoryWhereInput = {};

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
}
