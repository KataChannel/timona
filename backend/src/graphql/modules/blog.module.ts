import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { BlogService } from '../../services/blog.service';
import { BlogResolver } from '../resolvers/blog.resolver';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BlogService, BlogResolver, UserService],
  exports: [BlogService],
})
export class BlogModule {}
