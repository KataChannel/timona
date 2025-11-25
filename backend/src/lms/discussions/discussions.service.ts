import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscussionInput, CreateReplyInput, UpdateDiscussionInput } from './dto/discussion.input';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new discussion
   */
  async createDiscussion(userId: string, input: CreateDiscussionInput) {
    // Validate input
    if (!input.courseId) {
      throw new BadRequestException('Course ID is required');
    }

    // Verify user is enrolled in course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: input.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You must be enrolled in this course to create discussions');
    }

    // If lessonId provided, verify it belongs to the course
    if (input.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { courseModule: true },
      });

      if (!lesson || lesson.courseModule.courseId !== input.courseId) {
        throw new BadRequestException('Invalid lesson for this course');
      }
    }

    return this.prisma.discussion.create({
      data: {
        userId,
        courseId: input.courseId,
        lessonId: input.lessonId,
        title: input.title,
        content: input.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        replies: true,
      },
    });
  }

  /**
   * Get discussions for a course
   */
  async getCourseDiscussions(courseId: string, lessonId?: string) {
    const where: any = { courseId };
    if (lessonId) {
      where.lessonId = lessonId;
    }

    return this.prisma.discussion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get single discussion with all replies
   */
  async getDiscussion(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            children: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          where: { parentId: null }, // Only top-level replies
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return discussion;
  }

  /**
   * Create reply to discussion
   */
  async createReply(userId: string, input: CreateReplyInput) {
    // Validate input
    if (!input.discussionId) {
      throw new BadRequestException('Discussion ID is required');
    }

    // Verify discussion exists
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: input.discussionId },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Verify user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: discussion.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You must be enrolled to reply');
    }

    // If parentId provided, verify it exists
    if (input.parentId) {
      const parentReply = await this.prisma.discussionReply.findUnique({
        where: { id: input.parentId },
      });

      if (!parentReply || parentReply.discussionId !== input.discussionId) {
        throw new BadRequestException('Invalid parent reply');
      }
    }

    return this.prisma.discussionReply.create({
      data: {
        discussionId: input.discussionId,
        userId,
        content: input.content,
        parentId: input.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Update discussion (author only)
   */
  async updateDiscussion(userId: string, input: UpdateDiscussionInput) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: input.id },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.userId !== userId) {
      throw new ForbiddenException('You can only edit your own discussions');
    }

    const { id, ...updateData } = input;

    return this.prisma.discussion.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Delete discussion (author or instructor)
   */
  async deleteDiscussion(userId: string, id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Allow delete if user is author or course instructor
    if (discussion.userId !== userId && discussion.course.instructorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this discussion');
    }

    await this.prisma.discussion.delete({ where: { id } });

    return { success: true };
  }

  /**
   * Pin/unpin discussion (instructor only)
   */
  async togglePin(userId: string, id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.course.instructorId !== userId) {
      throw new ForbiddenException('Only instructor can pin discussions');
    }

    return this.prisma.discussion.update({
      where: { id },
      data: { isPinned: !discussion.isPinned },
    });
  }
}
