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
exports.ProjectAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectAnalyticsService = class ProjectAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProjectAnalytics(projectId, dateRange) {
        const [taskStats, memberStats, activityStats, completionRate, averageCompletionTime, upcomingDeadlines, overdueТasks,] = await Promise.all([
            this.getTaskStatistics(projectId, dateRange),
            this.getMemberStatistics(projectId, dateRange),
            this.getActivityStatistics(projectId, dateRange),
            this.getCompletionRate(projectId, dateRange),
            this.getAverageCompletionTime(projectId),
            this.getUpcomingDeadlines(projectId),
            this.getOverdueTasks(projectId),
        ]);
        return {
            taskStats,
            memberStats,
            activityStats,
            completionRate,
            averageCompletionTime,
            upcomingDeadlines,
            generatedAt: new Date(),
        };
    }
    async getTaskStatistics(projectId, dateRange) {
        const where = { projectId };
        if (dateRange?.startDate || dateRange?.endDate) {
            where.createdAt = {};
            if (dateRange.startDate)
                where.createdAt.gte = dateRange.startDate;
            if (dateRange.endDate)
                where.createdAt.lte = dateRange.endDate;
        }
        const tasks = await this.prisma.task.findMany({
            where,
            select: {
                status: true,
                priority: true,
                dueDate: true,
                completedAt: true,
            },
        });
        const byStatus = {
            [client_1.TaskStatus.PENDING]: 0,
            [client_1.TaskStatus.IN_PROGRESS]: 0,
            [client_1.TaskStatus.COMPLETED]: 0,
            [client_1.TaskStatus.CANCELLED]: 0,
        };
        const byPriority = {
            [client_1.TaskPriority.LOW]: 0,
            [client_1.TaskPriority.MEDIUM]: 0,
            [client_1.TaskPriority.HIGH]: 0,
            [client_1.TaskPriority.URGENT]: 0,
        };
        let overdue = 0;
        const now = new Date();
        tasks.forEach((task) => {
            byStatus[task.status]++;
            byPriority[task.priority]++;
            if (task.dueDate &&
                task.dueDate < now &&
                task.status !== client_1.TaskStatus.COMPLETED) {
                overdue++;
            }
        });
        return {
            total: tasks.length,
            byStatus,
            byPriority,
            overdue,
        };
    }
    async getMemberStatistics(projectId, dateRange) {
        const members = await this.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        const memberStats = await Promise.all(members.map(async (member) => {
            const where = {
                projectId,
                assignedTo: {
                    has: member.userId,
                },
            };
            if (dateRange?.startDate || dateRange?.endDate) {
                where.createdAt = {};
                if (dateRange.startDate)
                    where.createdAt.gte = dateRange.startDate;
                if (dateRange.endDate)
                    where.createdAt.lte = dateRange.endDate;
            }
            const [totalTasks, completedTasks, inProgressTasks] = await Promise.all([
                this.prisma.task.count({ where }),
                this.prisma.task.count({
                    where: { ...where, status: client_1.TaskStatus.COMPLETED },
                }),
                this.prisma.task.count({
                    where: { ...where, status: client_1.TaskStatus.IN_PROGRESS },
                }),
            ]);
            const activityCount = await this.prisma.taskActivityLog.count({
                where: {
                    userId: member.userId,
                    task: {
                        projectId,
                    },
                    ...(dateRange?.startDate || dateRange?.endDate
                        ? {
                            createdAt: {
                                ...(dateRange.startDate && { gte: dateRange.startDate }),
                                ...(dateRange.endDate && { lte: dateRange.endDate }),
                            },
                        }
                        : {}),
                },
            });
            return {
                user: member.user,
                role: member.role,
                totalTasks,
                completedTasks,
                inProgressTasks,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                activityCount,
            };
        }));
        return memberStats.sort((a, b) => b.completedTasks - a.completedTasks);
    }
    async getActivityStatistics(projectId, dateRange) {
        const where = {
            task: {
                projectId,
            },
        };
        if (dateRange?.startDate || dateRange?.endDate) {
            where.createdAt = {};
            if (dateRange.startDate)
                where.createdAt.gte = dateRange.startDate;
            if (dateRange.endDate)
                where.createdAt.lte = dateRange.endDate;
        }
        const activities = await this.prisma.taskActivityLog.groupBy({
            by: ['action'],
            where,
            _count: {
                action: true,
            },
        });
        const activityByType = {};
        activities.forEach((activity) => {
            activityByType[activity.action] = activity._count.action;
        });
        const dailyActivity = await this.prisma.taskActivityLog.findMany({
            where,
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const dailyActivityMap = {};
        dailyActivity.forEach((activity) => {
            const date = activity.createdAt.toISOString().split('T')[0];
            dailyActivityMap[date] = (dailyActivityMap[date] || 0) + 1;
        });
        const dailyActivityChart = Object.entries(dailyActivityMap).map(([date, count]) => ({
            date,
            count,
        }));
        return {
            total: dailyActivity.length,
            byType: activityByType,
            dailyChart: dailyActivityChart,
        };
    }
    async getCompletionRate(projectId, dateRange) {
        const where = { projectId };
        if (dateRange?.startDate || dateRange?.endDate) {
            where.createdAt = {};
            if (dateRange.startDate)
                where.createdAt.gte = dateRange.startDate;
            if (dateRange.endDate)
                where.createdAt.lte = dateRange.endDate;
        }
        const [total, completed] = await Promise.all([
            this.prisma.task.count({ where }),
            this.prisma.task.count({
                where: { ...where, status: client_1.TaskStatus.COMPLETED },
            }),
        ]);
        return {
            total,
            completed,
            rate: total > 0 ? (completed / total) * 100 : 0,
        };
    }
    async getAverageCompletionTime(projectId) {
        const completedTasks = await this.prisma.task.findMany({
            where: {
                projectId,
                status: client_1.TaskStatus.COMPLETED,
                completedAt: { not: null },
            },
            select: {
                createdAt: true,
                completedAt: true,
            },
        });
        if (completedTasks.length === 0) {
            return {
                averageDays: 0,
                averageHours: 0,
                totalCompleted: 0,
            };
        }
        const totalMilliseconds = completedTasks.reduce((sum, task) => {
            const diff = task.completedAt.getTime() - task.createdAt.getTime();
            return sum + diff;
        }, 0);
        const averageMilliseconds = totalMilliseconds / completedTasks.length;
        const averageHours = averageMilliseconds / (1000 * 60 * 60);
        const averageDays = averageHours / 24;
        return {
            averageDays: Math.round(averageDays * 100) / 100,
            averageHours: Math.round(averageHours * 100) / 100,
            totalCompleted: completedTasks.length,
        };
    }
    async getUpcomingDeadlines(projectId) {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const tasks = await this.prisma.task.findMany({
            where: {
                projectId,
                status: {
                    not: client_1.TaskStatus.COMPLETED,
                },
                dueDate: {
                    gte: now,
                    lte: sevenDaysFromNow,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        subtasks: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
        return tasks;
    }
    async getOverdueTasks(projectId) {
        const now = new Date();
        const tasks = await this.prisma.task.findMany({
            where: {
                projectId,
                status: {
                    not: client_1.TaskStatus.COMPLETED,
                },
                dueDate: {
                    lt: now,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        subtasks: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
        return tasks;
    }
    async getTaskVelocity(projectId, days = 30) {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const completedTasks = await this.prisma.task.findMany({
            where: {
                projectId,
                status: client_1.TaskStatus.COMPLETED,
                completedAt: {
                    gte: startDate,
                    lte: now,
                },
            },
            select: {
                completedAt: true,
            },
        });
        const dailyCompletions = {};
        completedTasks.forEach((task) => {
            const date = task.completedAt.toISOString().split('T')[0];
            dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
        });
        const velocityChart = Object.entries(dailyCompletions).map(([date, count]) => ({
            date,
            count,
        }));
        return {
            totalCompleted: completedTasks.length,
            averagePerDay: completedTasks.length / days,
            chart: velocityChart,
        };
    }
    async getTagStatistics(projectId) {
        const tasks = await this.prisma.task.findMany({
            where: { projectId },
            select: { tags: true },
        });
        const tagCounts = {};
        tasks.forEach((task) => {
            task.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        const tagStats = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
        return tagStats;
    }
    async getProjectHealthScore(projectId) {
        const [taskStats, completionRate, overdueTasks] = await Promise.all([
            this.getTaskStatistics(projectId),
            this.getCompletionRate(projectId),
            this.getOverdueTasks(projectId),
        ]);
        let score = 100;
        if (taskStats.overdue > 0) {
            score -= Math.min(taskStats.overdue * 5, 30);
        }
        if (completionRate.rate < 50) {
            score -= 20;
        }
        else if (completionRate.rate < 70) {
            score -= 10;
        }
        const pendingRatio = taskStats.byStatus[client_1.TaskStatus.PENDING] / taskStats.total;
        if (pendingRatio > 0.5) {
            score -= 15;
        }
        return {
            score: Math.max(score, 0),
            status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
            factors: {
                overdueTasks: taskStats.overdue,
                completionRate: completionRate.rate,
                pendingRatio: pendingRatio * 100,
            },
        };
    }
};
exports.ProjectAnalyticsService = ProjectAnalyticsService;
exports.ProjectAnalyticsService = ProjectAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectAnalyticsService);
//# sourceMappingURL=project-analytics.service.js.map