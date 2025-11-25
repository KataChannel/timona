import { PrismaService } from '../prisma/prisma.service';
interface DateRange {
    startDate?: Date;
    endDate?: Date;
}
export declare class ProjectAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProjectAnalytics(projectId: string, dateRange?: DateRange): Promise<{
        taskStats: {
            total: number;
            byStatus: {
                PENDING: number;
                IN_PROGRESS: number;
                COMPLETED: number;
                CANCELLED: number;
            };
            byPriority: {
                LOW: number;
                MEDIUM: number;
                HIGH: number;
                URGENT: number;
            };
            overdue: number;
        };
        memberStats: {
            user: any;
            role: string;
            totalTasks: number;
            completedTasks: number;
            inProgressTasks: number;
            completionRate: number;
            activityCount: number;
        }[];
        activityStats: {
            total: number;
            byType: Record<string, number>;
            dailyChart: {
                date: string;
                count: number;
            }[];
        };
        completionRate: {
            total: number;
            completed: number;
            rate: number;
        };
        averageCompletionTime: {
            averageDays: number;
            averageHours: number;
            totalCompleted: number;
        };
        upcomingDeadlines: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
            _count: {
                comments: number;
                subtasks: number;
            };
        } & {
            category: import("@prisma/client").$Enums.TaskCategory;
            order: number;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            parentId: string | null;
            priority: import("@prisma/client").$Enums.TaskPriority;
            title: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            dueDate: Date | null;
            completedAt: Date | null;
            projectId: string | null;
            assignedTo: string[];
            mentions: string[];
        })[];
        generatedAt: Date;
    }>;
    getTaskStatistics(projectId: string, dateRange?: DateRange): Promise<{
        total: number;
        byStatus: {
            PENDING: number;
            IN_PROGRESS: number;
            COMPLETED: number;
            CANCELLED: number;
        };
        byPriority: {
            LOW: number;
            MEDIUM: number;
            HIGH: number;
            URGENT: number;
        };
        overdue: number;
    }>;
    getMemberStatistics(projectId: string, dateRange?: DateRange): Promise<{
        user: any;
        role: string;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        completionRate: number;
        activityCount: number;
    }[]>;
    getActivityStatistics(projectId: string, dateRange?: DateRange): Promise<{
        total: number;
        byType: Record<string, number>;
        dailyChart: {
            date: string;
            count: number;
        }[];
    }>;
    getCompletionRate(projectId: string, dateRange?: DateRange): Promise<{
        total: number;
        completed: number;
        rate: number;
    }>;
    getAverageCompletionTime(projectId: string): Promise<{
        averageDays: number;
        averageHours: number;
        totalCompleted: number;
    }>;
    getUpcomingDeadlines(projectId: string): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        _count: {
            comments: number;
            subtasks: number;
        };
    } & {
        category: import("@prisma/client").$Enums.TaskCategory;
        order: number;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        tags: string[];
        description: string | null;
        parentId: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        completedAt: Date | null;
        projectId: string | null;
        assignedTo: string[];
        mentions: string[];
    })[]>;
    getOverdueTasks(projectId: string): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        _count: {
            comments: number;
            subtasks: number;
        };
    } & {
        category: import("@prisma/client").$Enums.TaskCategory;
        order: number;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        tags: string[];
        description: string | null;
        parentId: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        completedAt: Date | null;
        projectId: string | null;
        assignedTo: string[];
        mentions: string[];
    })[]>;
    getTaskVelocity(projectId: string, days?: number): Promise<{
        totalCompleted: number;
        averagePerDay: number;
        chart: {
            date: string;
            count: number;
        }[];
    }>;
    getTagStatistics(projectId: string): Promise<{
        tag: string;
        count: number;
    }[]>;
    getProjectHealthScore(projectId: string): Promise<{
        score: number;
        status: string;
        factors: {
            overdueTasks: number;
            completionRate: number;
            pendingRatio: number;
        };
    }>;
}
export {};
