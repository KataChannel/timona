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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const lesson_progress_entity_1 = require("./lesson-progress.entity");
const course_entity_1 = require("../../courses/entities/course.entity");
(0, graphql_1.registerEnumType)(client_1.EnrollmentStatus, {
    name: 'EnrollmentStatus',
    description: 'Status of course enrollment',
});
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Enrollment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Enrollment.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Enrollment.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.EnrollmentStatus),
    __metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Enrollment.prototype, "progress", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Enrollment.prototype, "enrolledAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Enrollment.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Enrollment.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Enrollment.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => course_entity_1.Course, { nullable: true }),
    __metadata("design:type", course_entity_1.Course)
], Enrollment.prototype, "course", void 0);
__decorate([
    (0, graphql_1.Field)(() => [lesson_progress_entity_1.LessonProgress], { nullable: true }),
    __metadata("design:type", Array)
], Enrollment.prototype, "lessonProgress", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, graphql_1.ObjectType)()
], Enrollment);
//# sourceMappingURL=enrollment.entity.js.map