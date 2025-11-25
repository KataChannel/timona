import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface OptimizedImage {
  buffer: Buffer;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  progressive?: boolean;
}

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  private readonly DEFAULT_OPTIONS: ImageOptimizationOptions = {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
    format: 'webp',
    progressive: true,
  };

  /**
   * Tối ưu hóa hình ảnh - nén và chuyển sang WebP để SEO tốt hơn
   */
  async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImage> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      let pipeline = sharp(buffer);

      // Lấy metadata của ảnh gốc
      const metadata = await pipeline.metadata();
      this.logger.debug(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${buffer.length} bytes`);

      // Resize nếu vượt quá kích thước tối đa
      if (opts.maxWidth || opts.maxHeight) {
        pipeline = pipeline.resize({
          width: opts.maxWidth,
          height: opts.maxHeight,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Chuyển đổi format
      const targetFormat = opts.format === 'auto' 
        ? this.selectBestFormat(metadata.format as string)
        : opts.format;

      switch (targetFormat) {
        case 'webp':
          pipeline = pipeline.webp({
            quality: opts.quality,
            effort: 4, // 0-6, càng cao càng nén tốt nhưng chậm hơn
          });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: opts.quality,
            progressive: opts.progressive,
            mozjpeg: true, // Sử dụng mozjpeg encoder để nén tốt hơn
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality: opts.quality,
            compressionLevel: 9,
            progressive: opts.progressive,
          });
          break;
      }

      // Process image
      const optimizedBuffer = await pipeline.toBuffer();
      const optimizedMetadata = await sharp(optimizedBuffer).metadata();

      const result: OptimizedImage = {
        buffer: optimizedBuffer,
        format: targetFormat,
        width: optimizedMetadata.width!,
        height: optimizedMetadata.height!,
        size: optimizedBuffer.length,
      };

      // Log compression ratio
      const compressionRatio = ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(2);
      this.logger.log(
        `Image optimized: ${metadata.width}x${metadata.height} -> ${result.width}x${result.height}, ` +
        `${this.formatBytes(buffer.length)} -> ${this.formatBytes(result.size)} (${compressionRatio}% saved)`
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to optimize image:', error);
      throw error;
    }
  }

  /**
   * Tạo nhiều kích thước của cùng một ảnh (thumbnail, medium, large)
   */
  async generateResponsiveImages(
    buffer: Buffer,
    sizes: { name: string; width: number }[] = [
      { name: 'thumbnail', width: 150 },
      { name: 'small', width: 320 },
      { name: 'medium', width: 640 },
      { name: 'large', width: 1280 },
      { name: 'xlarge', width: 1920 },
    ],
  ): Promise<Map<string, OptimizedImage>> {
    const results = new Map<string, OptimizedImage>();

    for (const size of sizes) {
      try {
        const optimized = await this.optimizeImage(buffer, {
          maxWidth: size.width,
          format: 'webp',
        });
        results.set(size.name, optimized);
      } catch (error) {
        this.logger.error(`Failed to generate ${size.name} size:`, error);
      }
    }

    return results;
  }

  /**
   * Chọn format tốt nhất dựa trên format gốc
   */
  private selectBestFormat(originalFormat: string): 'webp' | 'jpeg' | 'png' {
    // PNG có alpha channel -> giữ PNG hoặc WebP
    if (originalFormat === 'png') {
      return 'webp'; // WebP hỗ trợ transparency và nén tốt hơn PNG
    }
    
    // GIF -> WebP (WebP hỗ trợ animation)
    if (originalFormat === 'gif') {
      return 'webp';
    }
    
    // Mặc định -> WebP (nén tốt nhất, hỗ trợ rộng rãi)
    return 'webp';
  }

  /**
   * Format bytes sang human-readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Kiểm tra file có phải là image không
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Lấy extension phù hợp với format
   */
  getExtensionForFormat(format: 'webp' | 'jpeg' | 'png'): string {
    const extensions = {
      webp: 'webp',
      jpeg: 'jpg',
      png: 'png',
    };
    return extensions[format];
  }
}
