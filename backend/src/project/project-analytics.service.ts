import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, TaskPriority, ActivityType } from '@prisma/client';

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ProjectAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive project analytics
   */
  async getProjectAnalytics(projectId: string, dateRange?: DateRange) {
    const [
      taskStats,
      memberStats,
      activityStats,
      completionRate,
      averageCompletionTime,
      upcomingDeadlines,
      overdueТasks,
    ] = await Promise.all([
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

  /**
   * Task statistics by status and priority
   */
  async getTaskStatistics(projectId: string, dateRange?: DateRange) {
    const where: any = { projectId };
    
    if (dateRange?.startDate || dateRange?.endDate) {
      where.createdAt = {};
      if (dateRange.startDate) where.createdAt.gte = dateRange.startDate;
      if (dateRange.endDate) where.createdAt.lte = dateRange.endDate;
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

    // Group by status
    const byStatus = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    // Group by priority
    const byPriority = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0,
    };

    let overdue = 0;
    const now = new Date();

    tasks.forEach((task) => {
      byStatus[task.status]++;
      byPriority[task.priority]++;

      if (
        task.dueDate &&
        task.dueDate < now &&
        task.status !== TaskStatus.COMPLETED
      ) {
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

  /**
   * Member performance statistics
   */
  async getMemberStatistics(projectId: string, dateRange?: DateRange) {
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

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const where: any = {
          projectId,
          assignedTo: {
            has: member.userId,
          },
        };

        if (dateRange?.startDate || dateRange?.endDate) {
          where.createdAt = {};
          if (dateRange.startDate) where.createdAt.gte = dateRange.startDate;
          if (dateRange.endDate) where.createdAt.lte = dateRange.endDate;
        }

        const [totalTasks, completedTasks, inProgressTasks] = await Promise.all([
          this.prisma.task.count({ where }),
          this.prisma.task.count({
            where: { ...where, status: TaskStatus.COMPLETED },
          }),
          this.prisma.task.count({
            where: { ...where, status: TaskStatus.IN_PROGRESS },
          }),
        ]);

        // Get activity count
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
          user: (member as any).user,
          role: member.role,
          totalTasks,
          completedTasks,
          inProgressTasks,
          completionRate:
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          activityCount,
        };
      }),
    );

    return memberStats.sort((a, b) => b.completedTasks - a.completedTasks);
  }

  /**
   * Activity timeline statistics
   */
  async getActivityStatistics(projectId: string, dateRange?: DateRange) {
    const where: any = {
      task: {
        projectId,
      },
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      where.createdAt = {};
      if (dateRange.startDate) where.createdAt.gte = dateRange.startDate;
      if (dateRange.endDate) where.createdAt.lte = dateRange.endDate;
    }

    const activities = await this.prisma.taskActivityLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
    });

    const activityByType: Record<string, number> = {};
    activities.forEach((activity) => {
      activityByType[activity.action] = activity._count.action;
    });

    // Get daily activity count for chart
    const dailyActivity = await this.prisma.taskActivityLog.findMany({
      where,
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dailyActivityMap: Record<string, number> = {};
    dailyActivity.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      dailyActivityMap[date] = (dailyActivityMap[date] || 0) + 1;
    });

    const dailyActivityChart = Object.entries(dailyActivityMap).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return {
      total: dailyActivity.length,
      byType: activityByType,
      dailyChart: dailyActivityChart,
    };
  }

  /**
   * Task completion rate
   */
  async getCompletionRate(projectId: string, dateRange?: DateRange) {
    const where: any = { projectId };

    if (dateRange?.startDate || dateRange?.endDate) {
      where.createdAt = {};
      if (dateRange.startDate) where.createdAt.gte = dateRange.startDate;
      if (dateRange.endDate) where.createdAt.lte = dateRange.endDate;
    }

    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({
        where: { ...where, status: TaskStatus.COMPLETED },
      }),
    ]);

    return {
      total,
      completed,
      rate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  /**
   * Average task completion time
   */
  async getAverageCompletionTime(projectId: string) {
    const completedTasks = await this.prisma.task.findMany({
      where: {
        projectId,
        status: TaskStatus.COMPLETED,
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
      const diff =
        task.completedAt!.getTime() - task.createdAt.getTime();
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

  /**
   * Upcoming deadlines (next 7 days)
   */
  async getUpcomingDeadlines(projectId: string) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        status: {
          not: TaskStatus.COMPLETED,
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

  /**
   * Overdue tasks
   */
  async getOverdueTasks(projectId: string) {
    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        status: {
          not: TaskStatus.COMPLETED,
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

  /**
   * Task velocity (tasks completed per time period)
   */
  async getTaskVelocity(projectId: string, days: number = 30) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const completedTasks = await this.prisma.task.findMany({
      where: {
        projectId,
        status: TaskStatus.COMPLETED,
        completedAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        completedAt: true,
      },
    });

    // Group by date
    const dailyCompletions: Record<string, number> = {};
    completedTasks.forEach((task) => {
      const date = task.completedAt!.toISOString().split('T')[0];
      dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
    });

    const velocityChart = Object.entries(dailyCompletions).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return {
      totalCompleted: completedTasks.length,
      averagePerDay: completedTasks.length / days,
      chart: velocityChart,
    };
  }

  /**
   * Tag usage statistics
   */
  async getTagStatistics(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
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

  /**
   * Project health score (0-100)
   */
  async getProjectHealthScore(projectId: string) {
    const [taskStats, completionRate, overdueTasks] = await Promise.all([
      this.getTaskStatistics(projectId),
      this.getCompletionRate(projectId),
      this.getOverdueTasks(projectId),
    ]);

    let score = 100;

    // Deduct points for overdue tasks
    if (taskStats.overdue > 0) {
      score -= Math.min(taskStats.overdue * 5, 30);
    }

    // Deduct points for low completion rate
    if (completionRate.rate < 50) {
      score -= 20;
    } else if (completionRate.rate < 70) {
      score -= 10;
    }

    // Deduct points for too many pending tasks
    const pendingRatio = taskStats.byStatus[TaskStatus.PENDING] / taskStats.total;
    if (pendingRatio > 0.5) {
      score -= 15;
    }

    return {
      score: Math.max(score, 0),
      status:
        score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
      factors: {
        overdueTasks: taskStats.overdue,
        completionRate: completionRate.rate,
        pendingRatio: pendingRatio * 100,
      },
    };
  }
}
