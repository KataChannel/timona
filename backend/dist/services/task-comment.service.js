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
exports.TaskCommentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaskCommentService = class TaskCommentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input, authorId) {
        const task = await this.prisma.task.findUnique({
            where: { id: input.taskId },
            include: {
                shares: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const hasAccess = task.userId === authorId ||
            task.shares.some(share => share.sharedWith === authorId && share.isActive);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        if (input.parentId) {
            const parentComment = await this.prisma.taskComment.findUnique({
                where: { id: input.parentId },
            });
            if (!parentComment || parentComment.taskId !== input.taskId) {
                throw new common_1.NotFoundException('Parent comment not found or does not belong to this task');
            }
        }
        return this.prisma.taskComment.create({
            data: {
                content: input.content,
                task: { connect: { id: input.taskId } },
                user: { connect: { id: authorId } },
                ...(input.parentId && { parent: { connect: { id: input.parentId } } }),
            },
            include: {
                user: true,
                task: true,
                parent: {
                    include: {
                        user: true,
                    },
                },
                replies: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async findByTaskId(taskId) {
        return this.prisma.taskComment.findMany({
            where: {
                taskId,
                parentId: null
            },
            include: {
                user: true,
                replies: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findById(id) {
        return this.prisma.taskComment.findUnique({
            where: { id },
            include: {
                user: true,
                parent: {
                    include: {
                        user: true,
                    },
                },
                replies: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
    }
    async findReplies(parentId) {
        return this.prisma.taskComment.findMany({
            where: { parentId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async update(input, userId) {
        const comment = await this.prisma.taskComment.findUnique({
            where: { id: input.commentId },
            include: {
                user: true,
                task: true,
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        return this.prisma.taskComment.update({
            where: { id: input.commentId },
            data: { content: input.content },
            include: {
                user: true,
                task: true,
            },
        });
    }
    async delete(commentId, userId) {
        const comment = await this.prisma.taskComment.findUnique({
            where: { id: commentId },
            include: {
                task: true,
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        const canDelete = comment.userId === userId ||
            comment.task.userId === userId;
        if (!canDelete) {
            throw new common_1.ForbiddenException('You do not have permission to delete this comment');
        }
        await this.prisma.taskComment.delete({
            where: { id: commentId },
        });
    }
};
exports.TaskCommentService = TaskCommentService;
exports.TaskCommentService = TaskCommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskCommentService);
//# sourceMappingURL=task-comment.service.js.map