import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSourceDocumentCategoryInput,
  UpdateSourceDocumentCategoryInput,
} from './dto/source-document.dto';

@Injectable()
export class SourceDocumentCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateSourceDocumentCategoryInput) {
    return this.prisma.sourceDocumentCategory.create({
      data: input,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll() {
    return this.prisma.sourceDocumentCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            sourceDocuments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.sourceDocumentCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        sourceDocuments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            sourceDocuments: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, input: UpdateSourceDocumentCategoryInput) {
    await this.findOne(id); // Check exists

    return this.prisma.sourceDocumentCategory.update({
      where: { id },
      data: input,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Check exists

    return this.prisma.sourceDocumentCategory.delete({
      where: { id },
    });
  }

  async getTree() {
    // Get all root categories (no parent)
    return this.prisma.sourceDocumentCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                sourceDocuments: true,
              },
            },
          },
        },
        _count: {
          select: {
            sourceDocuments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
