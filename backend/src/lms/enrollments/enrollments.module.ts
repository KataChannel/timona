import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsResolver } from './enrollments.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [EnrollmentsService, EnrollmentsResolver, UserService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
