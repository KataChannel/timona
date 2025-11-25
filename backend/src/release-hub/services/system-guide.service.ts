import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GuideType } from '../entities/system-guide.entity';

export interface CreateSystemGuideDto {
  title: string;
  type: GuideType;
  description?: string;
  content?: string;
  order?: number;
  parentId?: string;
  isPublished?: boolean;
  authorId: string;
}

export interface UpdateSystemGuideDto {
  id: string;
  title?: string;
  type?: GuideType;
  description?: string;
  content?: string;
  order?: number;
  parentId?: string;
  isPublished?: boolean;
}

@Injectable()
export class SystemGuideService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSystemGuideDto) {
    const slug = this.generateSlug(data.title);

    return this.prisma.systemGuide.create({
      data: {
        title: data.title,
        slug,
        type: data.type,
        description: data.description,
        content: data.content,
        orderIndex: data.order || 0,
        parentId: data.parentId,
        isPublished: data.isPublished || false,
        authorId: data.authorId,
      },
      include: {
        author: true,
        parent: true,
        children: true,
      },
    });
  }

  async findAll(filters?: {
    type?: GuideType;
    parentId?: string | null;
    search?: string;
    isPublished?: boolean;
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    return this.prisma.systemGuide.findMany({
      where,
      include: {
        author: true,
        parent: true,
        children: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const guide = await this.prisma.systemGuide.findUnique({
      where: { id },
      include: {
        author: true,
        parent: true,
        children: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException(`System guide with ID ${id} not found`);
    }

    return guide;
  }

  async findBySlug(slug: string) {
    const guide = await this.prisma.systemGuide.findUnique({
      where: { slug },
      include: {
        author: true,
        parent: true,
        children: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException(`System guide with slug ${slug} not found`);
    }

    // Increment view count
    await this.incrementViewCount(guide.id);

    return guide;
  }

  async update(data: UpdateSystemGuideDto) {
    const guide = await this.findOne(data.id);

    const updateData: any = {};

    if (data.title) {
      updateData.title = data.title;
      updateData.slug = this.generateSlug(data.title);
    }

    if (data.type) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.order !== undefined) updateData.orderIndex = data.order;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    return this.prisma.systemGuide.update({
      where: { id: data.id },
      data: updateData,
      include: {
        author: true,
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string) {
    const guide = await this.findOne(id);

    // Check if guide has children
    const childrenCount = await this.prisma.systemGuide.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new Error('Cannot delete guide with children. Delete children first.');
    }

    await this.prisma.systemGuide.delete({
      where: { id },
    });

    return true;
  }

  async incrementViewCount(id: string) {
    return this.prisma.systemGuide.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async voteHelpful(id: string, isHelpful: boolean) {
    const guide = await this.findOne(id);

    return this.prisma.systemGuide.update({
      where: { id },
      data: {
        helpfulCount: isHelpful
          ? { increment: 1 }
          : guide.helpfulCount,
        notHelpfulCount: !isHelpful
          ? { increment: 1 }
          : guide.notHelpfulCount,
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
