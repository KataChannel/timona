import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../graphql/inputs/task.input';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string, filters?: TaskFilterInput) {
    const where: any = { userId };
    
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters?.dueBefore) where.dueDate = { lte: new Date(filters.dueBefore) };
    if (filters?.dueAfter) where.dueDate = { gte: new Date(filters.dueAfter) };

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

  async findById(id: string, userId: string) {
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
          where: { parentId: null }, // Only top-level comments
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
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    const hasAccess = 
      task.userId === userId ||
      task.shares.some(share => share.sharedWith === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async findSharedTasks(userId: string, filters?: TaskFilterInput) {
    const where: any = {
      shares: {
        some: {
          sharedWith: userId,
          isActive: true,
        },
      },
    };

    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters?.dueBefore) where.dueDate = { lte: new Date(filters.dueBefore) };
    if (filters?.dueAfter) where.dueDate = { gte: new Date(filters.dueAfter) };

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

  async create(input: CreateTaskInput, userId: string) {
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

  async update(input: UpdateTaskInput, userId: string) {
    const task = await this.findById(input.id, userId);

    // Check if user has edit permission
    const canEdit = 
      task.userId === userId ||
      task.shares.some(share => 
        share.sharedWith === userId && 
        (share.permission === 'EDIT' || share.permission === 'ADMIN')
      );

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this task');
    }

    const data: any = {};
    
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.priority !== undefined) data.priority = input.priority;
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

  async delete(id: string, userId: string): Promise<void> {
    const task = await this.findById(id, userId);

    // Only owner can delete the task
    if (task.userId !== userId) {
      throw new ForbiddenException('Only the task owner can delete this task');
    }

    await this.prisma.task.delete({
      where: { id },
    });
  }

  // Subtask Management
  async findSubtasks(parentId: string, userId: string) {
    // Verify user has access to parent task
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

  async createSubtask(parentId: string, input: CreateTaskInput, userId: string) {
    // Verify user has access to parent task
    const parentTask = await this.findById(parentId, userId);
    
    // Check if user has edit permission
    const canEdit = 
      parentTask.userId === userId ||
      parentTask.shares.some(share => 
        share.sharedWith === userId && 
        (share.permission === 'EDIT' || share.permission === 'ADMIN')
      );

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to create subtasks for this task');
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

  async findPaginated(userId: string, page: number, limit: number, filters?: TaskFilterInput) {
    const where: any = { userId };
    
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters?.dueBefore) where.dueDate = { lte: new Date(filters.dueBefore) };
    if (filters?.dueAfter) where.dueDate = { gte: new Date(filters.dueAfter) };

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

  async getTaskProgress(taskId: string, userId: string) {
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

  // ==================== PROJECT TASK METHODS (NEW) ====================

  /**
   * Lấy tasks của project (dùng cho TaskFeed)
   * Sắp xếp theo: priority + dueDate + order
   */
  async findByProjectId(projectId: string, userId: string, filters?: TaskFilterInput) {
    // Check if user is member of project
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const where: any = { projectId };
    
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters?.dueBefore) where.dueDate = { lte: new Date(filters.dueBefore) };
    if (filters?.dueAfter) where.dueDate = { gte: new Date(filters.dueAfter) };

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
          take: 3, // Show only first 3 comments
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

  /**
   * Tạo task trong project
   * Support @mentions
   */
  async createProjectTask(
    projectId: string,
    userId: string,
    input: CreateTaskInput & {
      assignedTo?: string[];
      mentions?: string[];
      tags?: string[];
      order?: number;
    },
  ) {
    // Check if user is member
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    // Get max order for auto-ordering
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

    // Create notifications for @mentions
    if (input.mentions && input.mentions.length > 0) {
      await this.createMentionNotifications(task.id, userId, input.mentions);
    }

    // Create notifications for assigned users
    if (input.assignedTo && input.assignedTo.length > 0) {
      await this.createAssignmentNotifications(task.id, userId, input.assignedTo);
    }

    return task;
  }

  /**
   * Update task order (drag & drop)
   */
  async updateTaskOrder(taskId: string, userId: string, newOrder: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check permission (project member or task owner)
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
        throw new ForbiddenException('You do not have permission to reorder this task');
      }
    } else if (task.userId !== userId) {
      throw new ForbiddenException('You can only reorder your own tasks');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { order: newOrder },
    });
  }

  /**
   * Assign task to users
   */
  async assignTask(taskId: string, userId: string, assignedUserIds: string[]) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check permission
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
        throw new ForbiddenException('You are not a member of this project');
      }
    } else if (task.userId !== userId) {
      throw new ForbiddenException('Only task owner can assign personal tasks');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { assignedTo: assignedUserIds },
      include: {
        user: true,
        project: true,
      },
    });

    // Notify assigned users
    await this.createAssignmentNotifications(taskId, userId, assignedUserIds);

    return updatedTask;
  }

  // ==================== NOTIFICATION HELPERS ====================

  /**
   * Tạo notifications cho @mentions
   */
  private async createMentionNotifications(
    taskId: string,
    mentionerUserId: string,
    mentionedUserIds: string[],
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const notifications = mentionedUserIds
      .filter((uid) => uid !== mentionerUserId) // Don't notify yourself
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

  /**
   * Tạo notifications cho task assignments
   */
  private async createAssignmentNotifications(
    taskId: string,
    assignerUserId: string,
    assignedUserIds: string[],
  ) {
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
}
