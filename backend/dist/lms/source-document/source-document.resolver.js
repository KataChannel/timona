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
exports.SourceDocumentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const source_document_service_1 = require("./source-document.service");
const minio_service_1 = require("../../minio/minio.service");
const source_document_entity_1 = require("./entities/source-document.entity");
const file_upload_entity_1 = require("../files/entities/file-upload.entity");
const source_document_dto_1 = require("./dto/source-document.dto");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let SourceDocumentResolver = class SourceDocumentResolver {
    constructor(sourceDocumentService, minioService, prisma, configService) {
        this.sourceDocumentService = sourceDocumentService;
        this.minioService = minioService;
        this.prisma = prisma;
        this.configService = configService;
    }
    async user(sourceDocument) {
        if (!sourceDocument.userId)
            return null;
        return this.prisma.user.findUnique({
            where: { id: sourceDocument.userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
            },
        });
    }
    async createSourceDocument(user, input) {
        return this.sourceDocumentService.create(user.id, input);
    }
    async sourceDocuments(filter, page, limit) {
        const result = await this.sourceDocumentService.findAll(filter, page, limit);
        console.log('📄 Source documents query:', {
            filter,
            page,
            limit,
            totalItems: result.items.length,
            totalCount: result.total,
        });
        return result.items;
    }
    async sourceDocument(id) {
        return this.sourceDocumentService.findOne(id);
    }
    async updateSourceDocument(id, input) {
        return this.sourceDocumentService.update(id, input);
    }
    async deleteSourceDocument(id) {
        return this.sourceDocumentService.delete(id);
    }
    async linkDocumentToCourse(user, input) {
        return this.sourceDocumentService.linkToCourse(user.id, input);
    }
    async unlinkDocumentFromCourse(courseId, documentId) {
        const result = await this.sourceDocumentService.unlinkFromCourse(courseId, documentId);
        return result.success;
    }
    async updateCourseDocumentLink(id, input) {
        return this.sourceDocumentService.updateCourseLink(id, input);
    }
    async courseDocuments(courseId) {
        return this.sourceDocumentService.getCourseDocuments(courseId);
    }
    async incrementDocumentDownload(id) {
        return this.sourceDocumentService.incrementDownloadCount(id);
    }
    async sourceDocumentStats(user) {
        const stats = await this.sourceDocumentService.getStats(user.id);
        return JSON.stringify(stats);
    }
    async uploadFile(file, bucket) {
        const { createReadStream, filename, mimetype } = await file;
        const chunks = [];
        const stream = createReadStream();
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const timestamp = Date.now();
                    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const uniqueFileName = `${timestamp}-${safeName}`;
                    const url = await this.minioService.uploadFile(bucket, uniqueFileName, buffer, mimetype);
                    resolve({
                        id: `${bucket}-${uniqueFileName}`,
                        url,
                        filename,
                        mimetype,
                        size: buffer.length,
                        bucket,
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async uploadSourceDocumentFile(documentId, file) {
        const { createReadStream, filename, mimetype } = await file;
        const chunks = [];
        const stream = createReadStream();
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const url = await this.minioService.uploadSourceDocument(documentId, buffer, filename, mimetype);
                    await this.sourceDocumentService.update(documentId, {
                        url,
                        fileName: filename,
                        fileSize: buffer.length,
                        mimeType: mimetype,
                    });
                    resolve(url);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async uploadDocumentThumbnail(documentId, file) {
        const { createReadStream, mimetype } = await file;
        const chunks = [];
        const stream = createReadStream();
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const url = await this.minioService.uploadDocumentThumbnail(documentId, buffer, mimetype);
                    await this.sourceDocumentService.update(documentId, {
                        thumbnailUrl: url,
                    });
                    resolve(url);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async analyzeSourceDocument(id) {
        return this.sourceDocumentService.analyzeDocument(id);
    }
    async bulkAnalyzeDocuments(user) {
        const result = await this.sourceDocumentService.bulkAnalyze(user.id);
        return JSON.stringify(result);
    }
};
exports.SourceDocumentResolver = SourceDocumentResolver;
__decorate([
    (0, graphql_1.ResolveField)('user'),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [source_document_entity_1.SourceDocument]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "user", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, source_document_dto_1.CreateSourceDocumentInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "createSourceDocument", null);
__decorate([
    (0, graphql_1.Query)(() => [source_document_entity_1.SourceDocument]),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 20 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [source_document_dto_1.SourceDocumentFilterInput, Number, Number]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "sourceDocuments", null);
__decorate([
    (0, graphql_1.Query)(() => source_document_entity_1.SourceDocument),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "sourceDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, source_document_dto_1.UpdateSourceDocumentInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "updateSourceDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "deleteSourceDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.CourseSourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, source_document_dto_1.LinkDocumentToCourseInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "linkDocumentToCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('documentId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "unlinkDocumentFromCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.CourseSourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, source_document_dto_1.UpdateCourseDocumentLinkInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "updateCourseDocumentLink", null);
__decorate([
    (0, graphql_1.Query)(() => [source_document_entity_1.CourseSourceDocument]),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "courseDocuments", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocument),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "incrementDocumentDownload", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "sourceDocumentStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_upload_entity_1.FileUploadResult),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(1, (0, graphql_1.Args)('bucket', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Promise, String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "uploadFile", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('documentId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Promise]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "uploadSourceDocumentFile", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('documentId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Promise]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "uploadDocumentThumbnail", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocument),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "analyzeSourceDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SourceDocumentResolver.prototype, "bulkAnalyzeDocuments", null);
exports.SourceDocumentResolver = SourceDocumentResolver = __decorate([
    (0, graphql_1.Resolver)(() => source_document_entity_1.SourceDocument),
    __metadata("design:paramtypes", [source_document_service_1.SourceDocumentService,
        minio_service_1.MinioService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], SourceDocumentResolver);
//# sourceMappingURL=source-document.resolver.js.map