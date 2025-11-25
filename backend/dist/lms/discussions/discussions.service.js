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
exports.DiscussionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DiscussionsService = class DiscussionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDiscussion(userId, input) {
        if (!input.courseId) {
            throw new common_1.BadRequestException('Course ID is required');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: input.courseId,
                },
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('You must be enrolled in this course to create discussions');
        }
        if (input.lessonId) {
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: input.lessonId },
                include: { courseModule: true },
            });
            if (!lesson || lesson.courseModule.courseId !== input.courseId) {
                throw new common_1.BadRequestException('Invalid lesson for this course');
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
    async getCourseDiscussions(courseId, lessonId) {
        const where = { courseId };
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
    async getDiscussion(id) {
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
                    where: { parentId: null },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        return discussion;
    }
    async createReply(userId, input) {
        if (!input.discussionId) {
            throw new common_1.BadRequestException('Discussion ID is required');
        }
        const discussion = await this.prisma.discussion.findUnique({
            where: { id: input.discussionId },
        });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: discussion.courseId,
                },
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('You must be enrolled to reply');
        }
        if (input.parentId) {
            const parentReply = await this.prisma.discussionReply.findUnique({
                where: { id: input.parentId },
            });
            if (!parentReply || parentReply.discussionId !== input.discussionId) {
                throw new common_1.BadRequestException('Invalid parent reply');
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
    async updateDiscussion(userId, input) {
        const discussion = await this.prisma.discussion.findUnique({
            where: { id: input.id },
        });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        if (discussion.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own discussions');
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
    async deleteDiscussion(userId, id) {
        const discussion = await this.prisma.discussion.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        if (discussion.userId !== userId && discussion.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to delete this discussion');
        }
        await this.prisma.discussion.delete({ where: { id } });
        return { success: true };
    }
    async togglePin(userId, id) {
        const discussion = await this.prisma.discussion.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        if (discussion.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('Only instructor can pin discussions');
        }
        return this.prisma.discussion.update({
            where: { id },
            data: { isPinned: !discussion.isPinned },
        });
    }
};
exports.DiscussionsService = DiscussionsService;
exports.DiscussionsService = DiscussionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscussionsService);
//# sourceMappingURL=discussions.service.js.map