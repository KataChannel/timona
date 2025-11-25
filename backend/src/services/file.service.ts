import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from './minio.service';
import { File, FileFolder, FileType, FileVisibility, Prisma } from '@prisma/client';
import {
  CreateFolderInput,
  UpdateFolderInput,
  UpdateFileInput,
  FileFiltersInput,
  GetFilesInput,
  CreateFileShareInput,
  MoveFilesInput,
  BulkDeleteFilesInput,
  BulkUpdateFilesInput,
} from '../graphql/inputs/file.input';
import * as crypto from 'crypto';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  /**
   * Determine file type from MIME type
   */
  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('msword') ||
      mimeType.includes('officedocument')
    ) {
      return FileType.DOCUMENT;
    }
    if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('tar') ||
      mimeType.includes('compressed')
    ) {
      return FileType.ARCHIVE;
    }
    return FileType.OTHER;
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folderId?: string,
    metadata?: any,
  ): Promise<File> {
    try {
      // Validate folder exists if provided
      if (folderId) {
        const folder = await this.prisma.fileFolder.findUnique({
          where: { id: folderId },
        });
        if (!folder) {
          throw new NotFoundException('Folder not found');
        }
        if (folder.userId !== userId) {
          throw new ForbiddenException('You do not have access to this folder');
        }
      }

      // Determine folder for MinIO storage
      const folderPath = folderId
        ? await this.getFolderPath(folderId)
        : 'general';

      // Upload to MinIO
      const uploadResult = await this.minioService.uploadFile(file, folderPath);

      // Determine file type
      const fileType = this.getFileType(file.mimetype);

      // Create database record
      const createdFile = await this.prisma.file.create({
        data: {
          filename: uploadResult.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          fileType,
          url: uploadResult.url,
          bucket: uploadResult.bucket,
          path: uploadResult.path,
          etag: uploadResult.etag,
          folderId,
          userId,
          visibility: FileVisibility.PRIVATE,
          metadata,
        },
        include: {
          folder: true,
          shares: true,
        },
      });

      this.logger.log(`File uploaded: ${createdFile.id} by user ${userId}`);
      return createdFile;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(id: string, userId: string): Promise<File> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        folder: true,
        shares: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check access permissions
    if (file.userId !== userId && file.visibility === FileVisibility.PRIVATE) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return file;
  }

  /**
   * Get files with pagination and filters
   */
  async getFiles(input: GetFilesInput, userId: string) {
    const {
      page = 1,
      limit = 20,
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      allUsers = false,
    } = input;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.FileWhereInput = {
      // Nếu allUsers = true, không filter theo userId (hiển thị tất cả file)
      ...(allUsers ? {} : { userId }),
      ...(filters.fileType && { fileType: filters.fileType }),
      ...(filters.folderId && { folderId: filters.folderId }),
      ...(filters.visibility && { visibility: filters.visibility }),
      ...(filters.mimeType && { mimeType: { contains: filters.mimeType } }),
      ...(filters.tags &&
        filters.tags.length > 0 && {
          tags: { hasSome: filters.tags },
        }),
      ...(filters.search && {
        OR: [
          { originalName: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count
    const total = await this.prisma.file.count({ where });

    // Get files
    const files = await this.prisma.file.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        folder: true,
        shares: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: files,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Update file metadata
   */
  async updateFile(input: UpdateFileInput, userId: string): Promise<File> {
    const file = await this.getFile(input.id, userId);

    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this file');
    }

    const updated = await this.prisma.file.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
        alt: input.alt,
        tags: input.tags,
        folderId: input.folderId,
        visibility: input.visibility,
        metadata: input.metadata,
      },
      include: {
        folder: true,
        shares: true,
      },
    });

    this.logger.log(`File updated: ${updated.id} by user ${userId}`);
    return updated;
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string): Promise<boolean> {
    const file = await this.getFile(id, userId);

    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    // Delete from MinIO
    await this.minioService.deleteFile(file.path);

    // Delete from database
    await this.prisma.file.delete({ where: { id } });

    this.logger.log(`File deleted: ${id} by user ${userId}`);
    return true;
  }

  /**
   * Create folder
   */
  async createFolder(input: CreateFolderInput, userId: string): Promise<FileFolder> {
    // Build folder path
    let path = `/${input.name}`;
    if (input.parentId) {
      const parent = await this.prisma.fileFolder.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException('You do not have access to parent folder');
      }
      path = `${parent.path}/${input.name}`;
    }

    const folder = await this.prisma.fileFolder.create({
      data: {
        name: input.name,
        description: input.description,
        parentId: input.parentId,
        path,
        userId,
        color: input.color,
        icon: input.icon,
      },
      include: {
        parent: true,
        children: true,
        files: true,
      },
    });

    this.logger.log(`Folder created: ${folder.id} by user ${userId}`);
    return folder;
  }

  /**
   * Get folder by ID
   */
  async getFolder(id: string, userId: string): Promise<FileFolder> {
    const folder = await this.prisma.fileFolder.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        files: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    return folder;
  }

  /**
   * Get all folders for user
   */
  async getFolders(userId: string): Promise<FileFolder[]> {
    return this.prisma.fileFolder.findMany({
      where: { userId },
      include: {
        parent: true,
        children: true,
        files: true,
      },
      orderBy: { path: 'asc' },
    });
  }

  /**
   * Update folder
   */
  async updateFolder(input: UpdateFolderInput, userId: string): Promise<FileFolder> {
    const folder = await this.getFolder(input.id, userId);

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this folder');
    }

    // Rebuild path if name or parent changed
    let path = folder.path;
    if (input.name || input.parentId !== undefined) {
      const name = input.name || folder.name;
      if (input.parentId) {
        const parent = await this.prisma.fileFolder.findUnique({
          where: { id: input.parentId },
        });
        if (!parent) {
          throw new NotFoundException('Parent folder not found');
        }
        path = `${parent.path}/${name}`;
      } else {
        path = `/${name}`;
      }
    }

    const updated = await this.prisma.fileFolder.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        parentId: input.parentId,
        path,
        color: input.color,
        icon: input.icon,
      },
      include: {
        parent: true,
        children: true,
        files: true,
      },
    });

    this.logger.log(`Folder updated: ${updated.id} by user ${userId}`);
    return updated;
  }

  /**
   * Delete folder
   */
  async deleteFolder(id: string, userId: string): Promise<boolean> {
    const folder = await this.getFolder(id, userId);

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this folder');
    }

    if (folder.isSystem) {
      throw new BadRequestException('Cannot delete system folder');
    }

    // Check for child folders
    const childCount = await this.prisma.fileFolder.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestException('Cannot delete folder with subfolders');
    }

    // Delete all files in folder
    const files = await this.prisma.file.findMany({
      where: { folderId: id },
    });

    for (const file of files) {
      await this.deleteFile(file.id, userId);
    }

    // Delete folder
    await this.prisma.fileFolder.delete({ where: { id } });

    this.logger.log(`Folder deleted: ${id} by user ${userId}`);
    return true;
  }

  /**
   * Get folder path
   */
  private async getFolderPath(folderId: string): Promise<string> {
    const folder = await this.prisma.fileFolder.findUnique({
      where: { id: folderId },
    });
    return folder ? folder.path : 'general';
  }

  /**
   * Move files to folder
   */
  async moveFiles(input: MoveFilesInput, userId: string): Promise<File[]> {
    // Validate target folder if provided
    if (input.targetFolderId) {
      await this.getFolder(input.targetFolderId, userId);
    }

    const files = await this.prisma.file.findMany({
      where: {
        id: { in: input.fileIds },
        userId,
      },
    });

    if (files.length !== input.fileIds.length) {
      throw new BadRequestException('Some files not found or access denied');
    }

    const updated = await this.prisma.$transaction(
      files.map((file) =>
        this.prisma.file.update({
          where: { id: file.id },
          data: { folderId: input.targetFolderId },
          include: { folder: true, shares: true },
        }),
      ),
    );

    this.logger.log(`${updated.length} files moved by user ${userId}`);
    return updated;
  }

  /**
   * Bulk delete files
   */
  async bulkDeleteFiles(input: BulkDeleteFilesInput, userId: string): Promise<number> {
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: input.fileIds },
        userId,
      },
    });

    if (files.length !== input.fileIds.length) {
      throw new BadRequestException('Some files not found or access denied');
    }

    // Delete from MinIO
    await Promise.all(files.map((file) => this.minioService.deleteFile(file.path)));

    // Delete from database
    const result = await this.prisma.file.deleteMany({
      where: {
        id: { in: input.fileIds },
        userId,
      },
    });

    this.logger.log(`${result.count} files deleted by user ${userId}`);
    return result.count;
  }

  /**
   * Bulk update files
   */
  async bulkUpdateFiles(input: BulkUpdateFilesInput, userId: string): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: input.fileIds },
        userId,
      },
    });

    if (files.length !== input.fileIds.length) {
      throw new BadRequestException('Some files not found or access denied');
    }

    const updateData: Prisma.FileUpdateInput = {};
    if (input.visibility) updateData.visibility = input.visibility;
    if (input.tags) updateData.tags = input.tags;
    if (input.folderId !== undefined) {
      updateData.folder = input.folderId
        ? { connect: { id: input.folderId } }
        : { disconnect: true };
    }

    const updated = await this.prisma.$transaction(
      files.map((file) =>
        this.prisma.file.update({
          where: { id: file.id },
          data: updateData,
          include: { folder: true, shares: true },
        }),
      ),
    );

    this.logger.log(`${updated.length} files updated by user ${userId}`);
    return updated;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(userId: string) {
    const totalFiles = await this.prisma.file.count({ where: { userId } });
    const totalFolders = await this.prisma.fileFolder.count({ where: { userId } });

    const files = await this.prisma.file.findMany({
      where: { userId },
      select: { size: true, fileType: true, visibility: true },
    });

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Count by type
    const filesByType = Object.values(FileType).map((type) => {
      const typeFiles = files.filter((f) => f.fileType === type);
      return {
        type,
        count: typeFiles.length,
        totalSize: typeFiles.reduce((sum, f) => sum + f.size, 0),
      };
    });

    // Count by visibility
    const filesByVisibility = Object.values(FileVisibility).map((visibility) => {
      const visFiles = files.filter((f) => f.visibility === visibility);
      return {
        visibility,
        count: visFiles.length,
      };
    });

    return {
      totalFiles,
      totalSize,
      totalFolders,
      filesByType,
      filesByVisibility,
    };
  }

  /**
   * Create file share
   */
  async createFileShare(input: CreateFileShareInput, userId: string) {
    const file = await this.getFile(input.fileId, userId);

    if (file.userId !== userId) {
      throw new ForbiddenException('You do not have permission to share this file');
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    const share = await this.prisma.fileShare.create({
      data: {
        fileId: input.fileId,
        sharedBy: userId,
        sharedWith: input.sharedWith,
        token,
        expiresAt: input.expiresAt,
        password: input.password,
        canDownload: input.canDownload ?? true,
        canView: input.canView ?? true,
      },
      include: {
        file: true,
      },
    });

    this.logger.log(`File share created: ${share.id} by user ${userId}`);
    return share;
  }
}
