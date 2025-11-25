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
exports.FilesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const file_upload_entity_1 = require("./entities/file-upload.entity");
const graphql_upload_ts_1 = require("graphql-upload-ts");
let FilesResolver = class FilesResolver {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadCourseThumbnail(user, file, courseId) {
        return this.filesService.uploadCourseThumbnail(file, user.id, courseId);
    }
    async uploadLessonVideo(user, file, courseId) {
        return this.filesService.uploadLessonVideo(file, user.id, courseId);
    }
    async uploadCourseMaterial(user, file, courseId) {
        return this.filesService.uploadCourseMaterial(file, user.id, courseId);
    }
    async deleteLMSFile(user, fileId, bucket) {
        return this.filesService.deleteFile(fileId, bucket, user.id);
    }
    async getPresignedUrl(fileId, bucket, expiresIn) {
        return this.filesService.getPresignedUrl(fileId, bucket, expiresIn);
    }
};
exports.FilesResolver = FilesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => file_upload_entity_1.FileUploadResult),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(2, (0, graphql_1.Args)('courseId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], FilesResolver.prototype, "uploadCourseThumbnail", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_upload_entity_1.FileUploadResult),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(2, (0, graphql_1.Args)('courseId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], FilesResolver.prototype, "uploadLessonVideo", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_upload_entity_1.FileUploadResult),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(2, (0, graphql_1.Args)('courseId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], FilesResolver.prototype, "uploadCourseMaterial", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteLMSFile' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('fileId', { type: () => String })),
    __param(2, (0, graphql_1.Args)('bucket', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesResolver.prototype, "deleteLMSFile", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('fileId', { type: () => String })),
    __param(1, (0, graphql_1.Args)('bucket', { type: () => String })),
    __param(2, (0, graphql_1.Args)('expiresIn', { type: () => Number, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], FilesResolver.prototype, "getPresignedUrl", null);
exports.FilesResolver = FilesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesResolver);
//# sourceMappingURL=files.resolver.js.map