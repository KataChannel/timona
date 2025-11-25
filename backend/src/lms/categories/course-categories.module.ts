import { Module } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesResolver } from './course-categories.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CourseCategoriesService, CourseCategoriesResolver, UserService],
  exports: [CourseCategoriesService],
})
export class CourseCategoriesModule {}
