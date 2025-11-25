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
var FeatureExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExtractionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FeatureExtractionService = FeatureExtractionService_1 = class FeatureExtractionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FeatureExtractionService_1.name);
    }
    async extractTaskFeatures(task, userContext) {
        const features = {
            titleLength: task.title?.length || 0,
            descriptionLength: task.description?.length || 0,
            hasDescription: Boolean(task.description),
            hasDueDate: Boolean(task.dueDate),
            daysUntilDue: this.calculateDaysUntilDue(task.dueDate),
            currentWorkload: await this.calculateCurrentWorkload(userContext.userId),
            userProductivity: userContext.productivityScore,
            taskComplexity: await this.estimateTaskComplexity(task),
            similarTasksCompleted: await this.countSimilarTasksCompleted(task, userContext.userId),
            avgCompletionTime: userContext.averageCompletionTime,
            userPriorityPattern: await this.getUserPriorityPattern(userContext.userId),
            completionRate: await this.calculateCompletionRate(userContext.userId),
            procrastinationTendency: await this.calculateProcrastinationTendency(userContext.userId),
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: this.getDayOfWeek(),
            seasonality: this.getSeasonality(),
            urgencyScore: this.calculateUrgencyScore(task),
            importanceScore: this.calculateImportanceScore(task, userContext)
        };
        this.logger.debug(`Extracted features for task: ${JSON.stringify(features)}`);
        return features;
    }
    async getUserContext(userId) {
        const [currentTasks, completedTasks, overdueTasks, avgCompletionTime] = await Promise.all([
            this.countCurrentTasks(userId),
            this.countCompletedTasks(userId),
            this.countOverdueTasks(userId),
            this.calculateAverageCompletionTime(userId)
        ]);
        const productivityScore = this.calculateProductivityScore({
            completed: completedTasks,
            overdue: overdueTasks,
            current: currentTasks,
            avgCompletion: avgCompletionTime
        });
        return {
            userId,
            currentTasks,
            completedTasks,
            overdueTasks,
            averageCompletionTime: avgCompletionTime,
            productivityScore,
            workingHours: { start: 9, end: 17 },
            timezone: 'UTC',
            preferences: {
                preferredPriorities: ['HIGH', 'MEDIUM'],
                workStyle: 'focused',
                planningHorizon: 7
            }
        };
    }
    calculateDaysUntilDue(dueDate) {
        if (!dueDate)
            return -1;
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    async calculateCurrentWorkload(userId) {
        const activeTasks = await this.prisma.task.count({
            where: {
                userId: userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });
        return Math.min(100, (activeTasks / 20) * 100);
    }
    async estimateTaskComplexity(task) {
        let complexity = 5;
        if (task.title) {
            if (task.title.length > 50)
                complexity += 2;
            if (task.title.includes('project') || task.title.includes('system'))
                complexity += 1;
        }
        if (task.description) {
            if (task.description.length > 200)
                complexity += 2;
            if (task.description.length > 500)
                complexity += 2;
        }
        const complexKeywords = ['implement', 'refactor', 'optimize', 'integrate', 'design', 'architecture'];
        const taskText = `${task.title || ''} ${task.description || ''}`.toLowerCase();
        complexKeywords.forEach(keyword => {
            if (taskText.includes(keyword))
                complexity += 1;
        });
        if (task.priority === 'URGENT')
            complexity += 2;
        if (task.priority === 'HIGH')
            complexity += 1;
        return Math.min(10, complexity);
    }
    async countSimilarTasksCompleted(task, userId) {
        if (!task.title)
            return 0;
        const taskWords = task.title.toLowerCase().split(' ').filter(word => word.length > 3);
        if (taskWords.length === 0)
            return 0;
        const similarTasks = await this.prisma.task.count({
            where: {
                userId: userId,
                status: 'COMPLETED',
                OR: taskWords.map(word => ({
                    title: { contains: word, mode: 'insensitive' }
                }))
            }
        });
        return similarTasks;
    }
    async getUserPriorityPattern(userId) {
        const tasks = await this.prisma.task.groupBy({
            by: ['priority'],
            where: { userId: userId },
            _count: true
        });
        const pattern = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0
        };
        const total = tasks.reduce((sum, group) => sum + group._count, 0);
        tasks.forEach(group => {
            pattern[group.priority] = total > 0 ? group._count / total : 0;
        });
        return pattern;
    }
    async calculateCompletionRate(userId) {
        const [total, completed] = await Promise.all([
            this.prisma.task.count({ where: { userId: userId } }),
            this.prisma.task.count({ where: { userId: userId, status: 'COMPLETED' } })
        ]);
        return total > 0 ? completed / total : 0;
    }
    async calculateProcrastinationTendency(userId) {
        const completedTasks = await this.prisma.task.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED',
                dueDate: { not: null },
                completedAt: { not: null }
            },
            select: {
                dueDate: true,
                completedAt: true
            }
        });
        if (completedTasks.length === 0)
            return 0.5;
        let lateCompletions = 0;
        completedTasks.forEach(task => {
            if (new Date(task.completedAt) > new Date(task.dueDate)) {
                lateCompletions++;
            }
        });
        return lateCompletions / completedTasks.length;
    }
    getTimeOfDay() {
        return new Date().getHours();
    }
    getDayOfWeek() {
        return new Date().getDay();
    }
    getSeasonality() {
        const month = new Date().getMonth();
        return Math.sin((month / 12) * 2 * Math.PI);
    }
    calculateUrgencyScore(task) {
        let score = 0;
        if (task.priority === 'URGENT')
            score += 10;
        else if (task.priority === 'HIGH')
            score += 7;
        else if (task.priority === 'MEDIUM')
            score += 4;
        else
            score += 1;
        const daysUntilDue = this.calculateDaysUntilDue(task.dueDate);
        if (daysUntilDue >= 0) {
            if (daysUntilDue === 0)
                score += 5;
            else if (daysUntilDue <= 1)
                score += 4;
            else if (daysUntilDue <= 3)
                score += 3;
            else if (daysUntilDue <= 7)
                score += 2;
        }
        return Math.min(10, score);
    }
    calculateImportanceScore(task, userContext) {
        let score = 5;
        if (task.priority === 'URGENT')
            score += 3;
        else if (task.priority === 'HIGH')
            score += 2;
        else if (task.priority === 'MEDIUM')
            score += 1;
        if (task.description && task.description.length > 100)
            score += 1;
        if (userContext.productivityScore < 30)
            score += 1;
        return Math.min(10, score);
    }
    async countCurrentTasks(userId) {
        return this.prisma.task.count({
            where: {
                userId: userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });
    }
    async countCompletedTasks(userId) {
        return this.prisma.task.count({
            where: {
                userId: userId,
                status: 'COMPLETED'
            }
        });
    }
    async countOverdueTasks(userId) {
        const now = new Date();
        return this.prisma.task.count({
            where: {
                userId: userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                dueDate: { lt: now }
            }
        });
    }
    async calculateAverageCompletionTime(userId) {
        const completedTasks = await this.prisma.task.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED',
                completedAt: { not: null }
            },
            select: {
                createdAt: true,
                completedAt: true
            }
        });
        if (completedTasks.length === 0)
            return 0;
        const totalTime = completedTasks.reduce((sum, task) => {
            const completionTime = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
            return sum + completionTime;
        }, 0);
        return totalTime / completedTasks.length / (1000 * 60 * 60);
    }
    calculateProductivityScore(stats) {
        let score = 50;
        const total = stats.completed + stats.overdue + stats.current;
        if (total > 0) {
            const completionRate = stats.completed / total;
            score += completionRate * 30;
        }
        if (total > 0) {
            const overdueRate = stats.overdue / total;
            score -= overdueRate * 20;
        }
        if (stats.avgCompletion > 0 && stats.avgCompletion < 24) {
            score += 10;
        }
        return Math.max(0, Math.min(100, score));
    }
};
exports.FeatureExtractionService = FeatureExtractionService;
exports.FeatureExtractionService = FeatureExtractionService = FeatureExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeatureExtractionService);
//# sourceMappingURL=feature-extraction.service.js.map