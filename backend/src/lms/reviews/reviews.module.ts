import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReviewsService, ReviewsResolver, UserService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
