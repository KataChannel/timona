import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTaskId(taskId: string) {
    return this.prisma.taskMedia.findMany({
      where: { taskId },
      include: {
        uploader: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(taskId: string, uploaderId: string, mediaData: any) {
    // Check if task exists and user has access
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        shares: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    const hasAccess = 
      task.userId === uploaderId ||
      task.shares.some(share => 
        share.sharedWith === uploaderId && 
        share.isActive &&
        (share.permission === 'EDIT' || share.permission === 'ADMIN')
      );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to upload media to this task');
    }

    return this.prisma.taskMedia.create({
      data: {
        type: mediaData.type,
        url: mediaData.url,
        filename: mediaData.filename,
        size: mediaData.size,
        mimeType: mediaData.mimeType,
        caption: mediaData.caption,
        task: { connect: { id: taskId } },
        uploader: { connect: { id: uploaderId } },
      },
      include: {
        uploader: true,
      },
    });
  }

  async delete(mediaId: string, userId: string): Promise<void> {
    const media = await this.prisma.taskMedia.findUnique({
      where: { id: mediaId },
      include: {
        task: true,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Only uploader or task owner can delete the media
    const canDelete = 
      media.uploadedBy === userId ||
      media.task.userId === userId;

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this media');
    }

    await this.prisma.taskMedia.delete({
      where: { id: mediaId },
    });
  }
}
