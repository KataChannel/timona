import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskCommentInput, UpdateTaskCommentInput } from '../graphql/inputs/task-comment.input';

@Injectable()
export class TaskCommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTaskCommentInput, authorId: string) {
    // Check if task exists and user has access
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
      include: {
        shares: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    const hasAccess = 
      task.userId === authorId ||
      task.shares.some(share => share.sharedWith === authorId && share.isActive);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // If this is a reply, check if parent comment exists
    if (input.parentId) {
      const parentComment = await this.prisma.taskComment.findUnique({
        where: { id: input.parentId },
      });

      if (!parentComment || parentComment.taskId !== input.taskId) {
        throw new NotFoundException('Parent comment not found or does not belong to this task');
      }
    }

    return this.prisma.taskComment.create({
      data: {
        content: input.content,
        task: { connect: { id: input.taskId } },
        user: { connect: { id: authorId } },
        ...(input.parentId && { parent: { connect: { id: input.parentId } } }),
      },
      include: {
        user: true,
        task: true,
        parent: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByTaskId(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { 
        taskId,
        parentId: null // Only return top-level comments
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.taskComment.findUnique({
      where: { id },
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async findReplies(parentId: string) {
    return this.prisma.taskComment.findMany({
      where: { parentId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(input: UpdateTaskCommentInput, userId: string) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: input.commentId },
      include: {
        user: true,
        task: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only comment author can update the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.taskComment.update({
      where: { id: input.commentId },
      data: { content: input.content },
      include: {
        user: true,
        task: true,
      },
    });
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        task: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only comment author or task owner can delete the comment
    const canDelete = 
      comment.userId === userId ||
      comment.task.userId === userId;

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.taskComment.delete({
      where: { id: commentId },
    });
  }
}
