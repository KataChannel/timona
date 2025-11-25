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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PostService = class PostService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformPost(post) {
        return {
            ...post,
            tags: post.tags?.map(pt => pt.tag) || [],
        };
    }
    async findById(id) {
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
            throw new common_1.NotFoundException(`Post with ID "${id}" not found`);
        }
        return this.transformPost(post);
    }
    async findBySlug(slug) {
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
            throw new common_1.NotFoundException(`Post with slug ${slug} not found`);
        }
        return this.transformPost(post);
    }
    async findMany(pagination, filters) {
        const { page, limit, search } = pagination;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.PostStatus.PUBLISHED,
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
        const total = await this.prisma.post.count({ where });
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
        const meta = {
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
    async findByAuthor(authorId) {
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
    async create(input) {
        const existingPost = await this.prisma.post.findUnique({
            where: { slug: input.slug },
        });
        if (existingPost) {
            throw new common_1.ConflictException('Post with this slug already exists');
        }
        const { tags, ...postData } = input;
        const post = await this.prisma.post.create({
            data: {
                ...postData,
                publishedAt: input.status === client_1.PostStatus.PUBLISHED ? new Date() : null,
            },
            include: {
                author: true,
                tags: true,
            },
        });
        if (tags && tags.length > 0) {
            await this.updatePostTags(post.id, tags);
        }
        return this.findById(post.id);
    }
    async update(id, input) {
        const post = await this.findById(id);
        if (input.slug && input.slug !== post.slug) {
            const existingPost = await this.prisma.post.findUnique({
                where: { slug: input.slug },
            });
            if (existingPost && existingPost.id !== id) {
                throw new common_1.ConflictException('Post with this slug already exists');
            }
        }
        const { tags, ...postData } = input;
        const updatedPost = await this.prisma.post.update({
            where: { id },
            data: {
                ...postData,
                publishedAt: input.status === client_1.PostStatus.PUBLISHED && !post.publishedAt
                    ? new Date()
                    : post.publishedAt,
            },
        });
        if (tags !== undefined) {
            await this.updatePostTags(id, tags);
        }
        return this.findById(id);
    }
    async delete(id) {
        await this.findById(id);
        await this.prisma.post.delete({
            where: { id },
        });
    }
    async publish(id) {
        await this.prisma.post.update({
            where: { id },
            data: {
                status: client_1.PostStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });
        return this.findById(id);
    }
    async getLikesCount(postId) {
        return this.prisma.like.count({
            where: { postId },
        });
    }
    async updatePostTags(postId, tagSlugs, creatorId) {
        await this.prisma.postTag.deleteMany({
            where: { postId },
        });
        for (const tagSlug of tagSlugs) {
            let tag = await this.prisma.tag.findUnique({
                where: { slug: tagSlug },
            });
            if (!tag) {
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
            await this.prisma.postTag.create({
                data: {
                    postId,
                    tagId: tag.id,
                },
            });
        }
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostService);
//# sourceMappingURL=post.service.js.map