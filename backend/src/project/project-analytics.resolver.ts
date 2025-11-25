import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectAnalyticsService } from './project-analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProjectAnalyticsResolver {
  constructor(
    private readonly projectAnalyticsService: ProjectAnalyticsService,
  ) {}

  @Query(() => String, {
    name: 'projectAnalytics',
    description: 'Get comprehensive project analytics (returned as JSON string)',
  })
  async getProjectAnalytics(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @CurrentUser('id') userId?: string,
  ): Promise<string> {
    const analytics = await this.projectAnalyticsService.getProjectAnalytics(
      projectId,
      { startDate, endDate },
    );
    return JSON.stringify(analytics);
  }

  @Query(() => String, {
    name: 'taskStatistics',
    description: 'Get task statistics by status and priority',
  })
  async getTaskStatistics(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const stats = await this.projectAnalyticsService.getTaskStatistics(projectId);
    return JSON.stringify(stats);
  }

  @Query(() => String, {
    name: 'memberStatistics',
    description: 'Get member performance statistics',
  })
  async getMemberStatistics(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const stats = await this.projectAnalyticsService.getMemberStatistics(projectId);
    return JSON.stringify(stats);
  }

  @Query(() => String, {
    name: 'taskVelocity',
    description: 'Get task completion velocity',
  })
  async getTaskVelocity(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('days', { defaultValue: 30 }) days: number,
  ): Promise<string> {
    const velocity = await this.projectAnalyticsService.getTaskVelocity(projectId, days);
    return JSON.stringify(velocity);
  }

  @Query(() => String, {
    name: 'projectHealthScore',
    description: 'Get project health score (0-100)',
  })
  async getProjectHealthScore(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const health = await this.projectAnalyticsService.getProjectHealthScore(projectId);
    return JSON.stringify(health);
  }

  @Query(() => String, {
    name: 'upcomingDeadlines',
    description: 'Get tasks with upcoming deadlines (next 7 days)',
  })
  async getUpcomingDeadlines(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const tasks = await this.projectAnalyticsService.getUpcomingDeadlines(projectId);
    return JSON.stringify(tasks);
  }

  @Query(() => String, {
    name: 'overdueTasks',
    description: 'Get overdue tasks',
  })
  async getOverdueTasks(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const tasks = await this.projectAnalyticsService.getOverdueTasks(projectId);
    return JSON.stringify(tasks);
  }

  @Query(() => String, {
    name: 'tagStatistics',
    description: 'Get tag usage statistics',
  })
  async getTagStatistics(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<string> {
    const stats = await this.projectAnalyticsService.getTagStatistics(projectId);
    return JSON.stringify(stats);
  }
}
