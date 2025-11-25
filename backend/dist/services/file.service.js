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
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("./minio.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let FileService = FileService_1 = class FileService {
    constructor(prisma, minioService) {
        this.prisma = prisma;
        this.minioService = minioService;
        this.logger = new common_1.Logger(FileService_1.name);
    }
    getFileType(mimeType) {
        if (mimeType.startsWith('image/'))
            return client_1.FileType.IMAGE;
        if (mimeType.startsWith('video/'))
            return client_1.FileType.VIDEO;
        if (mimeType.startsWith('audio/'))
            return client_1.FileType.AUDIO;
        if (mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('text') ||
            mimeType.includes('msword') ||
            mimeType.includes('officedocument')) {
            return client_1.FileType.DOCUMENT;
        }
        if (mimeType.includes('zip') ||
            mimeType.includes('rar') ||
            mimeType.includes('tar') ||
            mimeType.includes('compressed')) {
            return client_1.FileType.ARCHIVE;
        }
        return client_1.FileType.OTHER;
    }
    async uploadFile(file, userId, folderId, metadata) {
        try {
            if (folderId) {
                const folder = await this.prisma.fileFolder.findUnique({
                    where: { id: folderId },
                });
                if (!folder) {
                    throw new common_1.NotFoundException('Folder not found');
                }
                if (folder.userId !== userId) {
                    throw new common_1.ForbiddenException('You do not have access to this folder');
                }
            }
            const folderPath = folderId
                ? await this.getFolderPath(folderId)
                : 'general';
            const uploadResult = await this.minioService.uploadFile(file, folderPath);
            const fileType = this.getFileType(file.mimetype);
            const createdFile = await this.prisma.file.create({
                data: {
                    filename: uploadResult.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    fileType,
                    url: uploadResult.url,
                    bucket: uploadResult.bucket,
                    path: uploadResult.path,
                    etag: uploadResult.etag,
                    folderId,
                    userId,
                    visibility: client_1.FileVisibility.PRIVATE,
                    metadata,
                },
                include: {
                    folder: true,
                    shares: true,
                },
            });
            this.logger.log(`File uploaded: ${createdFile.id} by user ${userId}`);
            return createdFile;
        }
        catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFile(id, userId) {
        const file = await this.prisma.file.findUnique({
            where: { id },
            include: {
                folder: true,
                shares: true,
            },
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.userId !== userId && file.visibility === client_1.FileVisibility.PRIVATE) {
            throw new common_1.ForbiddenException('You do not have access to this file');
        }
        return file;
    }
    async getFiles(input, userId) {
        const { page = 1, limit = 20, filters = {}, sortBy = 'createdAt', sortOrder = 'desc', allUsers = false, } = input;
        const skip = (page - 1) * limit;
        const where = {
            ...(allUsers ? {} : { userId }),
            ...(filters.fileType && { fileType: filters.fileType }),
            ...(filters.folderId && { folderId: filters.folderId }),
            ...(filters.visibility && { visibility: filters.visibility }),
            ...(filters.mimeType && { mimeType: { contains: filters.mimeType } }),
            ...(filters.tags &&
                filters.tags.length > 0 && {
                tags: { hasSome: filters.tags },
            }),
            ...(filters.search && {
                OR: [
                    { originalName: { contains: filters.search, mode: 'insensitive' } },
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const total = await this.prisma.file.count({ where });
        const files = await this.prisma.file.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                folder: true,
                shares: true,
            },
        });
        const totalPages = Math.ceil(total / limit);
        return {
            items: files,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
    async updateFile(input, userId) {
        const file = await this.getFile(input.id, userId);
        if (file.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this file');
        }
        const updated = await this.prisma.file.update({
            where: { id: input.id },
            data: {
                title: input.title,
                description: input.description,
                alt: input.alt,
                tags: input.tags,
                folderId: input.folderId,
                visibility: input.visibility,
                metadata: input.metadata,
            },
            include: {
                folder: true,
                shares: true,
            },
        });
        this.logger.log(`File updated: ${updated.id} by user ${userId}`);
        return updated;
    }
    async deleteFile(id, userId) {
        const file = await this.getFile(id, userId);
        if (file.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this file');
        }
        await this.minioService.deleteFile(file.path);
        await this.prisma.file.delete({ where: { id } });
        this.logger.log(`File deleted: ${id} by user ${userId}`);
        return true;
    }
    async createFolder(input, userId) {
        let path = `/${input.name}`;
        if (input.parentId) {
            const parent = await this.prisma.fileFolder.findUnique({
                where: { id: input.parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent folder not found');
            }
            if (parent.userId !== userId) {
                throw new common_1.ForbiddenException('You do not have access to parent folder');
            }
            path = `${parent.path}/${input.name}`;
        }
        const folder = await this.prisma.fileFolder.create({
            data: {
                name: input.name,
                description: input.description,
                parentId: input.parentId,
                path,
                userId,
                color: input.color,
                icon: input.icon,
            },
            include: {
                parent: true,
                children: true,
                files: true,
            },
        });
        this.logger.log(`Folder created: ${folder.id} by user ${userId}`);
        return folder;
    }
    async getFolder(id, userId) {
        const folder = await this.prisma.fileFolder.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                files: true,
            },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        if (folder.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this folder');
        }
        return folder;
    }
    async getFolders(userId) {
        return this.prisma.fileFolder.findMany({
            where: { userId },
            include: {
                parent: true,
                children: true,
                files: true,
            },
            orderBy: { path: 'asc' },
        });
    }
    async updateFolder(input, userId) {
        const folder = await this.getFolder(input.id, userId);
        if (folder.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this folder');
        }
        let path = folder.path;
        if (input.name || input.parentId !== undefined) {
            const name = input.name || folder.name;
            if (input.parentId) {
                const parent = await this.prisma.fileFolder.findUnique({
                    where: { id: input.parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Parent folder not found');
                }
                path = `${parent.path}/${name}`;
            }
            else {
                path = `/${name}`;
            }
        }
        const updated = await this.prisma.fileFolder.update({
            where: { id: input.id },
            data: {
                name: input.name,
                description: input.description,
                parentId: input.parentId,
                path,
                color: input.color,
                icon: input.icon,
            },
            include: {
                parent: true,
                children: true,
                files: true,
            },
        });
        this.logger.log(`Folder updated: ${updated.id} by user ${userId}`);
        return updated;
    }
    async deleteFolder(id, userId) {
        const folder = await this.getFolder(id, userId);
        if (folder.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this folder');
        }
        if (folder.isSystem) {
            throw new common_1.BadRequestException('Cannot delete system folder');
        }
        const childCount = await this.prisma.fileFolder.count({
            where: { parentId: id },
        });
        if (childCount > 0) {
            throw new common_1.BadRequestException('Cannot delete folder with subfolders');
        }
        const files = await this.prisma.file.findMany({
            where: { folderId: id },
        });
        for (const file of files) {
            await this.deleteFile(file.id, userId);
        }
        await this.prisma.fileFolder.delete({ where: { id } });
        this.logger.log(`Folder deleted: ${id} by user ${userId}`);
        return true;
    }
    async getFolderPath(folderId) {
        const folder = await this.prisma.fileFolder.findUnique({
            where: { id: folderId },
        });
        return folder ? folder.path : 'general';
    }
    async moveFiles(input, userId) {
        if (input.targetFolderId) {
            await this.getFolder(input.targetFolderId, userId);
        }
        const files = await this.prisma.file.findMany({
            where: {
                id: { in: input.fileIds },
                userId,
            },
        });
        if (files.length !== input.fileIds.length) {
            throw new common_1.BadRequestException('Some files not found or access denied');
        }
        const updated = await this.prisma.$transaction(files.map((file) => this.prisma.file.update({
            where: { id: file.id },
            data: { folderId: input.targetFolderId },
            include: { folder: true, shares: true },
        })));
        this.logger.log(`${updated.length} files moved by user ${userId}`);
        return updated;
    }
    async bulkDeleteFiles(input, userId) {
        const files = await this.prisma.file.findMany({
            where: {
                id: { in: input.fileIds },
                userId,
            },
        });
        if (files.length !== input.fileIds.length) {
            throw new common_1.BadRequestException('Some files not found or access denied');
        }
        await Promise.all(files.map((file) => this.minioService.deleteFile(file.path)));
        const result = await this.prisma.file.deleteMany({
            where: {
                id: { in: input.fileIds },
                userId,
            },
        });
        this.logger.log(`${result.count} files deleted by user ${userId}`);
        return result.count;
    }
    async bulkUpdateFiles(input, userId) {
        const files = await this.prisma.file.findMany({
            where: {
                id: { in: input.fileIds },
                userId,
            },
        });
        if (files.length !== input.fileIds.length) {
            throw new common_1.BadRequestException('Some files not found or access denied');
        }
        const updateData = {};
        if (input.visibility)
            updateData.visibility = input.visibility;
        if (input.tags)
            updateData.tags = input.tags;
        if (input.folderId !== undefined) {
            updateData.folder = input.folderId
                ? { connect: { id: input.folderId } }
                : { disconnect: true };
        }
        const updated = await this.prisma.$transaction(files.map((file) => this.prisma.file.update({
            where: { id: file.id },
            data: updateData,
            include: { folder: true, shares: true },
        })));
        this.logger.log(`${updated.length} files updated by user ${userId}`);
        return updated;
    }
    async getStorageStats(userId) {
        const totalFiles = await this.prisma.file.count({ where: { userId } });
        const totalFolders = await this.prisma.fileFolder.count({ where: { userId } });
        const files = await this.prisma.file.findMany({
            where: { userId },
            select: { size: true, fileType: true, visibility: true },
        });
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const filesByType = Object.values(client_1.FileType).map((type) => {
            const typeFiles = files.filter((f) => f.fileType === type);
            return {
                type,
                count: typeFiles.length,
                totalSize: typeFiles.reduce((sum, f) => sum + f.size, 0),
            };
        });
        const filesByVisibility = Object.values(client_1.FileVisibility).map((visibility) => {
            const visFiles = files.filter((f) => f.visibility === visibility);
            return {
                visibility,
                count: visFiles.length,
            };
        });
        return {
            totalFiles,
            totalSize,
            totalFolders,
            filesByType,
            filesByVisibility,
        };
    }
    async createFileShare(input, userId) {
        const file = await this.getFile(input.fileId, userId);
        if (file.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to share this file');
        }
        const token = crypto.randomBytes(32).toString('hex');
        const share = await this.prisma.fileShare.create({
            data: {
                fileId: input.fileId,
                sharedBy: userId,
                sharedWith: input.sharedWith,
                token,
                expiresAt: input.expiresAt,
                password: input.password,
                canDownload: input.canDownload ?? true,
                canView: input.canView ?? true,
            },
            include: {
                file: true,
            },
        });
        this.logger.log(`File share created: ${share.id} by user ${userId}`);
        return share;
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService])
], FileService);
//# sourceMappingURL=file.service.js.map