import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';

export interface ImageUploadResult {
  success: boolean;
  url: string;
  filename: string;
  bucket: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  metadata?: any;
}

export interface ImageEditOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  blur?: number;
  sharpen?: boolean;
  greyscale?: boolean;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export interface ImageMappingConfig {
  modelName: string;
  idField: string;
  imageField: string;
  recordId: string | number;
}

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload image từ buffer với options chỉnh sửa
   */
  async uploadImage(
    buffer: Buffer,
    filename: string,
    bucket: string = 'images',
    editOptions?: ImageEditOptions,
  ): Promise<ImageUploadResult> {
    try {
      let imageBuffer = buffer;
      let metadata: any = {};

      // Process image với sharp nếu có edit options
      if (editOptions) {
        let sharpInstance = sharp(buffer);

        // Resize
        if (editOptions.resize) {
          sharpInstance = sharpInstance.resize({
            width: editOptions.resize.width,
            height: editOptions.resize.height,
            fit: editOptions.resize.fit || 'cover',
          });
        }

        // Crop
        if (editOptions.crop) {
          sharpInstance = sharpInstance.extract(editOptions.crop);
        }

        // Rotate
        if (editOptions.rotate) {
          sharpInstance = sharpInstance.rotate(editOptions.rotate);
        }

        // Flip/Flop
        if (editOptions.flip) {
          sharpInstance = sharpInstance.flip();
        }
        if (editOptions.flop) {
          sharpInstance = sharpInstance.flop();
        }

        // Blur
        if (editOptions.blur) {
          sharpInstance = sharpInstance.blur(editOptions.blur);
        }

        // Sharpen
        if (editOptions.sharpen) {
          sharpInstance = sharpInstance.sharpen();
        }

        // Greyscale
        if (editOptions.greyscale) {
          sharpInstance = sharpInstance.greyscale();
        }

        // Format & Quality
        const format = editOptions.format || 'jpeg';
        const quality = editOptions.quality || 80;

        switch (format) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg({ quality });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality });
            break;
          case 'avif':
            sharpInstance = sharpInstance.avif({ quality });
            break;
        }

        // Get processed buffer và metadata
        imageBuffer = await sharpInstance.toBuffer();
        metadata = await sharp(imageBuffer).metadata();
      } else {
        // Chỉ lấy metadata
        metadata = await sharp(buffer).metadata();
      }

      // Upload to MinIO
      const contentType = this.getContentType(
        editOptions?.format || metadata.format || 'jpeg',
      );
      
      const uploadResult = await this.minioService.uploadFile(
        bucket,
        filename,
        imageBuffer,
        contentType,
      );

      this.logger.log(`Image uploaded successfully: ${filename}`);

      return {
        success: true,
        url: uploadResult,
        filename,
        bucket,
        size: imageBuffer.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        metadata,
      };
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload và mapping image vào database record
   */
  async uploadAndMapImage(
    buffer: Buffer,
    filename: string,
    mappingConfig: ImageMappingConfig,
    editOptions?: ImageEditOptions,
  ): Promise<{ uploadResult: ImageUploadResult; mappingResult: any }> {
    try {
      // Upload image
      const uploadResult = await this.uploadImage(
        buffer,
        filename,
        'images',
        editOptions,
      );

      // Get Prisma model
      const model = (this.prisma as any)[mappingConfig.modelName];
      if (!model) {
        throw new Error(`Model ${mappingConfig.modelName} not found`);
      }

      // Update record with image URL
      const updateData: any = {};
      updateData[mappingConfig.imageField] = uploadResult.url;

      const whereCondition: any = {};
      whereCondition[mappingConfig.idField] = mappingConfig.recordId;

      const mappingResult = await model.update({
        where: whereCondition,
        data: updateData,
      });

      this.logger.log(
        `Image mapped to ${mappingConfig.modelName}[${mappingConfig.recordId}]`,
      );

      return { uploadResult, mappingResult };
    } catch (error) {
      this.logger.error('Error uploading and mapping image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    images: Array<{ buffer: Buffer; filename: string }>,
    bucket: string = 'images',
    editOptions?: ImageEditOptions,
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (const image of images) {
      try {
        const result = await this.uploadImage(
          image.buffer,
          image.filename,
          bucket,
          editOptions,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(`Error uploading ${image.filename}:`, error);
        results.push({
          success: false,
          url: '',
          filename: image.filename,
          bucket,
          size: 0,
        });
      }
    }

    return results;
  }

  /**
   * Copy image từ URL và upload
   */
  async copyImageFromUrl(
    imageUrl: string,
    filename: string,
    bucket: string = 'images',
    editOptions?: ImageEditOptions,
  ): Promise<ImageUploadResult> {
    try {
      // Fetch image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload
      return await this.uploadImage(buffer, filename, bucket, editOptions);
    } catch (error) {
      this.logger.error('Error copying image from URL:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail từ image
   */
  async generateThumbnail(
    buffer: Buffer,
    width: number = 200,
    height: number = 200,
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * Get content type từ format
   */
  private getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };

    return contentTypes[format.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Validate image
   */
  async validateImage(
    buffer: Buffer,
  ): Promise<{ valid: boolean; error?: string; metadata?: any }> {
    try {
      const metadata = await sharp(buffer).metadata();

      // Check format
      const allowedFormats = ['jpeg', 'png', 'webp', 'avif', 'gif'];
      if (!allowedFormats.includes(metadata.format || '')) {
        return {
          valid: false,
          error: `Invalid image format: ${metadata.format}`,
        };
      }

      // Check size
      if (buffer.length > 10 * 1024 * 1024) {
        // 10MB
        return {
          valid: false,
          error: 'Image size exceeds 10MB',
        };
      }

      return {
        valid: true,
        metadata,
      };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid image: ${error.message}`,
      };
    }
  }

  /**
   * Batch upload và map images
   */
  async batchUploadAndMap(
    items: Array<{
      buffer: Buffer;
      filename: string;
      mappingConfig: ImageMappingConfig;
      editOptions?: ImageEditOptions;
    }>,
  ): Promise<
    Array<{ uploadResult: ImageUploadResult; mappingResult: any; error?: string }>
  > {
    const results = [];

    for (const item of items) {
      try {
        const result = await this.uploadAndMapImage(
          item.buffer,
          item.filename,
          item.mappingConfig,
          item.editOptions,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(`Error processing ${item.filename}:`, error);
        results.push({
          uploadResult: {
            success: false,
            url: '',
            filename: item.filename,
            bucket: 'images',
            size: 0,
          },
          mappingResult: null,
          error: error.message,
        });
      }
    }

    return results;
  }
}
