import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { MediaType } from '@prisma/client';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class ProjectMediaService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  /**
   * Upload file to MinIO and create database record
   */
  async uploadFile(
    file: UploadedFile,
    userId: string,
    options: {
      projectId?: string;
      taskId?: string;
      messageId?: string;
      caption?: string;
    },
  ): Promise<any> {
    // Validate file
    this.validateFile(file);

    // Determine media type
    const mediaType = this.getMediaType(file.mimetype);

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const bucketName = this.getBucketName(options);
    const objectName = `${bucketName}/${filename}`;

    try {
      // Upload to MinIO
      const url = await this.minioService.uploadFile(
        bucketName,
        objectName,
        file.buffer,
        file.mimetype,
      );

      // Create database record based on type
      if (options.taskId) {
        return await this.prisma.taskMedia.create({
          data: {
            type: mediaType,
            url,
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            caption: options.caption,
            taskId: options.taskId,
            uploadedBy: userId,
          },
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });
      } else if (options.projectId && !options.messageId) {
        // Project file (not chat message)
        return await this.prisma.$executeRaw`
          INSERT INTO project_media (id, type, url, filename, size, mime_type, caption, project_id, uploaded_by, created_at, updated_at)
          VALUES (${uuidv4()}, ${mediaType}, ${url}, ${file.originalname}, ${file.size}, ${file.mimetype}, ${options.caption || null}, ${options.projectId}, ${userId}, NOW(), NOW())
          RETURNING *
        `;
      } else if (options.messageId) {
        // Chat message attachment
        return await this.prisma.$executeRaw`
          INSERT INTO chat_media (id, type, url, filename, size, mime_type, caption, message_id, uploaded_by, created_at, updated_at)
          VALUES (${uuidv4()}, ${mediaType}, ${url}, ${file.originalname}, ${file.size}, ${file.mimetype}, ${options.caption || null}, ${options.messageId}, ${userId}, NOW(), NOW())
          RETURNING *
        `;
      }

      throw new BadRequestException('Invalid upload target');
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: UploadedFile[],
    userId: string,
    options: {
      projectId?: string;
      taskId?: string;
      messageId?: string;
    },
  ): Promise<any[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, userId, options),
    );
    return await Promise.all(uploadPromises);
  }

  /**
   * Get files for a project
   */
  async getProjectFiles(projectId: string, filters?: { type?: MediaType }) {
    const where: any = { projectId };
    if (filters?.type) {
      where.type = filters.type;
    }

    // Since ProjectMedia table might not exist yet, return empty for now
    // TODO: Create migration for ProjectMedia table
    return [];
  }

  /**
   * Get files for a task
   */
  async getTaskFiles(taskId: string, filters?: { type?: MediaType }) {
    const where: any = { taskId };
    if (filters?.type) {
      where.type = filters.type;
    }

    return await this.prisma.taskMedia.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete file
   */
  async deleteFile(
    fileId: string,
    userId: string,
    type: 'task' | 'project' | 'chat',
  ): Promise<boolean> {
    try {
      if (type === 'task') {
        const media = await this.prisma.taskMedia.findUnique({
          where: { id: fileId },
        });

        if (!media) {
          throw new NotFoundException('File not found');
        }

        // Check permission (owner or uploader)
        if (media.uploadedBy !== userId) {
          const task = await this.prisma.task.findUnique({
            where: { id: media.taskId },
          });

          if (task?.userId !== userId) {
            throw new BadRequestException('Not authorized to delete this file');
          }
        }

        // Delete from MinIO
        try {
          const bucketName = this.getBucketName({ taskId: media.taskId });
          const objectName = this.getObjectNameFromUrl(media.url);
          await this.minioService.deleteFile(bucketName, objectName);
        } catch (error) {
          console.error('MinIO delete error:', error);
        }

        // Delete from database
        await this.prisma.taskMedia.delete({
          where: { id: fileId },
        });

        return true;
      }

      // TODO: Handle project and chat file deletion
      throw new BadRequestException('Unsupported file type');
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: UploadedFile) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }
  }

  /**
   * Determine media type from MIME type
   */
  private getMediaType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    // Audio files and other file types return DOCUMENT
    return MediaType.DOCUMENT;
  }

  /**
   * Get bucket name based on upload target
   */
  private getBucketName(options: {
    projectId?: string;
    taskId?: string;
    messageId?: string;
  }): string {
    if (options.taskId) return 'tasks';
    if (options.messageId) return 'chats';
    if (options.projectId) return 'projects';
    return 'uploads';
  }

  /**
   * Extract object name from URL
   */
  private getObjectNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return url;
    }
  }

  /**
   * Get file statistics for a project
   */
  async getProjectFileStats(projectId: string) {
    // TODO: Implement after creating ProjectMedia table
    return {
      totalFiles: 0,
      totalSize: 0,
      byType: {
        images: 0,
        documents: 0,
        videos: 0,
        audio: 0,
      },
    };
  }

  /**
   * Get file statistics for a task
   */
  async getTaskFileStats(taskId: string) {
    const files = await this.prisma.taskMedia.findMany({
      where: { taskId },
      select: {
        type: true,
        size: true,
      },
    });

    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      byType: {
        images: files.filter((f) => f.type === MediaType.IMAGE).length,
        documents: files.filter((f) => f.type === MediaType.DOCUMENT).length,
        videos: files.filter((f) => f.type === MediaType.VIDEO).length,
      },
    };

    return stats;
  }
}
