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
var FilesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const minio_service_1 = require("../minio/minio.service");
const image_optimization_service_1 = require("../services/image-optimization.service");
const file_service_1 = require("../services/file.service");
let FilesController = FilesController_1 = class FilesController {
    constructor(minioService, imageOptimizationService, fileService) {
        this.minioService = minioService;
        this.imageOptimizationService = imageOptimizationService;
        this.fileService = fileService;
        this.logger = new common_1.Logger(FilesController_1.name);
    }
    async uploadFiles(files, request) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Không có file nào được upload');
        }
        const userId = request.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in request');
        }
        this.logger.log(`Uploading ${files.length} files for user ${userId}`);
        const results = [];
        for (const file of files) {
            try {
                const result = await this.uploadSingleFile(file, userId);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to upload file ${file.originalname}:`, error);
                results.push({
                    originalName: file.originalname,
                    filename: '',
                    url: '',
                    size: 0,
                    originalSize: file.size,
                    format: file.mimetype,
                    optimized: false,
                });
            }
        }
        this.logger.log(`Successfully uploaded ${results.filter(r => r.url).length}/${files.length} files`);
        return results;
    }
    async uploadSingleFile(file, userId) {
        const isImage = this.imageOptimizationService.isImage(file.mimetype);
        const originalSize = file.size;
        let buffer = file.buffer;
        let format = file.mimetype;
        let optimized = false;
        let dimensions;
        if (isImage) {
            try {
                const optimizedImage = await this.imageOptimizationService.optimizeImage(file.buffer, {
                    maxWidth: 2048,
                    maxHeight: 2048,
                    quality: 85,
                    format: 'webp',
                });
                buffer = optimizedImage.buffer;
                format = `image/${optimizedImage.format}`;
                optimized = true;
                dimensions = {
                    width: optimizedImage.width,
                    height: optimizedImage.height,
                };
                this.logger.debug(`Image optimized: ${file.originalname} (${this.formatBytes(originalSize)} -> ${this.formatBytes(optimizedImage.size)})`);
            }
            catch (error) {
                this.logger.warn(`Failed to optimize image ${file.originalname}, uploading original:`, error);
            }
        }
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = optimized
            ? this.imageOptimizationService.getExtensionForFormat('webp')
            : this.getFileExtension(file.originalname);
        const filename = `${timestamp}-${randomStr}.${ext}`;
        const url = await this.minioService.uploadFile('uploads', filename, buffer, format);
        const multerFile = {
            fieldname: 'file',
            originalname: file.originalname,
            encoding: file.encoding || '7bit',
            mimetype: format,
            size: buffer.length,
            buffer: buffer,
            stream: null,
            destination: '',
            filename: filename,
            path: `uploads/${filename}`,
        };
        await this.fileService.uploadFile(multerFile, userId);
        return {
            originalName: file.originalname,
            filename,
            url,
            size: buffer.length,
            originalSize,
            format,
            optimized,
            dimensions,
        };
    }
    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : 'bin';
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload/bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFiles", null);
exports.FilesController = FilesController = FilesController_1 = __decorate([
    (0, common_1.Controller)('api/files'),
    __metadata("design:paramtypes", [minio_service_1.MinioService,
        image_optimization_service_1.ImageOptimizationService,
        file_service_1.FileService])
], FilesController);
//# sourceMappingURL=files.controller.js.map