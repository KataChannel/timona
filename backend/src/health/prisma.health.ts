import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to query the database
      await this.prismaService.$queryRaw`SELECT 1`;
      
      return this.getStatus(key, true, {
        database: 'up',
        message: 'Database connection is healthy',
      });
    } catch (error) {
      const result = this.getStatus(key, false, {
        database: 'down',
        message: error.message,
      });
      
      throw new HealthCheckError('Prisma health check failed', result);
    }
  }
}
