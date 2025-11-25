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
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const file_service_1 = require("../services/file.service");
let FileController = class FileController {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(file, folderId, metadataStr, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const metadata = metadataStr ? JSON.parse(metadataStr) : undefined;
        const userId = req.user.id;
        const uploadedFile = await this.fileService.uploadFile(file, userId, folderId, metadata);
        return {
            success: true,
            data: uploadedFile,
            message: 'File uploaded successfully',
        };
    }
    async uploadFiles(files, folderId, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const userId = req.user.id;
        const uploadedFiles = await Promise.all(files.map((file) => this.fileService.uploadFile(file, userId, folderId)));
        return {
            success: true,
            data: uploadedFiles,
            message: `${uploadedFiles.length} files uploaded successfully`,
        };
    }
    async getFile(id, req) {
        const userId = req.user.id;
        const file = await this.fileService.getFile(id, userId);
        return {
            success: true,
            data: file,
        };
    }
    async getFiles(page = 1, limit = 20, folderId, fileType, search, req) {
        const userId = req.user.id;
        const filters = {};
        if (folderId)
            filters.folderId = folderId;
        if (fileType)
            filters.fileType = fileType;
        if (search)
            filters.search = search;
        const result = await this.fileService.getFiles({ page, limit, filters }, userId);
        return {
            success: true,
            data: result,
        };
    }
    async updateFile(id, input, req) {
        const userId = req.user.id;
        const updated = await this.fileService.updateFile({ id, ...input }, userId);
        return {
            success: true,
            data: updated,
            message: 'File updated successfully',
        };
    }
    async deleteFile(id, req) {
        const userId = req.user.id;
        await this.fileService.deleteFile(id, userId);
        return {
            success: true,
            message: 'File deleted successfully',
        };
    }
    async getStorageStats(req) {
        const userId = req.user.id;
        const stats = await this.fileService.getStorageStats(userId);
        return {
            success: true,
            data: stats,
        };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('folderId')),
    __param(2, (0, common_1.Body)('metadata')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('folderId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('folderId')),
    __param(3, (0, common_1.Query)('fileType')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "updateFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getStorageStats", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)('api/files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map