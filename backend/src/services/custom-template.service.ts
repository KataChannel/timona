import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomTemplate } from '../graphql/models/custom-template.model';
import { TemplateShare } from '../graphql/models/custom-template.model';
import {
  CreateCustomTemplateInput,
  UpdateCustomTemplateInput,
} from '../graphql/inputs/custom-template.input';

@Injectable()
export class CustomTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all templates for a user
   */
  async getUserTemplates(
    userId: string,
    filters?: { archived?: boolean; category?: string },
  ): Promise<CustomTemplate[]> {
    const where: any = { userId };

    if (filters?.archived !== undefined) {
      where.isArchived = filters.archived;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    return this.prisma.customTemplate.findMany({
      where,
      include: { user: true },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<CustomTemplate[]>;
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string, userId: string): Promise<CustomTemplate> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    // Check if user owns the template or it's public or shared with them
    if (template.userId !== userId) {
      const isShared = await this.prisma.templateShare.findUnique({
        where: {
          templateId_sharedWith: {
            templateId: id,
            sharedWith: userId,
          },
        },
      });

      if (!template.isPublic && !isShared) {
        throw new ForbiddenException('You do not have access to this template');
      }
    }

    return template as CustomTemplate;
  }

  /**
   * Get public templates
   */
  async getPublicTemplates(category?: string): Promise<CustomTemplate[]> {
    const where: any = { isPublic: true, isArchived: false };

    if (category) {
      where.category = category;
    }

    return this.prisma.customTemplate.findMany({
      where,
      include: { user: true },
      orderBy: { usageCount: 'desc' },
    }) as Promise<CustomTemplate[]>;
  }

  /**
   * Get templates shared with a user
   */
  async getSharedTemplates(userId: string): Promise<CustomTemplate[]> {
    const shares = await this.prisma.templateShare.findMany({
      where: { sharedWith: userId },
      include: {
        template: { include: { user: true } },
      },
    });

    return shares.map(s => s.template) as CustomTemplate[];
  }

  /**
   * Create a new template
   */
  async createTemplate(
    userId: string,
    input: CreateCustomTemplateInput,
  ): Promise<CustomTemplate> {
    // Check for duplicate template name for this user
    const existing = await this.prisma.customTemplate.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Template with name "${input.name}" already exists for this user`,
      );
    }

    return this.prisma.customTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        blocks: input.blocks,
        thumbnail: input.thumbnail,
        userId,
      },
      include: { user: true },
    }) as Promise<CustomTemplate>;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    userId: string,
    input: UpdateCustomTemplateInput,
  ): Promise<CustomTemplate> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id: input.id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${input.id}" not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this template');
    }

    // If changing name, check for duplicates
    if (input.name && input.name !== template.name) {
      const existing = await this.prisma.customTemplate.findUnique({
        where: {
          userId_name: {
            userId,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Template with name "${input.name}" already exists for this user`,
        );
      }
    }

    return this.prisma.customTemplate.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        blocks: input.blocks,
        thumbnail: input.thumbnail,
        updatedAt: new Date(),
      },
      include: { user: true },
    }) as Promise<CustomTemplate>;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this template');
    }

    // Delete all shares first
    await this.prisma.templateShare.deleteMany({
      where: { templateId: id },
    });

    // Delete the template
    await this.prisma.customTemplate.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(
    templateId: string,
    userId: string,
    newName?: string,
  ): Promise<CustomTemplate> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    // Check access
    if (template.userId !== userId) {
      const isShared = await this.prisma.templateShare.findUnique({
        where: {
          templateId_sharedWith: {
            templateId: templateId,
            sharedWith: userId,
          },
        },
      });

      if (!template.isPublic && !isShared) {
        throw new ForbiddenException('You do not have access to this template');
      }
    }

    // Generate a new name
    const baseName = newName || `${template.name} (Copy)`;
    let finalName = baseName;
    let counter = 1;

    while (
      await this.prisma.customTemplate.findUnique({
        where: {
          userId_name: {
            userId,
            name: finalName,
          },
        },
      })
    ) {
      finalName = `${baseName} ${counter++}`;
    }

    return this.prisma.customTemplate.create({
      data: {
        name: finalName,
        description: template.description,
        category: template.category,
        blocks: template.blocks,
        thumbnail: template.thumbnail,
        userId,
      },
      include: { user: true },
    }) as Promise<CustomTemplate>;
  }

  /**
   * Share template with other users
   */
  async shareTemplate(
    templateId: string,
    userId: string,
    shareWithUserIds: string[],
  ): Promise<TemplateShare[]> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to share this template');
    }

    // Create shares (ignore if already exists)
    const shares = await Promise.all(
      shareWithUserIds.map(shareWithUserId =>
        this.prisma.templateShare.upsert({
          where: {
            templateId_sharedWith: {
              templateId,
              sharedWith: shareWithUserId,
            },
          },
          update: {},
          create: {
            templateId,
            sharedWith: shareWithUserId,
          },
          include: { 
            user: true,
            template: { include: { user: true } },
          },
        }),
      ),
    );

    return shares as any as TemplateShare[];
  }

  /**
   * Unshare template from a user
   */
  async unshareTemplate(
    templateId: string,
    userId: string,
    unshareFromUserId: string,
  ): Promise<boolean> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You do not have permission to unshare this template');
    }

    await this.prisma.templateShare.delete({
      where: {
        templateId_sharedWith: {
          templateId,
          sharedWith: unshareFromUserId,
        },
      },
    });

    return true;
  }

  /**
   * Update template publicity
   */
  async updatePublicity(
    templateId: string,
    userId: string,
    isPublic: boolean,
  ): Promise<CustomTemplate> {
    const template = await this.prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    if (template.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this template publicity',
      );
    }

    return this.prisma.customTemplate.update({
      where: { id: templateId },
      data: { isPublic },
      include: { user: true },
    }) as Promise<CustomTemplate>;
  }

  /**
   * Increment usage count
   */
  async incrementUsage(templateId: string): Promise<CustomTemplate> {
    return this.prisma.customTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
      include: { user: true },
    }) as Promise<CustomTemplate>;
  }
}
