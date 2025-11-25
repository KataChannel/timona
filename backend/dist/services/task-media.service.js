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
exports.TaskMediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaskMediaService = class TaskMediaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTaskId(taskId) {
        return this.prisma.taskMedia.findMany({
            where: { taskId },
            include: {
                uploader: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(taskId, uploaderId, mediaData) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                shares: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const hasAccess = task.userId === uploaderId ||
            task.shares.some(share => share.sharedWith === uploaderId &&
                share.isActive &&
                (share.permission === 'EDIT' || share.permission === 'ADMIN'));
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have permission to upload media to this task');
        }
        return this.prisma.taskMedia.create({
            data: {
                type: mediaData.type,
                url: mediaData.url,
                filename: mediaData.filename,
                size: mediaData.size,
                mimeType: mediaData.mimeType,
                caption: mediaData.caption,
                task: { connect: { id: taskId } },
                uploader: { connect: { id: uploaderId } },
            },
            include: {
                uploader: true,
            },
        });
    }
    async delete(mediaId, userId) {
        const media = await this.prisma.taskMedia.findUnique({
            where: { id: mediaId },
            include: {
                task: true,
            },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        const canDelete = media.uploadedBy === userId ||
            media.task.userId === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this media');
        }
        await this.prisma.taskMedia.delete({
            where: { id: mediaId },
        });
    }
};
exports.TaskMediaService = TaskMediaService;
exports.TaskMediaService = TaskMediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskMediaService);
//# sourceMappingURL=task-media.service.js.map