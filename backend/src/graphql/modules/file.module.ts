import { Module } from '@nestjs/common';
import { FileService } from '../../services/file.service';
import { MinioService } from '../../services/minio.service';
import { FileResolver } from '../resolvers/file.resolver';
import { FolderResolver } from '../resolvers/folder.resolver';
// import { UploadScalar } from '../scalars/upload.scalar'; // Commented out - using graphql-upload-ts
import { PrismaService } from '../../prisma/prisma.service';
import { FileController } from '../../controllers/file.controller';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [AuthModule],
  controllers: [FileController],
  providers: [
    FileService,
    MinioService,
    FileResolver,
    FolderResolver,
    // UploadScalar, // Commented out - using graphql-upload-ts
    PrismaService,
    UserService, // Add UserService for JwtAuthGuard
  ],
  exports: [FileService, MinioService],
})
export class FileModule {}
