"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const courses_module_1 = require("./courses/courses.module");
const course_categories_module_1 = require("./categories/course-categories.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const quizzes_module_1 = require("./quizzes/quizzes.module");
const reviews_module_1 = require("./reviews/reviews.module");
const files_module_1 = require("./files/files.module");
const certificates_module_1 = require("./certificates/certificates.module");
const discussions_module_1 = require("./discussions/discussions.module");
const source_document_module_1 = require("./source-document/source-document.module");
const prisma_module_1 = require("../prisma/prisma.module");
let LmsModule = class LmsModule {
};
exports.LmsModule = LmsModule;
exports.LmsModule = LmsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({}),
            courses_module_1.CoursesModule,
            course_categories_module_1.CourseCategoriesModule,
            enrollments_module_1.EnrollmentsModule,
            quizzes_module_1.QuizzesModule,
            reviews_module_1.ReviewsModule,
            files_module_1.FilesModule,
            certificates_module_1.CertificatesModule,
            discussions_module_1.DiscussionsModule,
            source_document_module_1.SourceDocumentModule,
        ],
        exports: [
            jwt_1.JwtModule,
            courses_module_1.CoursesModule,
            course_categories_module_1.CourseCategoriesModule,
            enrollments_module_1.EnrollmentsModule,
            quizzes_module_1.QuizzesModule,
            reviews_module_1.ReviewsModule,
            files_module_1.FilesModule,
            certificates_module_1.CertificatesModule,
            discussions_module_1.DiscussionsModule,
            source_document_module_1.SourceDocumentModule,
        ],
    })
], LmsModule);
//# sourceMappingURL=lms.module.js.map