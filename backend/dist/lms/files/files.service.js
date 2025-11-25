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
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const minio_service_1 = require("../../minio/minio.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const uuid_1 = require("uuid");
let FilesService = FilesService_1 = class FilesService {
    constructor(minioService, prisma) {
        this.minioService = minioService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(FilesService_1.name);
        this.ALLOWED_IMAGE_TYPES = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        this.ALLOWED_VIDEO_TYPES = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime',
        ];
        this.ALLOWED_DOCUMENT_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
        ];
        this.MAX_FILE_SIZE = {
            image: 5 * 1024 * 1024,
            video: 500 * 1024 * 1024,
            document: 10 * 1024 * 1024,
        };
    }
    async uploadFile(file, userId, type) {
        const { createReadStream, filename, mimetype } = file;
        this.validateFileType(mimetype, type);
        const fileExtension = this.getFileExtension(mimetype);
        const uniqueFilename = `${(0, uuid_1.v4)()}-${Date.now()}.${fileExtension}`;
        const bucket = this.getBucketName(type);
        try {
            const stream = createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            this.validateFileSize(buffer.length, type);
            const url = await this.minioService.uploadFile(bucket, uniqueFilename, buffer, mimetype);
            this.logger.log(`File uploaded: ${uniqueFilename} to bucket: ${bucket}`);
            return {
                id: uniqueFilename,
                url,
                filename,
                mimetype,
                size: buffer.length,
                bucket,
            };
        }
        catch (error) {
            this.logger.error('Error uploading file:', error);
            throw new common_1.BadRequestException('Failed to upload file');
        }
    }
    async uploadLessonVideo(file, userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course || course.instructorId !== userId) {
            throw new common_1.BadRequestException('Not authorized to upload to this course');
        }
        return this.uploadFile(file, userId, 'video');
    }
    async uploadCourseThumbnail(file, userId, courseId) {
        if (courseId) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
            });
            if (!course || course.instructorId !== userId) {
                throw new common_1.BadRequestException('Not authorized');
            }
        }
        return this.uploadFile(file, userId, 'image');
    }
    async uploadCourseMaterial(file, userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course || course.instructorId !== userId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        return this.uploadFile(file, userId, 'document');
    }
    async deleteFile(fileId, bucket, userId) {
        try {
            await this.minioService.deleteFile(bucket, fileId);
            this.logger.log(`File deleted: ${fileId} from bucket: ${bucket}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error deleting file:', error);
            throw new common_1.BadRequestException('Failed to delete file');
        }
    }
    async getPresignedUrl(fileId, bucket, expiresIn = 3600) {
        try {
            return await this.minioService.getPresignedUrl(bucket, fileId, expiresIn);
        }
        catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw new common_1.BadRequestException('Failed to generate presigned URL');
        }
    }
    validateFileType(mimetype, type) {
        const allowedTypes = {
            image: this.ALLOWED_IMAGE_TYPES,
            video: this.ALLOWED_VIDEO_TYPES,
            document: this.ALLOWED_DOCUMENT_TYPES,
        };
        if (!allowedTypes[type].includes(mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types for ${type}: ${allowedTypes[type].join(', ')}`);
        }
    }
    validateFileSize(size, type) {
        const maxSize = this.MAX_FILE_SIZE[type];
        if (size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSizeMB}MB for ${type}`);
        }
    }
    getFileExtension(mimetype) {
        const extensions = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'video/ogg': 'ogg',
            'video/quicktime': 'mov',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'text/plain': 'txt',
        };
        return extensions[mimetype] || 'bin';
    }
    getBucketName(type) {
        const buckets = {
            image: 'uploads',
            video: 'uploads',
            document: 'uploads',
        };
        return buckets[type];
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [minio_service_1.MinioService,
        prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map