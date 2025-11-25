"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("../minio/minio.service");
const client_1 = require("@prisma/client");
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let ProjectMediaService = class ProjectMediaService {
    constructor(prisma, minioService) {
        this.prisma = prisma;
        this.minioService = minioService;
    }
    async uploadFile(file, userId, options) {
        this.validateFile(file);
        const mediaType = this.getMediaType(file.mimetype);
        const ext = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const bucketName = this.getBucketName(options);
        const objectName = `${bucketName}/${filename}`;
        try {
            const url = await this.minioService.uploadFile(bucketName, objectName, file.buffer, file.mimetype);
            if (options.taskId) {
                return await this.prisma.taskMedia.create({
                    data: {
                        type: mediaType,
                        url,
                        filename: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype,
                        caption: options.caption,
                        taskId: options.taskId,
                        uploadedBy: userId,
                    },
                    include: {
                        uploader: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                });
            }
            else if (options.projectId && !options.messageId) {
                return await this.prisma.$executeRaw `
          INSERT INTO project_media (id, type, url, filename, size, mime_type, caption, project_id, uploaded_by, created_at, updated_at)
          VALUES (${(0, uuid_1.v4)()}, ${mediaType}, ${url}, ${file.originalname}, ${file.size}, ${file.mimetype}, ${options.caption || null}, ${options.projectId}, ${userId}, NOW(), NOW())
          RETURNING *
        `;
            }
            else if (options.messageId) {
                return await this.prisma.$executeRaw `
          INSERT INTO chat_media (id, type, url, filename, size, mime_type, caption, message_id, uploaded_by, created_at, updated_at)
          VALUES (${(0, uuid_1.v4)()}, ${mediaType}, ${url}, ${file.originalname}, ${file.size}, ${file.mimetype}, ${options.caption || null}, ${options.messageId}, ${userId}, NOW(), NOW())
          RETURNING *
        `;
            }
            throw new common_1.BadRequestException('Invalid upload target');
        }
        catch (error) {
            console.error('Upload error:', error);
            throw new common_1.BadRequestException(`Upload failed: ${error.message}`);
        }
    }
    async uploadMultipleFiles(files, userId, options) {
        const uploadPromises = files.map((file) => this.uploadFile(file, userId, options));
        return await Promise.all(uploadPromises);
    }
    async getProjectFiles(projectId, filters) {
        const where = { projectId };
        if (filters?.type) {
            where.type = filters.type;
        }
        return [];
    }
    async getTaskFiles(taskId, filters) {
        const where = { taskId };
        if (filters?.type) {
            where.type = filters.type;
        }
        return await this.prisma.taskMedia.findMany({
            where,
            include: {
                uploader: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async deleteFile(fileId, userId, type) {
        try {
            if (type === 'task') {
                const media = await this.prisma.taskMedia.findUnique({
                    where: { id: fileId },
                });
                if (!media) {
                    throw new common_1.NotFoundException('File not found');
                }
                if (media.uploadedBy !== userId) {
                    const task = await this.prisma.task.findUnique({
                        where: { id: media.taskId },
                    });
                    if (task?.userId !== userId) {
                        throw new common_1.BadRequestException('Not authorized to delete this file');
                    }
                }
                try {
                    const bucketName = this.getBucketName({ taskId: media.taskId });
                    const objectName = this.getObjectNameFromUrl(media.url);
                    await this.minioService.deleteFile(bucketName, objectName);
                }
                catch (error) {
                    console.error('MinIO delete error:', error);
                }
                await this.prisma.taskMedia.delete({
                    where: { id: fileId },
                });
                return true;
            }
            throw new common_1.BadRequestException('Unsupported file type');
        }
        catch (error) {
            console.error('Delete file error:', error);
            throw error;
        }
    }
    validateFile(file) {
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }
    getMediaType(mimetype) {
        if (mimetype.startsWith('image/'))
            return client_1.MediaType.IMAGE;
        if (mimetype.startsWith('video/'))
            return client_1.MediaType.VIDEO;
        return client_1.MediaType.DOCUMENT;
    }
    getBucketName(options) {
        if (options.taskId)
            return 'tasks';
        if (options.messageId)
            return 'chats';
        if (options.projectId)
            return 'projects';
        return 'uploads';
    }
    getObjectNameFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1);
        }
        catch {
            return url;
        }
    }
    async getProjectFileStats(projectId) {
        return {
            totalFiles: 0,
            totalSize: 0,
            byType: {
                images: 0,
                documents: 0,
                videos: 0,
                audio: 0,
            },
        };
    }
    async getTaskFileStats(taskId) {
        const files = await this.prisma.taskMedia.findMany({
            where: { taskId },
            select: {
                type: true,
                size: true,
            },
        });
        const stats = {
            totalFiles: files.length,
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
            byType: {
                images: files.filter((f) => f.type === client_1.MediaType.IMAGE).length,
                documents: files.filter((f) => f.type === client_1.MediaType.DOCUMENT).length,
                videos: files.filter((f) => f.type === client_1.MediaType.VIDEO).length,
            },
        };
        return stats;
    }
};
exports.ProjectMediaService = ProjectMediaService;
exports.ProjectMediaService = ProjectMediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService])
], ProjectMediaService);
//# sourceMappingURL=project-media.service.js.map