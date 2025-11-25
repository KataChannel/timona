import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Application
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 4000);
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  // Database
  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL') || '';
  }

  // Redis
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  // JWT
  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'default-secret-key';
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '7d');
  }

  // Minio
  get minioEndpoint(): string {
    return this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
  }

  get minioPort(): number {
    return this.configService.get<number>('MINIO_PORT', 9000);
  }

  get minioAccessKey(): string {
    return this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
  }

  get minioSecretKey(): string {
    return this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';
  }

  get minioUseSSL(): boolean {
    return this.configService.get<boolean>('MINIO_USE_SSL', false);
  }

  get minioBucketName(): string {
    return this.configService.get<string>('MINIO_BUCKET_NAME', 'uploads');
  }

  // Helper method to check if we're in production
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Helper method to check if we're in development
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // Helper method to log environment configuration (without secrets)
  logConfiguration(): void {
    console.log('🔧 Environment Configuration:');
    console.log(`   NODE_ENV: ${this.nodeEnv}`);
    console.log(`   PORT: ${this.port}`);
    console.log(`   FRONTEND_URL: ${this.frontendUrl}`);
    console.log(`   REDIS_HOST: ${this.redisHost}:${this.redisPort}`);
    console.log(`   MINIO_ENDPOINT: ${this.minioEndpoint}:${this.minioPort}`);
    console.log(`   MINIO_BUCKET: ${this.minioBucketName}`);
    console.log(`   JWT_EXPIRES_IN: ${this.jwtExpiresIn}`);
  }
}
