import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { ImageOptimizationService } from '../services/image-optimization.service';
import { FileService } from '../services/file.service';

interface UploadedFileResult {
  originalName: string;
  filename: string;
  url: string;
  size: number;
  originalSize: number;
  format: string;
  optimized: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

@Controller('api/files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly imageOptimizationService: ImageOptimizationService,
    private readonly fileService: FileService,
  ) {}

  @Post('upload/bulk')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20)) // Tối đa 20 files
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: any,
  ): Promise<UploadedFileResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được upload');
    }

    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    this.logger.log(`Uploading ${files.length} files for user ${userId}`);

    const results: UploadedFileResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadSingleFile(file, userId);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          filename: '',
          url: '',
          size: 0,
          originalSize: file.size,
          format: file.mimetype,
          optimized: false,
        });
      }
    }

    this.logger.log(`Successfully uploaded ${results.filter(r => r.url).length}/${files.length} files`);
    return results;
  }

  private async uploadSingleFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadedFileResult> {
    const isImage = this.imageOptimizationService.isImage(file.mimetype);
    const originalSize = file.size;

    let buffer = file.buffer;
    let format = file.mimetype;
    let optimized = false;
    let dimensions: { width: number; height: number } | undefined;

    // Tối ưu hóa hình ảnh
    if (isImage) {
      try {
        const optimizedImage = await this.imageOptimizationService.optimizeImage(
          file.buffer,
          {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 85,
            format: 'webp', // Luôn chuyển sang WebP cho SEO tốt hơn
          },
        );

        buffer = optimizedImage.buffer;
        format = `image/${optimizedImage.format}`;
        optimized = true;
        dimensions = {
          width: optimizedImage.width,
          height: optimizedImage.height,
        };

        this.logger.debug(
          `Image optimized: ${file.originalname} (${this.formatBytes(originalSize)} -> ${this.formatBytes(optimizedImage.size)})`,
        );
      } catch (error) {
        this.logger.warn(`Failed to optimize image ${file.originalname}, uploading original:`, error);
        // Nếu tối ưu thất bại, upload file gốc
      }
    }

    // Tạo filename với extension phù hợp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = optimized
      ? this.imageOptimizationService.getExtensionForFormat('webp')
      : this.getFileExtension(file.originalname);
    const filename = `${timestamp}-${randomStr}.${ext}`;

    // Upload lên Minio
    const url = await this.minioService.uploadFile(
      'uploads',
      filename,
      buffer,
      format,
    );

    // Lưu metadata vào database qua FileService
    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: file.originalname,
      encoding: file.encoding || '7bit',
      mimetype: format,
      size: buffer.length,
      buffer: buffer,
      stream: null,
      destination: '',
      filename: filename,
      path: `uploads/${filename}`,
    };

    await this.fileService.uploadFile(multerFile, userId);

    return {
      originalName: file.originalname,
      filename,
      url,
      size: buffer.length,
      originalSize,
      format,
      optimized,
      dimensions,
    };
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'bin';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
