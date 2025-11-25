import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSystemReleaseInput,
  UpdateSystemReleaseInput,
  SystemReleaseWhereInput,
} from '../dto/system-release.input';

@Injectable()
export class SystemReleaseService {
  private readonly logger = new Logger(SystemReleaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSystemReleaseInput, userId: string) {
    try {
      // Auto-generate slug if not provided
      const slug = input.slug || this.generateSlug(input.title);
      
      // Auto-generate versionNumber from version (remove 'v' prefix if exists)
      const versionNumber = input.versionNumber || input.version.replace(/^v/, '');

      const release = await this.prisma.systemRelease.create({
        data: {
          ...input,
          versionNumber,
          slug,
          features: input.features || [],
          improvements: input.improvements || [],
          bugfixes: input.bugfixes || [],
          breakingChanges: input.breakingChanges || [],
          deprecations: input.deprecations || [],
          screenshotUrls: input.screenshotUrls || [],
          keywords: input.keywords || [],
          createdById: userId,
        },
      });

      this.logger.log(`Created release: ${release.version}`);
      return release;
    } catch (error) {
      this.logger.error(`Error creating release: ${error.message}`);
      throw error;
    }
  }

  async findAll(where?: SystemReleaseWhereInput, take = 20, skip = 0) {
    const whereClause: any = {};

    if (where?.status) {
      whereClause.status = where.status;
    }

    if (where?.releaseType) {
      whereClause.releaseType = where.releaseType;
    }

    if (where?.search) {
      whereClause.OR = [
        { title: { contains: where.search, mode: 'insensitive' } },
        { description: { contains: where.search, mode: 'insensitive' } },
        { version: { contains: where.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.systemRelease.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { releaseDate: 'desc' },
      include: {
        changelogs: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const release = await this.prisma.systemRelease.findUnique({
      where: { id },
      include: {
        changelogs: {
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!release) {
      throw new NotFoundException(`Release with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.systemRelease.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return release;
  }

  async findByVersion(version: string) {
    const release = await this.prisma.systemRelease.findUnique({
      where: { version },
      include: {
        changelogs: true,
      },
    });

    if (!release) {
      throw new NotFoundException(`Release ${version} not found`);
    }

    return release;
  }

  async findBySlug(slug: string) {
    const release = await this.prisma.systemRelease.findUnique({
      where: { slug },
      include: {
        changelogs: true,
      },
    });

    if (!release) {
      throw new NotFoundException(`Release with slug ${slug} not found`);
    }

    // Increment view count
    await this.prisma.systemRelease.update({
      where: { id: release.id },
      data: { viewCount: { increment: 1 } },
    });

    return release;
  }

  async update(id: string, input: UpdateSystemReleaseInput, userId: string) {
    try {
      const release = await this.prisma.systemRelease.update({
        where: { id },
        data: {
          ...input,
          updatedById: userId,
          publishedAt: input.status === 'RELEASED' ? new Date() : undefined,
        },
      });

      this.logger.log(`Updated release: ${release.version}`);
      return release;
    } catch (error) {
      this.logger.error(`Error updating release: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.systemRelease.delete({
        where: { id },
      });

      this.logger.log(`Deleted release: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting release: ${error.message}`);
      throw error;
    }
  }

  async publish(id: string) {
    const release = await this.prisma.systemRelease.update({
      where: { id },
      data: {
        status: 'RELEASED',
        publishedAt: new Date(),
        releaseDate: new Date(),
      },
    });

    this.logger.log(`Published release: ${release.version}`);
    return release;
  }

  async getLatestRelease() {
    return this.prisma.systemRelease.findFirst({
      where: { status: 'RELEASED' },
      orderBy: { releaseDate: 'desc' },
      include: {
        changelogs: true,
      },
    });
  }

  async incrementDownloadCount(id: string) {
    await this.prisma.systemRelease.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
