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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaskService = class TaskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserId(userId, filters) {
        const where = { userId };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.dueBefore)
            where.dueDate = { lte: new Date(filters.dueBefore) };
        if (filters?.dueAfter)
            where.dueDate = { gte: new Date(filters.dueAfter) };
        return this.prisma.task.findMany({
            where,
            include: {
                user: true,
                media: true,
                shares: {
                    include: {
                        sharedByUser: true,
                        sharedWithUser: true,
                    },
                },
                comments: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async findById(id, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                user: true,
                media: {
                    include: {
                        uploader: true,
                    },
                },
                shares: {
                    include: {
                        sharedByUser: true,
                        sharedWithUser: true,
                    },
                },
                comments: {
                    include: {
                        user: true,
                        replies: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    where: { parentId: null },
                    orderBy: { createdAt: 'desc' },
                },
                parent: {
                    include: {
                        user: true,
                    },
                },
                subtasks: {
                    include: {
                        user: true,
                    },
                    orderBy: [
                        { priority: 'desc' },
                        { createdAt: 'desc' },
                    ],
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const hasAccess = task.userId === userId ||
            task.shares.some(share => share.sharedWith === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        return task;
    }
    async findSharedTasks(userId, filters) {
        const where = {
            shares: {
                some: {
                    sharedWith: userId,
                    isActive: true,
                },
            },
        };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.dueBefore)
            where.dueDate = { lte: new Date(filters.dueBefore) };
        if (filters?.dueAfter)
            where.dueDate = { gte: new Date(filters.dueAfter) };
        return this.prisma.task.findMany({
            where,
            include: {
                user: true,
                media: true,
                shares: {
                    include: {
                        sharedByUser: true,
                        sharedWithUser: true,
                    },
                },
                comments: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async create(input, userId) {
        return this.prisma.task.create({
            data: {
                title: input.title,
                description: input.description,
                category: input.category,
                priority: input.priority,
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
                user: {
                    connect: { id: userId },
                },
            },
            include: {
                user: true,
                media: true,
                shares: true,
                comments: true,
            },
        });
    }
    async update(input, userId) {
        const task = await this.findById(input.id, userId);
        const canEdit = task.userId === userId ||
            task.shares.some(share => share.sharedWith === userId &&
                (share.permission === 'EDIT' || share.permission === 'ADMIN'));
        if (!canEdit) {
            throw new common_1.ForbiddenException('You do not have permission to edit this task');
        }
        const data = {};
        if (input.title !== undefined)
            data.title = input.title;
        if (input.description !== undefined)
            data.description = input.description;
        if (input.category !== undefined)
            data.category = input.category;
        if (input.priority !== undefined)
            data.priority = input.priority;
        if (input.status !== undefined) {
            data.status = input.status;
            if (input.status === 'COMPLETED') {
                data.completedAt = new Date();
            }
        }
        if (input.dueDate !== undefined) {
            data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        }
        return this.prisma.task.update({
            where: { id: input.id },
            data,
            include: {
                user: true,
                media: true,
                shares: true,
                comments: true,
            },
        });
    }
    async delete(id, userId) {
        const task = await this.findById(id, userId);
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException('Only the task owner can delete this task');
        }
        await this.prisma.task.delete({
            where: { id },
        });
    }
    async findSubtasks(parentId, userId) {
        await this.findById(parentId, userId);
        return this.prisma.task.findMany({
            where: { parentId },
            include: {
                user: true,
                media: true,
                shares: {
                    include: {
                        sharedByUser: true,
                        sharedWithUser: true,
                    },
                },
                comments: {
                    include: {
                        user: true,
                    },
                },
                subtasks: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async createSubtask(parentId, input, userId) {
        const parentTask = await this.findById(parentId, userId);
        const canEdit = parentTask.userId === userId ||
            parentTask.shares.some(share => share.sharedWith === userId &&
                (share.permission === 'EDIT' || share.permission === 'ADMIN'));
        if (!canEdit) {
            throw new common_1.ForbiddenException('You do not have permission to create subtasks for this task');
        }
        return this.prisma.task.create({
            data: {
                title: input.title,
                description: input.description,
                category: input.category,
                priority: input.priority,
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
                user: {
                    connect: { id: userId },
                },
                parent: {
                    connect: { id: parentId },
                },
            },
            include: {
                user: true,
                parent: true,
                media: true,
                shares: true,
                comments: true,
                subtasks: true,
            },
        });
    }
    async findPaginated(userId, page, limit, filters) {
        const where = { userId };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.dueBefore)
            where.dueDate = { lte: new Date(filters.dueBefore) };
        if (filters?.dueAfter)
            where.dueDate = { gte: new Date(filters.dueAfter) };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                include: {
                    user: true,
                    media: true,
                    shares: {
                        include: {
                            sharedByUser: true,
                            sharedWithUser: true,
                        },
                    },
                    comments: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: [
                    { priority: 'desc' },
                    { dueDate: 'asc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            this.prisma.task.count({ where }),
        ]);
        return { data, total };
    }
    async getTaskProgress(taskId, userId) {
        const task = await this.findById(taskId, userId);
        const subtasks = await this.prisma.task.findMany({
            where: { parentId: taskId },
            select: {
                id: true,
                status: true,
            },
        });
        const totalSubtasks = subtasks.length;
        const completedSubtasks = subtasks.filter(st => st.status === 'COMPLETED').length;
        return {
            task,
            totalSubtasks,
            completedSubtasks,
            progressPercentage: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
        };
    }
    async findByProjectId(projectId, userId, filters) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
        const where = { projectId };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.dueBefore)
            where.dueDate = { lte: new Date(filters.dueBefore) };
        if (filters?.dueAfter)
            where.dueDate = { gte: new Date(filters.dueAfter) };
        return this.prisma.task.findMany({
            where,
            include: {
                user: true,
                project: true,
                media: true,
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                },
                _count: {
                    select: {
                        comments: true,
                        subtasks: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async createProjectTask(projectId, userId, input) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
        const lastTask = await this.prisma.task.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' },
        });
        const task = await this.prisma.task.create({
            data: {
                title: input.title,
                description: input.description,
                category: input.category,
                priority: input.priority,
                status: input.status || 'PENDING',
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
                userId,
                projectId,
                assignedTo: input.assignedTo || [],
                mentions: input.mentions || [],
                tags: input.tags || [],
                order: input.order ?? (lastTask?.order ?? 0) + 1,
                parentId: input.parentId,
            },
            include: {
                user: true,
                project: true,
                comments: true,
                media: true,
            },
        });
        if (input.mentions && input.mentions.length > 0) {
            await this.createMentionNotifications(task.id, userId, input.mentions);
        }
        if (input.assignedTo && input.assignedTo.length > 0) {
            await this.createAssignmentNotifications(task.id, userId, input.assignedTo);
        }
        return task;
    }
    async updateTaskOrder(taskId, userId, newOrder) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.projectId) {
            const member = await this.prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: task.projectId,
                        userId,
                    },
                },
            });
            if (!member && task.userId !== userId) {
                throw new common_1.ForbiddenException('You do not have permission to reorder this task');
            }
        }
        else if (task.userId !== userId) {
            throw new common_1.ForbiddenException('You can only reorder your own tasks');
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: { order: newOrder },
        });
    }
    async assignTask(taskId, userId, assignedUserIds) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.projectId) {
            const member = await this.prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: task.projectId,
                        userId,
                    },
                },
            });
            if (!member) {
                throw new common_1.ForbiddenException('You are not a member of this project');
            }
        }
        else if (task.userId !== userId) {
            throw new common_1.ForbiddenException('Only task owner can assign personal tasks');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: { assignedTo: assignedUserIds },
            include: {
                user: true,
                project: true,
            },
        });
        await this.createAssignmentNotifications(taskId, userId, assignedUserIds);
        return updatedTask;
    }
    async createMentionNotifications(taskId, mentionerUserId, mentionedUserIds) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { title: true },
        });
        const notifications = mentionedUserIds
            .filter((uid) => uid !== mentionerUserId)
            .map((mentionedUserId) => ({
            userId: mentionedUserId,
            type: 'TASK_MENTION',
            title: 'You were mentioned',
            message: `You were mentioned in task "${task?.title}"`,
            taskId,
            mentionedBy: mentionerUserId,
        }));
        if (notifications.length > 0) {
            await this.prisma.notification.createMany({
                data: notifications,
            });
        }
    }
    async createAssignmentNotifications(taskId, assignerUserId, assignedUserIds) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { title: true },
        });
        const notifications = assignedUserIds
            .filter((uid) => uid !== assignerUserId)
            .map((assignedUserId) => ({
            userId: assignedUserId,
            type: 'TASK_ASSIGNED',
            title: 'Task assigned to you',
            message: `You were assigned to task "${task?.title}"`,
            taskId,
        }));
        if (notifications.length > 0) {
            await this.prisma.notification.createMany({
                data: notifications,
            });
        }
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map