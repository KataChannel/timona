"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const enrollments_service_1 = require("./enrollments.service");
const enrollment_entity_1 = require("./entities/enrollment.entity");
const lesson_progress_entity_1 = require("./entities/lesson-progress.entity");
const enroll_course_input_1 = require("./dto/enroll-course.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let EnrollmentsResolver = class EnrollmentsResolver {
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    enrollCourse(user, enrollCourseInput) {
        return this.enrollmentsService.enroll(user.id, enrollCourseInput.courseId);
    }
    getMyEnrollments(user) {
        return this.enrollmentsService.getMyEnrollments(user.id);
    }
    getEnrollment(user, courseId) {
        return this.enrollmentsService.getEnrollment(user.id, courseId);
    }
    dropCourse(user, courseId) {
        return this.enrollmentsService.dropCourse(user.id, courseId);
    }
    getCourseEnrollments(user, courseId) {
        return this.enrollmentsService.getCourseEnrollments(courseId, user.id);
    }
    markLessonComplete(user, enrollmentId, lessonId) {
        return this.enrollmentsService.markLessonComplete(user.id, enrollmentId, lessonId);
    }
};
exports.EnrollmentsResolver = EnrollmentsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => enrollment_entity_1.Enrollment, { name: 'enrollCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('enrollCourseInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, enroll_course_input_1.EnrollCourseInput]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "enrollCourse", null);
__decorate([
    (0, graphql_1.Query)(() => [enrollment_entity_1.Enrollment], { name: 'myEnrollments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "getMyEnrollments", null);
__decorate([
    (0, graphql_1.Query)(() => enrollment_entity_1.Enrollment, { name: 'enrollment', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "getEnrollment", null);
__decorate([
    (0, graphql_1.Mutation)(() => enrollment_entity_1.Enrollment, { name: 'dropCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "dropCourse", null);
__decorate([
    (0, graphql_1.Query)(() => [enrollment_entity_1.Enrollment], { name: 'courseEnrollments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "getCourseEnrollments", null);
__decorate([
    (0, graphql_1.Mutation)(() => lesson_progress_entity_1.LessonProgress, { name: 'markLessonComplete' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('enrollmentId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('lessonId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsResolver.prototype, "markLessonComplete", null);
exports.EnrollmentsResolver = EnrollmentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => enrollment_entity_1.Enrollment),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService])
], EnrollmentsResolver);
//# sourceMappingURL=enrollments.resolver.js.map