import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import sharp from 'sharp';

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  bucket: string;
  path: string;
  etag: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    // Determine if running in Docker
    const isDocker = process.env.DOCKER_NETWORK_NAME !== undefined;
    
    // IMPORTANT: Separate internal connection from public URL
    // Internal connection: Direct to MinIO server (may use IP:port)
    // Public URL: For file access (may use domain with proxy)
    
    // Internal connection settings
    const internalEndpoint = isDocker 
      ? this.configService.get<string>('DOCKER_MINIO_ENDPOINT', 'minio')
      : this.configService.get<string>('MINIO_INTERNAL_ENDPOINT') || this.configService.get<string>('MINIO_ENDPOINT', '116.118.49.243');
    
    const internalPort = isDocker
      ? this.configService.get<string>('DOCKER_MINIO_PORT', '9000')
      : this.configService.get<string>('MINIO_INTERNAL_PORT') || this.configService.get<string>('MINIO_PORT', '12007');
    
    const internalSSL = this.configService.get<string>('MINIO_INTERNAL_SSL', 'false') === 'true';
    
    this.endpoint = internalEndpoint;
    this.port = typeof internalPort === 'string' ? parseInt(internalPort, 10) : internalPort;
    this.useSSL = internalSSL;
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'uploads');

    // Public URL for file access (used in browser, may be proxied through Nginx/Caddy)
    // This is separate from internal connection
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const forceHttps = this.configService.get<string>('MINIO_FORCE_HTTPS', 'false') === 'true';
    
    // Public endpoint and port (for external access via proxy/domain)
    const publicEndpoint = this.configService.get<string>('MINIO_PUBLIC_ENDPOINT', this.endpoint);
    const publicPort = this.configService.get<string>('MINIO_PUBLIC_PORT', String(this.port));
    const publicSSL = this.configService.get<string>('MINIO_PUBLIC_SSL') === 'true' || 
                      this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    
    // Determine protocol for public URL
    const protocol = (publicSSL || isProduction || forceHttps) ? 'https' : 'http';
    
    // Don't include port in URL if using default ports (80 for HTTP, 443 for HTTPS)
    const isDefaultPort = (protocol === 'https' && publicPort === '443') || (protocol === 'http' && publicPort === '80');
    this.publicUrl = isDefaultPort 
      ? `${protocol}://${publicEndpoint}` 
      : `${protocol}://${publicEndpoint}:${publicPort}`;
    
    this.logger.log(`MinIO Internal Connection: ${this.endpoint}:${this.port} (SSL: ${this.useSSL})`);
    this.logger.log(`MinIO Public URL: ${this.publicUrl}`);

    this.minioClient = new Minio.Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Ensure the default bucket exists
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);

        // Set bucket policy to public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
        this.logger.log(`Bucket '${this.bucketName}' policy set to public read`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload a file from buffer với optimize cho ảnh
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    try {
      let processedBuffer = file.buffer;
      let processedSize = file.size;
      let processedMimeType = file.mimetype;
      let ext = file.originalname.split('.').pop();
      const originalSize = file.size;

      // Optimize images to WebP
      if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
        try {
          this.logger.log(`Optimizing image: ${file.originalname} (${file.size} bytes)`);
          
          // Convert to WebP with high quality settings
          processedBuffer = await sharp(file.buffer)
            .webp({
              quality: 90, // High quality (90%)
              effort: 6,   // Maximum compression effort (0-6, higher = better compression but slower)
              lossless: false, // Use lossy compression for smaller size
              nearLossless: false,
              smartSubsample: true, // Better quality for specific images
            })
            .toBuffer();
          
          processedSize = processedBuffer.length;
          processedMimeType = 'image/webp';
          ext = 'webp';

          const savedBytes = originalSize - processedSize;
          const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
          this.logger.log(
            `Image optimized: ${file.originalname} | ` +
            `Original: ${this.formatBytes(originalSize)} → ` +
            `WebP: ${this.formatBytes(processedSize)} | ` +
            `Saved: ${this.formatBytes(savedBytes)} (${savedPercent}%)`,
          );
        } catch (error) {
          this.logger.warn(`Failed to optimize image, using original: ${error.message}`);
          // Fallback to original if optimization fails
          processedBuffer = file.buffer;
          processedSize = file.size;
          processedMimeType = file.mimetype;
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const filename = `${timestamp}-${randomStr}.${ext}`;
      const objectPath = `${folder}/${filename}`;

      // Upload to MinIO
      const metaData = {
        'Content-Type': processedMimeType,
        'X-Original-Name': file.originalname,
        'X-Original-Size': originalSize.toString(),
        'X-Optimized': file.mimetype.startsWith('image/') ? 'true' : 'false',
      };

      const result = await this.minioClient.putObject(
        this.bucketName,
        objectPath,
        processedBuffer,
        processedSize,
        metaData,
      );

      const url = `${this.publicUrl}/${this.bucketName}/${objectPath}`;

      this.logger.log(`File uploaded: ${objectPath} (${processedSize} bytes)`);

      return {
        filename,
        url,
        size: processedSize,
        mimeType: processedMimeType,
        bucket: this.bucketName,
        path: objectPath,
        etag: result.etag,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Upload from stream
   */
  async uploadStream(
    stream: Readable,
    filename: string,
    mimeType: string,
    size: number,
    folder: string = 'general',
  ): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const ext = filename.split('.').pop();
      const newFilename = `${timestamp}-${randomStr}.${ext}`;
      const objectPath = `${folder}/${newFilename}`;

      const metaData = {
        'Content-Type': mimeType,
        'X-Original-Name': filename,
      };

      const result = await this.minioClient.putObject(
        this.bucketName,
        objectPath,
        stream,
        size,
        metaData,
      );

      const url = `${this.publicUrl}/${this.bucketName}/${objectPath}`;

      this.logger.log(`Stream uploaded: ${objectPath} (${size} bytes)`);

      return {
        filename: newFilename,
        url,
        size,
        mimeType,
        bucket: this.bucketName,
        path: objectPath,
        etag: result.etag,
      };
    } catch (error) {
      this.logger.error(`Error uploading stream: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(objectPath: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectPath);
      this.logger.log(`File deleted: ${objectPath}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file as buffer
   */
  async getFile(objectPath: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectPath);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error getting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get presigned URL for temporary access
   */
  async getPresignedUrl(objectPath: string, expirySeconds: number = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectPath,
        expirySeconds,
      );
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string = ''): Promise<Minio.BucketItem[]> {
    try {
      const objectsStream = this.minioClient.listObjectsV2(
        this.bucketName,
        folder,
        true,
      );

      const objects: Minio.BucketItem[] = [];
      
      return new Promise((resolve, reject) => {
        objectsStream.on('data', (obj) => objects.push(obj));
        objectsStream.on('end', () => resolve(objects));
        objectsStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file stats
   */
  async getFileStat(objectPath: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(this.bucketName, objectPath);
    } catch (error) {
      this.logger.error(`Error getting file stat: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await this.minioClient.copyObject(
        this.bucketName,
        destPath,
        `/${this.bucketName}/${sourcePath}`,
        null,
      );
      this.logger.log(`File copied: ${sourcePath} -> ${destPath}`);
    } catch (error) {
      this.logger.error(`Error copying file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new bucket
   */
  async createBucket(bucketName: string): Promise<void> {
    try {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
      this.logger.log(`Bucket '${bucketName}' created`);
    } catch (error) {
      this.logger.error(`Error creating bucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get MinIO client instance
   */
  getClient(): Minio.Client {
    return this.minioClient;
  }

  /**
   * Get default bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Get public URL
   */
  getPublicUrl(): string {
    return this.publicUrl;
  }
}
