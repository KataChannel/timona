import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShareTaskInput, UpdateTaskShareInput } from '../graphql/inputs/task-share.input';
import { generateShareToken } from '../utils/share-token';

@Injectable()
export class TaskShareService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: ShareTaskInput, sharedById: string) {
    // Check if task exists and user has permission to share
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
      include: {
        shares: {
          include: {
            sharedByUser: true,
            sharedWithUser: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only owner or admin can share the task
    const canShare = 
      task.userId === sharedById ||
      task.shares.some(share => 
        share.sharedWith === sharedById && 
        share.permission === 'ADMIN'
      );

    if (!canShare) {
      throw new ForbiddenException('You do not have permission to share this task');
    }

    // Check if already shared with this user
    const existingShare = task.shares.find(share => share.sharedWith === input.sharedWithId);
    if (existingShare) {
      throw new ForbiddenException('Task is already shared with this user');
    }

    return this.prisma.taskShare.create({
      data: {
        task: { connect: { id: input.taskId } },
        sharedByUser: { connect: { id: sharedById } },
        sharedWithUser: { connect: { id: input.sharedWithId } },
        permission: input.permission,
        shareToken: generateShareToken(),
      },
      include: {
        task: true,
        sharedByUser: true,
        sharedWithUser: true,
      },
    });
  }

  async findByTaskId(taskId: string) {
    return this.prisma.taskShare.findMany({
      where: { taskId, isActive: true },
      include: {
        sharedByUser: true,
        sharedWithUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(input: UpdateTaskShareInput, userId: string) {
    const share = await this.prisma.taskShare.findUnique({
      where: { id: input.shareId },
      include: {
        task: true,
        sharedByUser: true,
        sharedWithUser: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Only task owner or the user who created the share can update it
    const canUpdate = 
      share.task.userId === userId ||
      share.sharedBy === userId;

    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this share');
    }

    return this.prisma.taskShare.update({
      where: { id: input.shareId },
      data: { permission: input.permission },
      include: {
        task: true,
        sharedByUser: true,
        sharedWithUser: true,
      },
    });
  }

  async delete(shareId: string, userId: string): Promise<void> {
    const share = await this.prisma.taskShare.findUnique({
      where: { id: shareId },
      include: {
        task: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Only task owner or the user who created the share can delete it
    const canDelete = 
      share.task.userId === userId ||
      share.sharedBy === userId ||
      share.sharedWith === userId; // User can remove themselves

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this share');
    }

    await this.prisma.taskShare.delete({
      where: { id: shareId },
    });
  }
}
