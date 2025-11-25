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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommentService = class CommentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformComment(comment) {
        return {
            ...comment,
            replies: comment.replies || [],
        };
    }
    async findById(id) {
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
            throw new common_1.NotFoundException(`Comment with ID "${id}" not found`);
        }
        return this.transformComment(comment);
    }
    async findByPost(postId) {
        const comments = await this.prisma.comment.findMany({
            where: {
                postId,
                parentId: null,
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
    async findReplies(parentId) {
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
    async create(input) {
        const post = await this.prisma.post.findUnique({
            where: { id: input.postId },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${input.postId} not found`);
        }
        if (input.parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: input.parentId },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException(`Parent comment with ID ${input.parentId} not found`);
            }
            if (parentComment.postId !== input.postId) {
                throw new common_1.NotFoundException('Parent comment does not belong to the specified post');
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
    async update(id, input) {
        await this.findById(id);
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
    async delete(id) {
        await this.findById(id);
        await this.prisma.comment.delete({
            where: { id },
        });
    }
    async getCommentsCount(postId) {
        return this.prisma.comment.count({
            where: { postId },
        });
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentService);
//# sourceMappingURL=comment.service.js.map