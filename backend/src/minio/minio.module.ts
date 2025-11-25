import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';
import { ImageOptimizationService } from '../services/image-optimization.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MinioService, ImageOptimizationService],
  exports: [MinioService, ImageOptimizationService],
})
export class MinioModule {}
