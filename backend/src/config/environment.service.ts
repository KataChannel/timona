import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../config/env-config.service';

@Injectable()
export class EnvironmentService {
  constructor(private readonly envConfig: EnvConfigService) {}

  /**
   * Get all environment configuration
   * This is a demo service showing how to use environment variables
   */
  getEnvironmentInfo() {
    return {
      application: {
        nodeEnv: this.envConfig.nodeEnv,
        port: this.envConfig.port,
        frontendUrl: this.envConfig.frontendUrl,
        isProduction: this.envConfig.isProduction,
        isDevelopment: this.envConfig.isDevelopment,
      },
      database: {
        hasUrl: !!this.envConfig.databaseUrl,
        url: this.envConfig.databaseUrl ? 
          this.envConfig.databaseUrl.replace(/:[^:@]*@/, ':***@') : 'Not configured',
      },
      redis: {
        host: this.envConfig.redisHost,
        port: this.envConfig.redisPort,
        hasPassword: !!this.envConfig.redisPassword,
      },
      jwt: {
        hasSecret: !!this.envConfig.jwtSecret,
        expiresIn: this.envConfig.jwtExpiresIn,
      },
      minio: {
        endpoint: this.envConfig.minioEndpoint,
        port: this.envConfig.minioPort,
        bucketName: this.envConfig.minioBucketName,
        useSSL: this.envConfig.minioUseSSL,
        hasCredentials: !!(this.envConfig.minioAccessKey && this.envConfig.minioSecretKey),
      },
    };
  }

  /**
   * Check if all required environment variables are configured
   */
  validateEnvironment(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = [];

    if (!this.envConfig.databaseUrl) {
      missingVars.push('DATABASE_URL');
    }

    if (!this.envConfig.jwtSecret || this.envConfig.jwtSecret === 'default-secret-key') {
      missingVars.push('JWT_SECRET');
    }

    if (!this.envConfig.minioAccessKey || this.envConfig.minioAccessKey === 'minioadmin') {
      missingVars.push('MINIO_ACCESS_KEY');
    }

    if (!this.envConfig.minioSecretKey || this.envConfig.minioSecretKey === 'minioadmin') {
      missingVars.push('MINIO_SECRET_KEY');
    }

    return {
      isValid: missingVars.length === 0,
      missingVars,
    };
  }
}
