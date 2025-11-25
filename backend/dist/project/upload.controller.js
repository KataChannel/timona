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
exports.ProjectUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const project_media_service_1 = require("./project-media.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectUploadController = class ProjectUploadController {
    constructor(mediaService, prisma) {
        this.mediaService = mediaService;
        this.prisma = prisma;
    }
    async uploadTaskFiles(taskId, files, request) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.BadRequestException('Task not found');
        }
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadedFiles = [];
        for (const file of files) {
            const uploadedFile = await this.mediaService.uploadFile({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            }, request.user.id, { taskId });
            uploadedFiles.push(uploadedFile);
        }
        return {
            success: true,
            files: uploadedFiles.map((f) => ({
                id: f.id,
                filename: f.filename,
                url: f.url,
                size: f.size,
                mimeType: f.mimeType,
                uploadedAt: f.createdAt,
            })),
        };
    }
    async uploadProjectFiles(projectId, files, request) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.BadRequestException('Project not found');
        }
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: request.user.id,
                },
            },
        });
        if (!member) {
            throw new common_1.BadRequestException('You are not a member of this project');
        }
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadedFiles = [];
        for (const file of files) {
            const uploadedFile = await this.mediaService.uploadFile({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            }, request.user.id, { projectId });
            uploadedFiles.push(uploadedFile);
        }
        return {
            success: true,
            files: uploadedFiles.map((f) => ({
                id: f.id,
                filename: f.filename,
                url: f.url,
                size: f.size,
                mimeType: f.mimeType,
                uploadedAt: f.createdAt,
            })),
        };
    }
    async uploadChatFiles(messageId, files, request) {
        const message = await this.prisma.chatMessagePM.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.BadRequestException('Message not found');
        }
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadedFiles = [];
        for (const file of files) {
            const uploadedFile = await this.mediaService.uploadFile({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            }, request.user.id, { messageId });
            uploadedFiles.push(uploadedFile);
        }
        return {
            success: true,
            files: uploadedFiles.map((f) => ({
                id: f.id,
                filename: f.filename,
                url: f.url,
                size: f.size,
                mimeType: f.mimeType,
                uploadedAt: f.createdAt,
            })),
        };
    }
};
exports.ProjectUploadController = ProjectUploadController;
__decorate([
    (0, common_1.Post)('task/:taskId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ProjectUploadController.prototype, "uploadTaskFiles", null);
__decorate([
    (0, common_1.Post)('project/:projectId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ProjectUploadController.prototype, "uploadProjectFiles", null);
__decorate([
    (0, common_1.Post)('chat/:messageId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ProjectUploadController.prototype, "uploadChatFiles", null);
exports.ProjectUploadController = ProjectUploadController = __decorate([
    (0, common_1.Controller)('api/project/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_media_service_1.ProjectMediaService,
        prisma_service_1.PrismaService])
], ProjectUploadController);
//# sourceMappingURL=upload.controller.js.map