import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

const execAsync = promisify(exec);

interface NormalizeProductsDto {
  dryRun?: boolean;
  limit?: number;
  threshold?: number;
  force?: boolean;
}

@Controller('api/ketoan')
export class ProductNormalizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('normalize-products')
  async normalizeProducts(@Body() dto: NormalizeProductsDto) {
    try {
      const { dryRun = false, limit = 10, threshold, force = false } = dto;

      // Build command
      const scriptPath = join(process.cwd(), 'scripts', 'updateten2.js');
      let command = `node ${scriptPath}`;

      if (dryRun) {
        command += ' --dry-run';
      }

      if (limit > 0) {
        command += ` --limit=${limit}`;
      }

      if (threshold) {
        command += ` --threshold=${threshold}`;
      }

      if (force) {
        command += ' --force';
      }

      // Execute the script
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      // Get stats after normalization
      const stats = await this.getStats();

      return {
        success: true,
        message: dryRun 
          ? `Preview completed for ${limit || 'all'} products`
          : `Successfully normalized ${limit || 'all'} products`,
        output: stdout,
        stats,
      };
    } catch (error) {
      console.error('Normalization error:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to normalize products',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getStats() {
    try {
      const [total, normalized, pending] = await Promise.all([
        this.prisma.ext_sanphamhoadon.count({
          where: { ten: { not: null } },
        }),
        this.prisma.ext_sanphamhoadon.count({
          where: { ten2: { not: null } },
        }),
        this.prisma.ext_sanphamhoadon.count({
          where: {
            ten: { not: null },
            ten2: null,
          },
        }),
      ]);

      return {
        total,
        normalized,
        pending,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        normalized: 0,
        pending: 0,
      };
    }
  }
}
