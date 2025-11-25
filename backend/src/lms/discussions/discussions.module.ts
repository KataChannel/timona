import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DiscussionsService } from './discussions.service';
import { DiscussionsResolver } from './discussions.resolver';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DiscussionsService, DiscussionsResolver, UserService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
