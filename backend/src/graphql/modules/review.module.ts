import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { UserModule } from '../../user/user.module';
import { ReviewService } from '../../services/review.service';
import { ReviewResolver } from '../resolvers/review.resolver';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
