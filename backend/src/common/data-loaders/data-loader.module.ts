import { Module, Global } from '@nestjs/common';
import { TaskDataLoaderService } from './task-data-loader.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [TaskDataLoaderService],
  exports: [TaskDataLoaderService],
})
export class DataLoaderModule {}