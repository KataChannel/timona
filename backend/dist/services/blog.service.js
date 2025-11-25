"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
let BlogService = class BlogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBlogs(input = {}) {
        const page = input.page || 1;
        const limit = input.limit || 12;
        const skip = (page - 1) * limit;
        const where = {};
        if (input.statusFilter !== 'ALL') {
            where.status = input.statusFilter || client_1.PostStatus.PUBLISHED;
        }
        if (input.search) {
            where.OR = [
                { title: { contains: input.search, mode: 'insensitive' } },
                { content: { contains: input.search, mode: 'insensitive' } },
                { excerpt: { contains: input.search, mode: 'insensitive' } },
            ];
        }
        if (input.categoryId)
            where.categoryId = input.categoryId;
        let orderBy = { publishedAt: 'desc' };
        if (input.sort === 'oldest')
            orderBy = { publishedAt: 'asc' };
        if (input.sort === 'popular')
            orderBy = { viewCount: 'desc' };
        if (input.sort === 'featured')
            orderBy = [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];
        const [items, total] = await Promise.all([
            this.prisma.blogPost.findMany({ where, orderBy, skip, take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } }),
            this.prisma.blogPost.count({ where }),
        ]);
        return { items: items.map(post => ({ ...post, tags: post.tags.map(t => t.tag) })), total, page, pageSize: limit, totalPages: Math.ceil(total / limit), hasMore: page < Math.ceil(total / limit) };
    }
    async getBlogById(id) {
        const blog = await this.prisma.blogPost.findUnique({ where: { id }, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
        if (!blog)
            throw new common_1.NotFoundException(`Blog post with id ${id} not found`);
        await this.prisma.blogPost.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        return { ...blog, tags: blog.tags.map(t => t.tag) };
    }
    async getBlogBySlug(slug) {
        const blog = await this.prisma.blogPost.findUnique({ where: { slug }, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
        if (!blog)
            throw new common_1.NotFoundException(`Blog post with slug ${slug} not found`);
        await this.prisma.blogPost.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
        return { ...blog, tags: blog.tags.map(t => t.tag) };
    }
    async getFeaturedBlogs(limit = 5) {
        return this.prisma.blogPost.findMany({ where: { status: client_1.PostStatus.PUBLISHED, isFeatured: true }, orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }], take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } } } });
    }
    async getRecentBlogs(limit = 10) {
        return this.prisma.blogPost.findMany({ where: { status: client_1.PostStatus.PUBLISHED }, orderBy: { publishedAt: 'desc' }, take: limit, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } } } });
    }
    async createBlog(input, userId) {
        if (input.slug) {
            const existing = await this.prisma.blogPost.findUnique({ where: { slug: input.slug } });
            if (existing)
                throw new common_1.BadRequestException(`Slug "${input.slug}" already exists`);
        }
        const data = { title: input.title, slug: input.slug, excerpt: input.excerpt, content: input.content, author: { connect: { id: userId } }, featuredImage: input.featuredImage, status: input.status || client_1.PostStatus.DRAFT, isFeatured: input.isFeatured || false, metaTitle: input.metaTitle, metaDescription: input.metaDescription, metaKeywords: input.metaKeywords || [] };
        if (input.categoryId)
            data.category = { connect: { id: input.categoryId } };
        if (input.tags?.length)
            data.tags = { create: input.tags.map((tagId) => ({ tag: { connect: { id: tagId } } })) };
        if (input.status === client_1.PostStatus.PUBLISHED && !input.publishedAt)
            data.publishedAt = new Date();
        return this.prisma.blogPost.create({ data, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
    }
    async updateBlog(id, input) {
        if (!id || id.trim() === '') {
            throw new common_1.BadRequestException('Blog post ID is required and cannot be empty');
        }
        const blog = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!blog)
            throw new common_1.NotFoundException(`Blog post with id ${id} not found`);
        if (input.slug && input.slug !== blog.slug) {
            const existing = await this.prisma.blogPost.findUnique({ where: { slug: input.slug } });
            if (existing)
                throw new common_1.BadRequestException(`Slug "${input.slug}" already exists`);
        }
        const data = {};
        if (input.title !== undefined)
            data.title = input.title;
        if (input.slug !== undefined)
            data.slug = input.slug;
        if (input.excerpt !== undefined)
            data.excerpt = input.excerpt;
        if (input.content !== undefined)
            data.content = input.content;
        if (input.featuredImage !== undefined)
            data.featuredImage = input.featuredImage;
        if (input.status !== undefined)
            data.status = input.status;
        if (input.isFeatured !== undefined)
            data.isFeatured = input.isFeatured;
        if (input.metaTitle !== undefined)
            data.metaTitle = input.metaTitle;
        if (input.metaDescription !== undefined)
            data.metaDescription = input.metaDescription;
        if (input.metaKeywords !== undefined)
            data.metaKeywords = input.metaKeywords;
        if (input.categoryId !== undefined)
            data.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
        if (input.tags !== undefined) {
            await this.prisma.blogPostTag.deleteMany({ where: { postId: id } });
            if (input.tags.length)
                await this.prisma.blogPostTag.createMany({ data: input.tags.map((tagId) => ({ postId: id, tagId })) });
        }
        if (input.status === client_1.PostStatus.PUBLISHED && !blog.publishedAt)
            data.publishedAt = new Date();
        return this.prisma.blogPost.update({ where: { id }, data, include: { category: true, author: { select: { id: true, username: true, firstName: true, lastName: true, email: true } }, tags: { include: { tag: true } } } });
    }
    async deleteBlog(id) {
        const blog = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!blog)
            throw new common_1.NotFoundException(`Blog post with id ${id} not found`);
        await this.prisma.blogPost.delete({ where: { id } });
        return { success: true };
    }
    async getCategories() {
        const categories = await this.prisma.blogCategory.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { order: 'asc' } });
        return categories.map(cat => ({ ...cat, postCount: cat._count.posts }));
    }
    async getCategoryById(id) {
        const category = await this.prisma.blogCategory.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
        if (!category)
            throw new common_1.NotFoundException(`Category with id ${id} not found`);
        return { ...category, postCount: category._count.posts };
    }
    async createCategory(input) {
        const baseSlug = input.slug || (0, slugify_1.default)(input.name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
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
    async updateCategory(id, input) {
        const category = await this.prisma.blogCategory.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException(`Category with id ${id} not found`);
        return this.prisma.blogCategory.update({ where: { id }, data: input });
    }
    async deleteCategory(id) {
        const category = await this.prisma.blogCategory.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
        if (!category)
            throw new common_1.NotFoundException(`Category with id ${id} not found`);
        if (category._count.posts > 0)
            throw new common_1.BadRequestException(`Cannot delete category with ${category._count.posts} posts`);
        await this.prisma.blogCategory.delete({ where: { id } });
        return { success: true };
    }
    async getTags() {
        return this.prisma.blogTag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: 'asc' } });
    }
    async getTagById(id) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
        if (!tag)
            throw new common_1.NotFoundException(`Tag with id ${id} not found`);
        return tag;
    }
    async createTag(input) {
        const baseSlug = input.slug || (0, slugify_1.default)(input.name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.blogTag.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        const existingName = await this.prisma.blogTag.findFirst({ where: { name: input.name } });
        if (existingName)
            throw new common_1.BadRequestException(`Tag name "${input.name}" already exists`);
        return this.prisma.blogTag.create({ data: { ...input, slug } });
    }
    async updateTag(id, input) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id } });
        if (!tag)
            throw new common_1.NotFoundException(`Tag with id ${id} not found`);
        return this.prisma.blogTag.update({ where: { id }, data: input });
    }
    async deleteTag(id) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
        if (!tag)
            throw new common_1.NotFoundException(`Tag with id ${id} not found`);
        if (tag._count.posts > 0)
            throw new common_1.BadRequestException(`Cannot delete tag with ${tag._count.posts} posts`);
        await this.prisma.blogTag.delete({ where: { id } });
        return { success: true };
    }
    async getBlogsByCategory(categoryId, input = {}) {
        return this.getBlogs({ ...input, categoryId });
    }
    async getRelatedBlogs(blogId, limit = 5) {
        const blog = await this.prisma.blogPost.findUnique({ where: { id: blogId }, select: { categoryId: true, tags: true } });
        if (!blog)
            throw new common_1.NotFoundException(`Blog post with id ${blogId} not found`);
        const where = {
            status: client_1.PostStatus.PUBLISHED,
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
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map