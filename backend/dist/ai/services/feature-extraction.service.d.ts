import { Task, TaskPriority } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export interface TaskFeatures {
    titleLength: number;
    descriptionLength: number;
    hasDescription: boolean;
    hasDueDate: boolean;
    daysUntilDue: number;
    currentWorkload: number;
    userProductivity: number;
    taskComplexity: number;
    similarTasksCompleted: number;
    avgCompletionTime: number;
    userPriorityPattern: Record<TaskPriority, number>;
    completionRate: number;
    procrastinationTendency: number;
    timeOfDay: number;
    dayOfWeek: number;
    seasonality: number;
    urgencyScore: number;
    importanceScore: number;
}
export interface UserContext {
    userId: string;
    currentTasks: number;
    completedTasks: number;
    overdueTasks: number;
    averageCompletionTime: number;
    productivityScore: number;
    workingHours: {
        start: number;
        end: number;
    };
    timezone: string;
    preferences: {
        preferredPriorities: TaskPriority[];
        workStyle: 'focused' | 'multitask' | 'deadline-driven';
        planningHorizon: number;
    };
}
export declare class FeatureExtractionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    extractTaskFeatures(task: Partial<Task>, userContext: UserContext): Promise<TaskFeatures>;
    getUserContext(userId: string): Promise<UserContext>;
    private calculateDaysUntilDue;
    private calculateCurrentWorkload;
    private estimateTaskComplexity;
    private countSimilarTasksCompleted;
    private getUserPriorityPattern;
    private calculateCompletionRate;
    private calculateProcrastinationTendency;
    private getTimeOfDay;
    private getDayOfWeek;
    private getSeasonality;
    private calculateUrgencyScore;
    private calculateImportanceScore;
    private countCurrentTasks;
    private countCompletedTasks;
    private countOverdueTasks;
    private calculateAverageCompletionTime;
    private calculateProductivityScore;
}
