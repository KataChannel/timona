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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CalendarService = class CalendarService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCalendarTasks(userId, startDate, endDate, projectId) {
        const where = {
            OR: [
                { userId },
                { assignedTo: { has: userId } },
            ],
            dueDate: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (projectId) {
            where.projectId = projectId;
        }
        const tasks = await this.prisma.task.findMany({
            where,
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
        const tasksByDate = {};
        tasks.forEach((task) => {
            if (task.dueDate) {
                const dateKey = task.dueDate.toISOString().split('T')[0];
                if (!tasksByDate[dateKey]) {
                    tasksByDate[dateKey] = [];
                }
                tasksByDate[dateKey].push(task);
            }
        });
        return {
            tasks,
            tasksByDate,
            summary: {
                total: tasks.length,
                completed: tasks.filter(t => t.status === client_1.TaskStatus.COMPLETED).length,
                overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== client_1.TaskStatus.COMPLETED).length,
            },
        };
    }
    async getMonthView(userId, year, month, projectId) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        return await this.getCalendarTasks(userId, startDate, endDate, projectId);
    }
    async getWeekView(userId, startDate, projectId) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59);
        return await this.getCalendarTasks(userId, startDate, endDate, projectId);
    }
    async generateICalExport(userId, projectId) {
        const where = {
            OR: [
                { userId },
                { assignedTo: { has: userId } },
            ],
            dueDate: { not: null },
        };
        if (projectId) {
            where.projectId = projectId;
        }
        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
        let ical = 'BEGIN:VCALENDAR\r\n';
        ical += 'VERSION:2.0\r\n';
        ical += 'PRODID:-//Rausach Project Management//EN\r\n';
        ical += 'CALSCALE:GREGORIAN\r\n';
        ical += 'METHOD:PUBLISH\r\n';
        ical += 'X-WR-CALNAME:My Tasks\r\n';
        ical += 'X-WR-TIMEZONE:UTC\r\n';
        ical += 'X-WR-CALDESC:Tasks from Rausach Project Management\r\n';
        tasks.forEach((task) => {
            const uid = `task-${task.id}@rausach.com`;
            const summary = this.escapeICalText(task.title);
            const description = task.description ? this.escapeICalText(task.description) : '';
            const dueDate = task.dueDate ? this.formatICalDate(task.dueDate) : '';
            const createdDate = this.formatICalDate(task.createdAt);
            const status = task.status === client_1.TaskStatus.COMPLETED ? 'COMPLETED' : 'NEEDS-ACTION';
            const priority = this.mapPriorityToICal(task.priority);
            ical += 'BEGIN:VTODO\r\n';
            ical += `UID:${uid}\r\n`;
            ical += `DTSTAMP:${createdDate}\r\n`;
            ical += `SUMMARY:${summary}\r\n`;
            if (description) {
                ical += `DESCRIPTION:${description}\r\n`;
            }
            if (dueDate) {
                ical += `DUE:${dueDate}\r\n`;
            }
            ical += `STATUS:${status}\r\n`;
            ical += `PRIORITY:${priority}\r\n`;
            ical += `CATEGORIES:${task.category}\r\n`;
            ical += 'END:VTODO\r\n';
        });
        ical += 'END:VCALENDAR\r\n';
        return ical;
    }
    async getUpcomingTasks(userId, hours = 24) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const tasks = await this.prisma.task.findMany({
            where: {
                OR: [
                    { userId },
                    { assignedTo: { has: userId } },
                ],
                status: {
                    notIn: [client_1.TaskStatus.COMPLETED, client_1.TaskStatus.CANCELLED],
                },
                dueDate: {
                    gte: now,
                    lte: futureDate,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
        return tasks;
    }
    async getCalendarStatistics(userId, startDate, endDate, projectId) {
        const where = {
            OR: [
                { userId },
                { assignedTo: { has: userId } },
            ],
            dueDate: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (projectId) {
            where.projectId = projectId;
        }
        const [total, completed, inProgress, pending, overdue] = await Promise.all([
            this.prisma.task.count({ where }),
            this.prisma.task.count({
                where: { ...where, status: client_1.TaskStatus.COMPLETED },
            }),
            this.prisma.task.count({
                where: { ...where, status: client_1.TaskStatus.IN_PROGRESS },
            }),
            this.prisma.task.count({
                where: { ...where, status: client_1.TaskStatus.PENDING },
            }),
            this.prisma.task.count({
                where: {
                    ...where,
                    dueDate: { lt: new Date() },
                    status: { not: client_1.TaskStatus.COMPLETED },
                },
            }),
        ]);
        return {
            total,
            completed,
            inProgress,
            pending,
            overdue,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
    }
    escapeICalText(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    }
    formatICalDate(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }
    mapPriorityToICal(priority) {
        switch (priority) {
            case 'URGENT':
                return 1;
            case 'HIGH':
                return 3;
            case 'MEDIUM':
                return 5;
            case 'LOW':
                return 7;
            default:
                return 5;
        }
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map