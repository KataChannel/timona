import { Injectable } from '@nestjs/common';
import DataLoader = require('dataloader');
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaskDataLoaderService {
  constructor(private readonly prismaService: PrismaService) {}

  // DataLoader for users to prevent N+1 queries
  private readonly userLoader = new DataLoader<string, any>(
    async (userIds: readonly string[]) => {
      const users = await this.prismaService.user.findMany({
        where: { id: { in: userIds as string[] } },
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
      
      // Return in the same order as requested
      return userIds.map(id => users.find(user => user.id === id) || null);
    },
    {
      cache: true,
      batchScheduleFn: callback => setTimeout(callback, 1),
      maxBatchSize: 100
    }
  );

  // DataLoader for task comments
  private readonly commentsLoader = new DataLoader<string, any[]>(
    async (taskIds: readonly string[]) => {
      const comments = await this.prismaService.taskComment.findMany({
        where: { taskId: { in: taskIds as string[] } },
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
      
      // Group by taskId
      return taskIds.map(taskId => comments.filter(comment => comment.taskId === taskId));
    },
    {
      cache: true,
      batchScheduleFn: callback => setTimeout(callback, 1),
      maxBatchSize: 50
    }
  );

  // DataLoader for task media
  private readonly mediaLoader = new DataLoader<string, any[]>(
    async (taskIds: readonly string[]) => {
      const media = await this.prismaService.taskMedia.findMany({
        where: { taskId: { in: taskIds as string[] } },
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
      
      // Group by taskId
      return taskIds.map(taskId => media.filter(m => m.taskId === taskId));
    },
    {
      cache: true,
      batchScheduleFn: callback => setTimeout(callback, 1),
      maxBatchSize: 50
    }
  );

  // DataLoader for task counts (comments, media, subtasks)
  private readonly taskCountsLoader = new DataLoader<string, { comments: number; media: number; subtasks: number }>(
    async (taskIds: readonly string[]) => {
      const [commentCounts, mediaCounts, subtaskCounts] = await Promise.all([
        // Comments count
        this.prismaService.taskComment.groupBy({
          by: ['taskId'],
          where: { taskId: { in: taskIds as string[] } },
          _count: { id: true }
        }),
        // Media count
        this.prismaService.taskMedia.groupBy({
          by: ['taskId'],
          where: { taskId: { in: taskIds as string[] } },
          _count: { id: true }
        }),
        // Subtasks count
        this.prismaService.task.groupBy({
          by: ['parentId'],
          where: { parentId: { in: taskIds as string[] } },
          _count: { id: true }
        })
      ]);

      // Create lookup maps
      const commentCountMap = new Map(commentCounts.map(c => [c.taskId, c._count.id]));
      const mediaCountMap = new Map(mediaCounts.map(m => [m.taskId, m._count.id]));
      const subtaskCountMap = new Map(subtaskCounts.map(s => [s.parentId!, s._count.id]));

      return taskIds.map(taskId => ({
        comments: commentCountMap.get(taskId) || 0,
        media: mediaCountMap.get(taskId) || 0,
        subtasks: subtaskCountMap.get(taskId) || 0
      }));
    },
    {
      cache: true,
      batchScheduleFn: callback => setTimeout(callback, 1),
      maxBatchSize: 100
    }
  );

  // Public methods to access the DataLoaders
  async loadUser(userId: string): Promise<any | null> {
    return this.userLoader.load(userId);
  }

  async loadComments(taskId: string): Promise<any[]> {
    return this.commentsLoader.load(taskId);
  }

  async loadMedia(taskId: string): Promise<any[]> {
    return this.mediaLoader.load(taskId);
  }

  async loadTaskCounts(taskId: string): Promise<{ comments: number; media: number; subtasks: number }> {
    return this.taskCountsLoader.load(taskId);
  }

  // Clear specific cache entries
  clearUser(userId: string): void {
    this.userLoader.clear(userId);
  }

  clearComments(taskId: string): void {
    this.commentsLoader.clear(taskId);
  }

  clearMedia(taskId: string): void {
    this.mediaLoader.clear(taskId);
  }

  clearTaskCounts(taskId: string): void {
    this.taskCountsLoader.clear(taskId);
  }

  // Clear all caches
  clearAll(): void {
    this.userLoader.clearAll();
    this.commentsLoader.clearAll();
    this.mediaLoader.clearAll();
    this.taskCountsLoader.clearAll();
  }
}