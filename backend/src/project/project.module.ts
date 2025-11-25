import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { ProjectChatGateway } from './project-chat.gateway';
import { ProjectMediaService } from './project-media.service';
import { ProjectMediaResolver } from './project-media.resolver';
import { ProjectAnalyticsService } from './project-analytics.service';
import { ProjectAnalyticsResolver } from './project-analytics.resolver';
import { EmailService } from './email.service';
import { CalendarService } from './calendar.service';
import { CalendarResolver } from './calendar.resolver';
import { ProjectUploadController } from './upload.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../services/user.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // Provides JwtModule, AuthService for JwtAuthGuard
    MinioModule, // For file uploads
  ],
  controllers: [ProjectUploadController],
  providers: [
    ProjectService,
    ProjectResolver,
    ProjectChatGateway,
    ProjectMediaService,
    ProjectMediaResolver,
    ProjectAnalyticsService,
    ProjectAnalyticsResolver,
    EmailService,
    CalendarService,
    CalendarResolver,
    UserService, // Needed by JwtAuthGuard
  ],
  exports: [
    ProjectService,
    ProjectChatGateway,
    ProjectMediaService,
    ProjectAnalyticsService,
    EmailService,
    CalendarService,
  ],
})
export class ProjectModule {}
