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
exports.TaskDataLoaderService = void 0;
const common_1 = require("@nestjs/common");
const DataLoader = require("dataloader");
const prisma_service_1 = require("../../prisma/prisma.service");
let TaskDataLoaderService = class TaskDataLoaderService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.userLoader = new DataLoader(async (userIds) => {
            const users = await this.prismaService.user.findMany({
                where: { id: { in: userIds } },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    roleType: true,
                    isActive: true,
                    isVerified: true,
                    isTwoFactorEnabled: true,
                    failedLoginAttempts: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return userIds.map(id => users.find(user => user.id === id) || null);
        }, {
            cache: true,
            batchScheduleFn: callback => setTimeout(callback, 1),
            maxBatchSize: 100
        });
        this.commentsLoader = new DataLoader(async (taskIds) => {
            const comments = await this.prismaService.taskComment.findMany({
                where: { taskId: { in: taskIds } },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            roleType: true,
                            isActive: true,
                            isVerified: true,
                            isTwoFactorEnabled: true,
                            failedLoginAttempts: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return taskIds.map(taskId => comments.filter(comment => comment.taskId === taskId));
        }, {
            cache: true,
            batchScheduleFn: callback => setTimeout(callback, 1),
            maxBatchSize: 50
        });
        this.mediaLoader = new DataLoader(async (taskIds) => {
            const media = await this.prismaService.taskMedia.findMany({
                where: { taskId: { in: taskIds } },
                include: {
                    uploader: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            roleType: true,
                            isActive: true,
                            isVerified: true,
                            isTwoFactorEnabled: true,
                            failedLoginAttempts: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return taskIds.map(taskId => media.filter(m => m.taskId === taskId));
        }, {
            cache: true,
            batchScheduleFn: callback => setTimeout(callback, 1),
            maxBatchSize: 50
        });
        this.taskCountsLoader = new DataLoader(async (taskIds) => {
            const [commentCounts, mediaCounts, subtaskCounts] = await Promise.all([
                this.prismaService.taskComment.groupBy({
                    by: ['taskId'],
                    where: { taskId: { in: taskIds } },
                    _count: { id: true }
                }),
                this.prismaService.taskMedia.groupBy({
                    by: ['taskId'],
                    where: { taskId: { in: taskIds } },
                    _count: { id: true }
                }),
                this.prismaService.task.groupBy({
                    by: ['parentId'],
                    where: { parentId: { in: taskIds } },
                    _count: { id: true }
                })
            ]);
            const commentCountMap = new Map(commentCounts.map(c => [c.taskId, c._count.id]));
            const mediaCountMap = new Map(mediaCounts.map(m => [m.taskId, m._count.id]));
            const subtaskCountMap = new Map(subtaskCounts.map(s => [s.parentId, s._count.id]));
            return taskIds.map(taskId => ({
                comments: commentCountMap.get(taskId) || 0,
                media: mediaCountMap.get(taskId) || 0,
                subtasks: subtaskCountMap.get(taskId) || 0
            }));
        }, {
            cache: true,
            batchScheduleFn: callback => setTimeout(callback, 1),
            maxBatchSize: 100
        });
    }
    async loadUser(userId) {
        return this.userLoader.load(userId);
    }
    async loadComments(taskId) {
        return this.commentsLoader.load(taskId);
    }
    async loadMedia(taskId) {
        return this.mediaLoader.load(taskId);
    }
    async loadTaskCounts(taskId) {
        return this.taskCountsLoader.load(taskId);
    }
    clearUser(userId) {
        this.userLoader.clear(userId);
    }
    clearComments(taskId) {
        this.commentsLoader.clear(taskId);
    }
    clearMedia(taskId) {
        this.mediaLoader.clear(taskId);
    }
    clearTaskCounts(taskId) {
        this.taskCountsLoader.clear(taskId);
    }
    clearAll() {
        this.userLoader.clearAll();
        this.commentsLoader.clearAll();
        this.mediaLoader.clearAll();
        this.taskCountsLoader.clearAll();
    }
};
exports.TaskDataLoaderService = TaskDataLoaderService;
exports.TaskDataLoaderService = TaskDataLoaderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskDataLoaderService);
//# sourceMappingURL=task-data-loader.service.js.map