import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioHealthIndicator extends HealthIndicator {
  private minioClient: Client;
  private readonly logger = new Logger(MinioHealthIndicator.name);

  constructor(private readonly configService: ConfigService) {
    super();
    
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.configService.get('MINIO_PORT', '9000'));
    const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
    
    this.logger.log(`MinIO Health Check Config: endpoint=${endpoint}, port=${port}, useSSL=${useSSL}`);
    
    // Create MinIO client for health checks
    this.minioClient = new Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test MinIO connection by listing buckets
      const buckets = await this.minioClient.listBuckets();
      
      this.logger.log(`MinIO health check passed. Found ${buckets.length} buckets`);
      
      return this.getStatus(key, true, {
        minio: 'up',
        message: 'MinIO connection is healthy',
        bucketsCount: buckets.length,
        buckets: buckets.map(bucket => bucket.name),
      });
    } catch (error) {
      this.logger.error(`MinIO health check failed: ${error.message}`, error);
      
      const result = this.getStatus(key, false, {
        minio: 'down',
        message: error.message,
      });
      
      throw new HealthCheckError('MinIO health check failed', result);
    }
  }
}
