import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseCategoryInput } from './dto/create-course-category.input';
import { UpdateCourseCategoryInput } from './dto/update-course-category.input';
import slugify from 'slugify';

@Injectable()
export class CourseCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseCategoryInput: CreateCourseCategoryInput) {
    const { name, parentId, ...rest } = createCourseCategoryInput;
    
    // Generate slug from name
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await this.prisma.courseCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await this.prisma.courseCategory.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
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
    // Get root categories (no parent)
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCourseCategoryInput: UpdateCourseCategoryInput) {
    const { id: _, parentId, ...rest } = updateCourseCategoryInput;

    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Validate parent exists if provided
    if (parentId) {
      // Prevent circular reference
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.courseCategory.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      // Check if new parent is a descendant of current category
      const isDescendant = await this.isDescendant(id, parentId);
      if (isDescendant) {
        throw new BadRequestException('Cannot set a descendant as parent (circular reference)');
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

  async remove(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        children: true,
        courses: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Prevent deletion if has children
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Prevent deletion if has courses
    if (category.courses.length > 0) {
      throw new BadRequestException('Cannot delete category with associated courses');
    }

    await this.prisma.courseCategory.delete({
      where: { id },
    });

    return { success: true, message: 'Category deleted successfully' };
  }

  private async isDescendant(ancestorId: string, potentialDescendantId: string): Promise<boolean> {
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
}
