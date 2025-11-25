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
exports.TaskShareService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const share_token_1 = require("../utils/share-token");
let TaskShareService = class TaskShareService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input, sharedById) {
        const task = await this.prisma.task.findUnique({
            where: { id: input.taskId },
            include: {
                shares: {
                    include: {
                        sharedByUser: true,
                        sharedWithUser: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const canShare = task.userId === sharedById ||
            task.shares.some(share => share.sharedWith === sharedById &&
                share.permission === 'ADMIN');
        if (!canShare) {
            throw new common_1.ForbiddenException('You do not have permission to share this task');
        }
        const existingShare = task.shares.find(share => share.sharedWith === input.sharedWithId);
        if (existingShare) {
            throw new common_1.ForbiddenException('Task is already shared with this user');
        }
        return this.prisma.taskShare.create({
            data: {
                task: { connect: { id: input.taskId } },
                sharedByUser: { connect: { id: sharedById } },
                sharedWithUser: { connect: { id: input.sharedWithId } },
                permission: input.permission,
                shareToken: (0, share_token_1.generateShareToken)(),
            },
            include: {
                task: true,
                sharedByUser: true,
                sharedWithUser: true,
            },
        });
    }
    async findByTaskId(taskId) {
        return this.prisma.taskShare.findMany({
            where: { taskId, isActive: true },
            include: {
                sharedByUser: true,
                sharedWithUser: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(input, userId) {
        const share = await this.prisma.taskShare.findUnique({
            where: { id: input.shareId },
            include: {
                task: true,
                sharedByUser: true,
                sharedWithUser: true,
            },
        });
        if (!share) {
            throw new common_1.NotFoundException('Share not found');
        }
        const canUpdate = share.task.userId === userId ||
            share.sharedBy === userId;
        if (!canUpdate) {
            throw new common_1.ForbiddenException('You do not have permission to update this share');
        }
        return this.prisma.taskShare.update({
            where: { id: input.shareId },
            data: { permission: input.permission },
            include: {
                task: true,
                sharedByUser: true,
                sharedWithUser: true,
            },
        });
    }
    async delete(shareId, userId) {
        const share = await this.prisma.taskShare.findUnique({
            where: { id: shareId },
            include: {
                task: true,
            },
        });
        if (!share) {
            throw new common_1.NotFoundException('Share not found');
        }
        const canDelete = share.task.userId === userId ||
            share.sharedBy === userId ||
            share.sharedWith === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this share');
        }
        await this.prisma.taskShare.delete({
            where: { id: shareId },
        });
    }
};
exports.TaskShareService = TaskShareService;
exports.TaskShareService = TaskShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskShareService);
//# sourceMappingURL=task-share.service.js.map