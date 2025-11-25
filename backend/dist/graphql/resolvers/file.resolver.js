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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const file_service_1 = require("../../services/file.service");
const file_model_1 = require("../models/file.model");
const file_input_1 = require("../inputs/file.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let FileResolver = class FileResolver {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(file, folderId, metadata, context) {
        try {
            const userId = context.req.user.id;
            const multerFile = {
                fieldname: 'file',
                originalname: file.filename || file.originalname || 'file',
                encoding: file.encoding || '7bit',
                mimetype: file.mimetype || file.mimeType || 'application/octet-stream',
                size: file.size || 0,
                buffer: file.buffer || Buffer.from([]),
                stream: null,
                destination: '',
                filename: '',
                path: '',
            };
            const uploadedFile = await this.fileService.uploadFile(multerFile, userId, folderId, metadata);
            return {
                file: uploadedFile,
                success: true,
                message: 'File uploaded successfully',
            };
        }
        catch (error) {
            return {
                file: null,
                success: false,
                message: error.message,
            };
        }
    }
    async getFile(id, context) {
        const userId = context.req.user.id;
        return this.fileService.getFile(id, userId);
    }
    async getFiles(input, context) {
        const userId = context.req.user.id;
        return this.fileService.getFiles(input || {}, userId);
    }
    async updateFile(input, context) {
        const userId = context.req.user.id;
        return this.fileService.updateFile(input, userId);
    }
    async deleteFile(id, context) {
        const userId = context.req.user.id;
        return this.fileService.deleteFile(id, userId);
    }
    async moveFiles(input, context) {
        const userId = context.req.user.id;
        return this.fileService.moveFiles(input, userId);
    }
    async bulkDeleteFiles(input, context) {
        const userId = context.req.user.id;
        return this.fileService.bulkDeleteFiles(input, userId);
    }
    async bulkUpdateFiles(input, context) {
        const userId = context.req.user.id;
        return this.fileService.bulkUpdateFiles(input, userId);
    }
    async getStorageStats(context) {
        const userId = context.req.user.id;
        return this.fileService.getStorageStats(userId);
    }
    async createFileShare(input, context) {
        const userId = context.req.user.id;
        return this.fileService.createFileShare(input, userId);
    }
};
exports.FileResolver = FileResolver;
__decorate([
    (0, graphql_1.Mutation)(() => file_model_1.FileUploadResponse),
    __param(0, (0, graphql_1.Args)('file', { type: () => graphql_type_json_1.default })),
    __param(1, (0, graphql_1.Args)('folderId', { type: () => graphql_1.ID, nullable: true })),
    __param(2, (0, graphql_1.Args)('metadata', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "uploadFile", null);
__decorate([
    (0, graphql_1.Query)(() => file_model_1.File, { name: 'file' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "getFile", null);
__decorate([
    (0, graphql_1.Query)(() => file_model_1.PaginatedFiles, { name: 'files' }),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.GetFilesInput, nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.GetFilesInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "getFiles", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_model_1.File),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.UpdateFileInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.UpdateFileInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "updateFile", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "deleteFile", null);
__decorate([
    (0, graphql_1.Mutation)(() => [file_model_1.File]),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.MoveFilesInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.MoveFilesInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "moveFiles", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.Int),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.BulkDeleteFilesInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.BulkDeleteFilesInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "bulkDeleteFiles", null);
__decorate([
    (0, graphql_1.Mutation)(() => [file_model_1.File]),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.BulkUpdateFilesInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.BulkUpdateFilesInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "bulkUpdateFiles", null);
__decorate([
    (0, graphql_1.Query)(() => file_model_1.FileStorageStats, { name: 'fileStorageStats' }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "getStorageStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_model_1.FileShare),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.CreateFileShareInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.CreateFileShareInput, Object]),
    __metadata("design:returntype", Promise)
], FileResolver.prototype, "createFileShare", null);
exports.FileResolver = FileResolver = __decorate([
    (0, graphql_1.Resolver)(() => file_model_1.File),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileResolver);
//# sourceMappingURL=file.resolver.js.map