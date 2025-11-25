import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import slugify from 'slugify';
import { CreateBlogCategoryInput, CreateBlogTagInput } from '../graphql/inputs/blog.input';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getBlogs(input: any = {}) {
    const page = input.page || 1;
    const limit = input.limit || 12;
    const skip = (page - 1) * limit;
    const where: any = {};
    
    // Only filter by PUBLISHED status if explicitly not requesting all statuses (for admin)
    if (input.statusFilter !== 'ALL') {
      where.status = input.statusFilter || PostStatus.PUBLISHED;
    }
    
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { content: { contains: input.search, mode: 'insensitive' } },
        { excerpt: { contains: input.search, mode: 'insensitive' } },
      ];
    }
    
    if (input.categoryId) where.categoryId = input.categoryId;
    
    let orderBy: any = { publishedAt: 'desc' };
    if (input.sort === 'oldest') orderBy = { publishedAt: 'asc' };
    if (input.sort === 'popular') orderBy = { viewCount: 'desc' };
    if (input.sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];
    
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where, orderBy, skip, take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } }),
      this.prisma.blogPost.count({ where }),
    ]);
    
    return { items: items.map(post => ({ ...post, tags: post.tags.map(t => t.tag) })), total, page, pageSize: limit, totalPages: Math.ceil(total / limit), hasMore: page < Math.ceil(total / limit) };
  }

  async getBlogById(id: string) {
    const blog = await this.prisma.blogPost.findUnique({ where: { id }, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
    if (!blog) throw new NotFoundException(`Blog post with id ${id} not found`);
    await this.prisma.blogPost.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return { ...blog, tags: blog.tags.map(t => t.tag) };
  }

  async getBlogBySlug(slug: string) {
    const blog = await this.prisma.blogPost.findUnique({ where: { slug }, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
    if (!blog) throw new NotFoundException(`Blog post with slug ${slug} not found`);
    await this.prisma.blogPost.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    return { ...blog, tags: blog.tags.map(t => t.tag) };
  }

  async getFeaturedBlogs(limit = 5) {
    return this.prisma.blogPost.findMany({ where: { status: PostStatus.PUBLISHED, isFeatured: true }, orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }], take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } } } });
  }

  async getRecentBlogs(limit = 10) {
    return this.prisma.blogPost.findMany({ where: { status: PostStatus.PUBLISHED }, orderBy: { publishedAt: 'desc' }, take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } } } });
  }

  async createBlog(input: any, userId: string) {
    if (input.slug) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug: input.slug } });
      if (existing) throw new BadRequestException(`Slug "${input.slug}" already exists`);
    }
    const data: any = { title: input.title, slug: input.slug, excerpt: input.excerpt, content: input.content, author: { connect: { id: userId } }, featuredImage: input.featuredImage, status: input.status || PostStatus.DRAFT, isFeatured: input.isFeatured || false, metaTitle: input.metaTitle, metaDescription: input.metaDescription, metaKeywords: input.metaKeywords || [] };
    if (input.categoryId) data.category = { connect: { id: input.categoryId } };
    if (input.tags?.length) data.tags = { create: input.tags.map((tagId: string) => ({ tag: { connect: { id: tagId } } })) };
    if (input.status === PostStatus.PUBLISHED && !input.publishedAt) data.publishedAt = new Date();
    return this.prisma.blogPost.create({ data, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
  }

  async updateBlog(id: string, input: any) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Blog post ID is required and cannot be empty');
    }
    const blog = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException(`Blog post with id ${id} not found`);
    if (input.slug && input.slug !== blog.slug) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug: input.slug } });
      if (existing) throw new BadRequestException(`Slug "${input.slug}" already exists`);
    }
    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.excerpt !== undefined) data.excerpt = input.excerpt;
    if (input.content !== undefined) data.content = input.content;
    if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage;
    if (input.status !== undefined) data.status = input.status;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;
    if (input.metaKeywords !== undefined) data.metaKeywords = input.metaKeywords;
    if (input.categoryId !== undefined) data.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
    if (input.tags !== undefined) {
      await this.prisma.blogPostTag.deleteMany({ where: { postId: id } });
      if (input.tags.length) await this.prisma.blogPostTag.createMany({ data: input.tags.map((tagId: string) => ({ postId: id, tagId })) });
    }
    if (input.status === PostStatus.PUBLISHED && !blog.publishedAt) data.publishedAt = new Date();
    return this.prisma.blogPost.update({ where: { id }, data, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
  }

  async deleteBlog(id: string) {
    const blog = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException(`Blog post with id ${id} not found`);
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }

  async getCategories() {
    const categories = await this.prisma.blogCategory.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { order: 'asc' } });
    return categories.map(cat => ({ ...cat, postCount: cat._count.posts }));
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.blogCategory.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return { ...category, postCount: category._count.posts };
  }

  async createCategory(input: CreateBlogCategoryInput) {
    // Generate slug from name if not provided
    const baseSlug = input.slug || slugify(input.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await this.prisma.blogCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return this.prisma.blogCategory.create({
      data: {
        ...input,
        slug,
      },
    });
  }

  async updateCategory(id: string, input: any) {
    const category = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return this.prisma.blogCategory.update({ where: { id }, data: input });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.blogCategory.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    if (category._count.posts > 0) throw new BadRequestException(`Cannot delete category with ${category._count.posts} posts`);
    await this.prisma.blogCategory.delete({ where: { id } });
    return { success: true };
  }

  async getTags() {
    return this.prisma.blogTag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: 'asc' } });
  }

  async getTagById(id: string) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
    if (!tag) throw new NotFoundException(`Tag with id ${id} not found`);
    return tag;
  }

  async createTag(input: CreateBlogTagInput) {
    // Generate slug from name if not provided
    const baseSlug = input.slug || slugify(input.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await this.prisma.blogTag.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Check if name already exists
    const existingName = await this.prisma.blogTag.findFirst({ where: { name: input.name } });
    if (existingName) throw new BadRequestException(`Tag name "${input.name}" already exists`);
    
    return this.prisma.blogTag.create({ data: { ...input, slug } });
  }

  async updateTag(id: string, input: any) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag with id ${id} not found`);
    return this.prisma.blogTag.update({ where: { id }, data: input });
  }

  async deleteTag(id: string) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
    if (!tag) throw new NotFoundException(`Tag with id ${id} not found`);
    if (tag._count.posts > 0) throw new BadRequestException(`Cannot delete tag with ${tag._count.posts} posts`);
    await this.prisma.blogTag.delete({ where: { id } });
    return { success: true };
  }

  async getBlogsByCategory(categoryId: string, input: any = {}) {
    return this.getBlogs({ ...input, categoryId });
  }

  async getRelatedBlogs(blogId: string, limit = 5) {
    const blog = await this.prisma.blogPost.findUnique({ where: { id: blogId }, select: { categoryId: true, tags: true } });
    if (!blog) throw new NotFoundException(`Blog post with id ${blogId} not found`);
    
    const where: any = { 
      status: PostStatus.PUBLISHED,
      id: { not: blogId },
    };
    
    if (blog.categoryId) {
      where.categoryId = blog.categoryId;
    }
    
    return this.prisma.blogPost.findMany({
      where,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: { 
        category: true, 
        author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } },
        tags: { include: { tag: true } }
      }
    });
  }
}
