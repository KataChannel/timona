import { ProjectAnalyticsService } from './project-analytics.service';
export declare class ProjectAnalyticsResolver {
    private readonly projectAnalyticsService;
    constructor(projectAnalyticsService: ProjectAnalyticsService);
    getProjectAnalytics(projectId: string, startDate?: Date, endDate?: Date, userId?: string): Promise<string>;
    getTaskStatistics(projectId: string): Promise<string>;
    getMemberStatistics(projectId: string): Promise<string>;
    getTaskVelocity(projectId: string, days: number): Promise<string>;
    getProjectHealthScore(projectId: string): Promise<string>;
    getUpcomingDeadlines(projectId: string): Promise<string>;
    getOverdueTasks(projectId: string): Promise<string>;
    getTagStatistics(projectId: string): Promise<string>;
}
