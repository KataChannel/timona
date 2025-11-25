import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, PostStatus, Prisma } from '@prisma/client';
import { CreatePostInput, UpdatePostInput, PostFiltersInput } from '../graphql/inputs/post.input';
import { PaginationInput, PaginationMeta } from '../graphql/models/pagination.model';
import { PaginatedPosts } from '../graphql/models/paginated-posts.model';

// Type for Post with relations
type PostWithRelations = Post & {
  author: any;
  tags: Array<{ tag: any }>;
  _count?: { comments: number; likes: number };
};

// Type for GraphQL Post
type GraphQLPost = Post & {
  author: any;
  tags: any[];
};

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  // Transform Prisma post to GraphQL post
  private transformPost(post: PostWithRelations): GraphQLPost {
    return {
      ...post,
      tags: post.tags?.map(pt => pt.tag) || [],
    };
  }

  async findById(id: string): Promise<GraphQLPost> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return this.transformPost(post);
  }

  async findBySlug(slug: string): Promise<GraphQLPost> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        comments: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    return this.transformPost(post);
  }

  async findMany(
    pagination: PaginationInput,
    filters?: PostFiltersInput,
  ): Promise<PaginatedPosts> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED, // Only show published posts by default
    };

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.authorId) {
        where.authorId = filters.authorId;
      }
      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          some: {
            tag: {
              slug: { in: filters.tags },
            },
          },
        };
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
          { excerpt: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.post.count({ where });

    // Get posts
    const posts = await this.prisma.post.findMany({
      where,
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      items: posts.map(post => this.transformPost(post)),
      meta,
    };
  }

  async findByAuthor(authorId: string): Promise<GraphQLPost[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return posts.map(post => this.transformPost(post));
  }

  async create(input: CreatePostInput & { authorId: string }): Promise<GraphQLPost> {
    // Check if slug already exists
    const existingPost = await this.prisma.post.findUnique({
      where: { slug: input.slug },
    });

    if (existingPost) {
      throw new ConflictException('Post with this slug already exists');
    }

    const { tags, ...postData } = input;

    const post = await this.prisma.post.create({
      data: {
        ...postData,
        publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: true,
        tags: true,
      },
    });

    // Handle tags if provided
    if (tags && tags.length > 0) {
      await this.updatePostTags(post.id, tags);
    }

    return this.findById(post.id);
  }

  async update(id: string, input: UpdatePostInput): Promise<GraphQLPost> {
    const post = await this.findById(id);

    // Check if slug conflicts with existing posts
    if (input.slug && input.slug !== post.slug) {
      const existingPost = await this.prisma.post.findUnique({
        where: { slug: input.slug },
      });

      if (existingPost && existingPost.id !== id) {
        throw new ConflictException('Post with this slug already exists');
      }
    }

    const { tags, ...postData } = input;

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        publishedAt: 
          input.status === PostStatus.PUBLISHED && !post.publishedAt 
            ? new Date() 
            : post.publishedAt,
      },
    });

    // Handle tags if provided
    if (tags !== undefined) {
      await this.updatePostTags(id, tags);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Check if post exists

    await this.prisma.post.delete({
      where: { id },
    });
  }

  async publish(id: string): Promise<GraphQLPost> {
    await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    
    return this.findById(id);
  }

  async getLikesCount(postId: string): Promise<number> {
    return this.prisma.like.count({
      where: { postId },
    });
  }

  private async updatePostTags(postId: string, tagSlugs: string[], creatorId?: string): Promise<void> {
    // Remove existing tags
    await this.prisma.postTag.deleteMany({
      where: { postId },
    });

    // Add new tags
    for (const tagSlug of tagSlugs) {
      // Find or create tag
      let tag = await this.prisma.tag.findUnique({
        where: { slug: tagSlug },
      });

      if (!tag) {
        // Get post author if creator not provided
        if (!creatorId) {
          const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
          });
          creatorId = post?.authorId || 'system';
        }

        tag = await this.prisma.tag.create({
          data: {
            name: tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1),
            slug: tagSlug,
            creator: {
              connect: { id: creatorId }
            }
          },
        });
      }

      // Create post-tag relationship
      await this.prisma.postTag.create({
        data: {
          postId,
          tagId: tag.id,
        },
      });
    }
  }
}
