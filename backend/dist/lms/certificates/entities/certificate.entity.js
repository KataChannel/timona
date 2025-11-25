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
exports.CertificateStats = exports.CertificateVerification = exports.Certificate = void 0;
const graphql_1 = require("@nestjs/graphql");
const course_entity_1 = require("../../courses/entities/course.entity");
const user_model_1 = require("../../../graphql/models/user.model");
let Certificate = class Certificate {
};
exports.Certificate = Certificate;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Certificate.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Certificate.prototype, "enrollmentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Certificate.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Certificate.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Certificate.prototype, "certificateNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Certificate.prototype, "courseName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Certificate.prototype, "instructorName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Certificate.prototype, "completionDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Certificate.prototype, "grade", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Certificate.prototype, "verificationUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Certificate.prototype, "issueDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Certificate.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Certificate.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], Certificate.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => course_entity_1.Course, { nullable: true }),
    __metadata("design:type", course_entity_1.Course)
], Certificate.prototype, "course", void 0);
exports.Certificate = Certificate = __decorate([
    (0, graphql_1.ObjectType)()
], Certificate);
let CertificateVerification = class CertificateVerification {
};
exports.CertificateVerification = CertificateVerification;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CertificateVerification.prototype, "valid", void 0);
__decorate([
    (0, graphql_1.Field)(() => Certificate),
    __metadata("design:type", Certificate)
], CertificateVerification.prototype, "certificate", void 0);
exports.CertificateVerification = CertificateVerification = __decorate([
    (0, graphql_1.ObjectType)()
], CertificateVerification);
let CertificateStats = class CertificateStats {
};
exports.CertificateStats = CertificateStats;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CertificateStats.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CertificateStats.prototype, "thisMonth", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CertificateStats.prototype, "thisYear", void 0);
exports.CertificateStats = CertificateStats = __decorate([
    (0, graphql_1.ObjectType)()
], CertificateStats);
//# sourceMappingURL=certificate.entity.js.map