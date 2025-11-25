import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CoursesModule } from './courses/courses.module';
import { CourseCategoriesModule } from './categories/course-categories.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FilesModule } from './files/files.module';
import { CertificatesModule } from './certificates/certificates.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { SourceDocumentModule } from './source-document/source-document.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}), // Global JWT for all LMS modules
    CoursesModule,
    CourseCategoriesModule,
    EnrollmentsModule,
    QuizzesModule,
    ReviewsModule,
    FilesModule,
    CertificatesModule,
    DiscussionsModule,
    SourceDocumentModule,
  ],
  exports: [
    JwtModule, // Export so child modules can use
    CoursesModule,
    CourseCategoriesModule,
    EnrollmentsModule,
    QuizzesModule,
    ReviewsModule,
    FilesModule,
    CertificatesModule,
    DiscussionsModule,
    SourceDocumentModule,
  ],
})
export class LmsModule {}
