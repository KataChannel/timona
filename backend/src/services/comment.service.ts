import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '@prisma/client';
import { CreateCommentInput, UpdateCommentInput } from '../graphql/inputs/comment.input';

// Type for Comment with relations
type CommentWithRelations = Comment & {
  user: any;
  post: any;
  parent?: any;
  replies?: any[];
};

// Type for GraphQL Comment (matches the GraphQL model)
type GraphQLComment = Comment & {
  user: any;
  post: any;
  parent?: any;
  replies: any[]; // Always an array, never undefined
};

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  // Transform Prisma comment to GraphQL comment
  private transformComment(comment: CommentWithRelations): GraphQLComment {
    return {
      ...comment,
      replies: comment.replies || [], // Ensure replies is always an array
    };
  }

  async findById(id: string): Promise<GraphQLComment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
        post: true,
        parent: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return this.transformComment(comment);
  }

  async findByPost(postId: string): Promise<GraphQLComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { 
        postId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: true,
        post: true,
        replies: {
          include: {
            user: true,
            replies: {
              include: {
                user: true,
              },
            },
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

    return comments.map(comment => this.transformComment(comment));
  }

  async findReplies(parentId: string): Promise<GraphQLComment[]> {
    const replies = await this.prisma.comment.findMany({
      where: { parentId },
      include: {
        user: true,
        post: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return replies.map(reply => this.transformComment(reply));
  }

  async create(input: CreateCommentInput & { userId: string }): Promise<GraphQLComment> {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: input.postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${input.postId} not found`);
    }

    // Verify parent comment exists if provided
    if (input.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: input.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${input.parentId} not found`);
      }

      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== input.postId) {
        throw new NotFoundException('Parent comment does not belong to the specified post');
      }
    }

    const comment = await this.prisma.comment.create({
      data: input,
      include: {
        user: true,
        post: true,
        parent: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.transformComment(comment);
  }

  async update(id: string, input: UpdateCommentInput): Promise<GraphQLComment> {
    await this.findById(id); // Check if comment exists

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: input,
      include: {
        user: true,
        post: true,
        parent: true,
        replies: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.transformComment(updatedComment);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Check if comment exists

    // Delete comment and all its replies (cascade)
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async getCommentsCount(postId: string): Promise<number> {
    return this.prisma.comment.count({
      where: { postId },
    });
  }
}
