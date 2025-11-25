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
exports.SystemGuideService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SystemGuideService = class SystemGuideService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const slug = this.generateSlug(data.title);
        return this.prisma.systemGuide.create({
            data: {
                title: data.title,
                slug,
                type: data.type,
                description: data.description,
                content: data.content,
                orderIndex: data.order || 0,
                parentId: data.parentId,
                isPublished: data.isPublished || false,
                authorId: data.authorId,
            },
            include: {
                author: true,
                parent: true,
                children: true,
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.parentId !== undefined) {
            where.parentId = filters.parentId;
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.isPublished !== undefined) {
            where.isPublished = filters.isPublished;
        }
        return this.prisma.systemGuide.findMany({
            where,
            include: {
                author: true,
                parent: true,
                children: {
                    where: { isPublished: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
            orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id) {
        const guide = await this.prisma.systemGuide.findUnique({
            where: { id },
            include: {
                author: true,
                parent: true,
                children: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!guide) {
            throw new common_1.NotFoundException(`System guide with ID ${id} not found`);
        }
        return guide;
    }
    async findBySlug(slug) {
        const guide = await this.prisma.systemGuide.findUnique({
            where: { slug },
            include: {
                author: true,
                parent: true,
                children: {
                    where: { isPublished: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!guide) {
            throw new common_1.NotFoundException(`System guide with slug ${slug} not found`);
        }
        await this.incrementViewCount(guide.id);
        return guide;
    }
    async update(data) {
        const guide = await this.findOne(data.id);
        const updateData = {};
        if (data.title) {
            updateData.title = data.title;
            updateData.slug = this.generateSlug(data.title);
        }
        if (data.type)
            updateData.type = data.type;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.content !== undefined)
            updateData.content = data.content;
        if (data.order !== undefined)
            updateData.orderIndex = data.order;
        if (data.parentId !== undefined)
            updateData.parentId = data.parentId;
        if (data.isPublished !== undefined)
            updateData.isPublished = data.isPublished;
        return this.prisma.systemGuide.update({
            where: { id: data.id },
            data: updateData,
            include: {
                author: true,
                parent: true,
                children: true,
            },
        });
    }
    async delete(id) {
        const guide = await this.findOne(id);
        const childrenCount = await this.prisma.systemGuide.count({
            where: { parentId: id },
        });
        if (childrenCount > 0) {
            throw new Error('Cannot delete guide with children. Delete children first.');
        }
        await this.prisma.systemGuide.delete({
            where: { id },
        });
        return true;
    }
    async incrementViewCount(id) {
        return this.prisma.systemGuide.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
    }
    async voteHelpful(id, isHelpful) {
        const guide = await this.findOne(id);
        return this.prisma.systemGuide.update({
            where: { id },
            data: {
                helpfulCount: isHelpful
                    ? { increment: 1 }
                    : guide.helpfulCount,
                notHelpfulCount: !isHelpful
                    ? { increment: 1 }
                    : guide.notHelpfulCount,
            },
        });
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
};
exports.SystemGuideService = SystemGuideService;
exports.SystemGuideService = SystemGuideService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemGuideService);
//# sourceMappingURL=system-guide.service.js.map