import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MinioService } from '../../minio/minio.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileUpload } from 'graphql-upload-ts';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  bucket: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  
  // File type configurations
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  private readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ];

  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  private readonly MAX_FILE_SIZE = {
    image: 5 * 1024 * 1024, // 5MB
    video: 500 * 1024 * 1024, // 500MB
    document: 10 * 1024 * 1024, // 10MB
  };

  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload file to MinIO
   */
  async uploadFile(
    file: FileUpload,
    userId: string,
    type: 'image' | 'video' | 'document',
  ): Promise<UploadResult> {
    const { createReadStream, filename, mimetype } = file;

    // Validate file type
    this.validateFileType(mimetype, type);

    // Generate unique filename
    const fileExtension = this.getFileExtension(mimetype);
    const uniqueFilename = `${uuidv4()}-${Date.now()}.${fileExtension}`;

    // Determine bucket based on type
    const bucket = this.getBucketName(type);

    try {
      // Read file into buffer
      const stream = createReadStream();
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      
      const buffer = Buffer.concat(chunks);

      // Validate file size
      this.validateFileSize(buffer.length, type);

      // Upload to MinIO
      const url = await this.minioService.uploadFile(
        bucket,
        uniqueFilename,
        buffer,
        mimetype,
      );

      this.logger.log(`File uploaded: ${uniqueFilename} to bucket: ${bucket}`);

      return {
        id: uniqueFilename,
        url,
        filename,
        mimetype,
        size: buffer.length,
        bucket,
      };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Upload video specifically for lessons
   */
  async uploadLessonVideo(
    file: FileUpload,
    userId: string,
    courseId: string,
  ): Promise<UploadResult> {
    // Verify user owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new BadRequestException('Not authorized to upload to this course');
    }

    return this.uploadFile(file, userId, 'video');
  }

  /**
   * Upload thumbnail for course
   */
  async uploadCourseThumbnail(
    file: FileUpload,
    userId: string,
    courseId?: string,
  ): Promise<UploadResult> {
    // If courseId provided, verify ownership
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || course.instructorId !== userId) {
        throw new BadRequestException('Not authorized');
      }
    }

    return this.uploadFile(file, userId, 'image');
  }

  /**
   * Upload course material document
   */
  async uploadCourseMaterial(
    file: FileUpload,
    userId: string,
    courseId: string,
  ): Promise<UploadResult> {
    // Verify ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    return this.uploadFile(file, userId, 'document');
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(fileId: string, bucket: string, userId: string): Promise<boolean> {
    try {
      await this.minioService.deleteFile(bucket, fileId);
      this.logger.log(`File deleted: ${fileId} from bucket: ${bucket}`);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Get presigned URL for private files
   */
  async getPresignedUrl(
    fileId: string,
    bucket: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      return await this.minioService.getPresignedUrl(bucket, fileId, expiresIn);
    } catch (error) {
      this.logger.error('Error generating presigned URL:', error);
      throw new BadRequestException('Failed to generate presigned URL');
    }
  }

  /**
   * Validate file type
   */
  private validateFileType(mimetype: string, type: 'image' | 'video' | 'document'): void {
    const allowedTypes = {
      image: this.ALLOWED_IMAGE_TYPES,
      video: this.ALLOWED_VIDEO_TYPES,
      document: this.ALLOWED_DOCUMENT_TYPES,
    };

    if (!allowedTypes[type].includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types for ${type}: ${allowedTypes[type].join(', ')}`,
      );
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(size: number, type: 'image' | 'video' | 'document'): void {
    const maxSize = this.MAX_FILE_SIZE[type];

    if (size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB for ${type}`,
      );
    }
  }

  /**
   * Get file extension from mimetype
   */
  private getFileExtension(mimetype: string): string {
    const extensions: { [key: string]: string } = {
      // Images
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      // Videos
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogg',
      'video/quicktime': 'mov',
      // Documents
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'text/plain': 'txt',
    };

    return extensions[mimetype] || 'bin';
  }

  /**
   * Get bucket name based on type
   */
  private getBucketName(type: 'image' | 'video' | 'document'): string {
    const buckets = {
      image: 'uploads',
      video: 'uploads',
      document: 'uploads',
    };

    return buckets[type];
  }
}
