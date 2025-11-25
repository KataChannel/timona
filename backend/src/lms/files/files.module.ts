import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { MinioModule } from '../../minio/minio.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [MinioModule, PrismaModule, AuthModule],
  providers: [FilesService, FilesResolver, UserService],
  exports: [FilesService],
})
export class FilesModule {}
