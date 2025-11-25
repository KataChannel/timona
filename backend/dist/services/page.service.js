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
exports.PageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const page_model_1 = require("../graphql/models/page.model");
let PageService = class PageService {
    constructor(prisma) {
        this.prisma = prisma;
        this.RESERVED_SLUGS = [
            'bai-viet',
            'san-pham',
            'gio-hang',
            'thanh-toan',
            'tai-khoan',
            'dang-nhap',
            'dang-ky',
            'quen-mat-khau',
            'admin',
            'api',
            'auth',
            'graphql',
            '_next',
            'static',
            'public',
            'images',
            'assets'
        ];
    }
    convertBlocksToPrismaFormat(blocks) {
        return blocks.map((block, index) => {
            const { children, parentId, ...blockData } = block;
            const prismaBlock = {
                ...blockData,
                content: blockData.content || {},
                order: blockData.order ?? index,
                depth: blockData.depth ?? 0,
                config: blockData.config || null,
            };
            if (parentId) {
                prismaBlock.parent = { connect: { id: parentId } };
            }
            if (children && children.length > 0) {
                prismaBlock.children = {
                    create: this.convertBlocksToPrismaFormat(children)
                };
            }
            return prismaBlock;
        });
    }
    async create(input, userId) {
        if (this.RESERVED_SLUGS.includes(input.slug)) {
            throw new common_1.BadRequestException(`Slug "${input.slug}" đã được hệ thống sử dụng. Vui lòng chọn slug khác.`);
        }
        const existingPage = await this.prisma.page.findUnique({
            where: { slug: input.slug }
        });
        if (existingPage) {
            throw new common_1.ConflictException(`Page with slug "${input.slug}" already exists`);
        }
        const { blocks, ...pageData } = input;
        if (input.isHomepage === true) {
            await this.prisma.page.updateMany({
                where: { isHomepage: true },
                data: { isHomepage: false }
            });
        }
        const page = await this.prisma.page.create({
            data: {
                ...pageData,
                createdBy: userId,
                blocks: blocks && blocks.length > 0 ? {
                    create: this.convertBlocksToPrismaFormat(blocks)
                } : undefined
            },
            include: {
                blocks: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return page;
    }
    async findMany(pagination = { page: 1, limit: 10 }, filters) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { slug: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        if (filters?.title) {
            where.title = { contains: filters.title, mode: 'insensitive' };
        }
        if (filters?.slug) {
            where.slug = { contains: filters.slug, mode: 'insensitive' };
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.createdBy) {
            where.createdBy = filters.createdBy;
        }
        const [pages, total] = await Promise.all([
            this.prisma.page.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    blocks: {
                        where: { isVisible: true },
                        orderBy: { order: 'asc' }
                    }
                }
            }),
            this.prisma.page.count({ where })
        ]);
        return {
            items: pages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        };
    }
    async findById(id) {
        const page = await this.prisma.page.findUnique({
            where: { id },
            include: {
                blocks: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!page) {
            throw new common_1.NotFoundException(`Page with ID "${id}" not found`);
        }
        return page;
    }
    async findBySlug(slug) {
        const page = await this.prisma.page.findUnique({
            where: { slug },
            include: {
                blocks: {
                    where: { isVisible: true, parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            where: { isVisible: true },
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    where: { isVisible: true },
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: {
                                            where: { isVisible: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!page) {
            return null;
        }
        return page;
    }
    async update(id, input, userId) {
        const existingPage = await this.prisma.page.findUnique({
            where: { id },
            include: { blocks: true }
        });
        if (!existingPage) {
            throw new common_1.NotFoundException(`Page with ID "${id}" not found`);
        }
        if (input.slug && input.slug !== existingPage.slug) {
            if (this.RESERVED_SLUGS.includes(input.slug)) {
                throw new common_1.BadRequestException(`Slug "${input.slug}" đã được hệ thống sử dụng. Vui lòng chọn slug khác.`);
            }
            const slugExists = await this.prisma.page.findUnique({
                where: { slug: input.slug }
            });
            if (slugExists) {
                throw new common_1.ConflictException(`Page with slug "${input.slug}" already exists`);
            }
        }
        const { blocks, isHomepage, ...pageData } = input;
        let homepageUpdate = {};
        if (isHomepage !== undefined) {
            if (isHomepage === true) {
                await this.prisma.page.updateMany({
                    where: {
                        id: { not: id },
                        isHomepage: true
                    },
                    data: { isHomepage: false }
                });
                homepageUpdate = { isHomepage: true };
            }
            else {
                homepageUpdate = { isHomepage: false };
            }
        }
        let blocksUpdate = {};
        if (blocks) {
            blocksUpdate = {
                blocks: {
                    deleteMany: {},
                    create: blocks
                        .filter(block => !block.id)
                        .map((block, index) => ({
                        type: block.type,
                        content: block.content,
                        style: block.style,
                        order: block.order ?? index,
                        isVisible: block.isVisible ?? true
                    }))
                }
            };
            const existingBlocksUpdate = blocks
                .filter(block => block.id)
                .map(block => this.prisma.pageBlock.update({
                where: { id: block.id },
                data: {
                    type: block.type,
                    content: block.content,
                    style: block.style,
                    order: block.order,
                    isVisible: block.isVisible
                }
            }));
            await Promise.all(existingBlocksUpdate);
        }
        const updatedPage = await this.prisma.page.update({
            where: { id },
            data: {
                ...pageData,
                ...homepageUpdate,
                updatedBy: userId,
                publishedAt: input.status === 'PUBLISHED' && existingPage.status !== 'PUBLISHED'
                    ? new Date()
                    : existingPage.publishedAt,
                ...blocksUpdate
            },
            include: {
                blocks: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return updatedPage;
    }
    async delete(id) {
        const page = await this.prisma.page.findUnique({
            where: { id },
            include: { blocks: true }
        });
        if (!page) {
            throw new common_1.NotFoundException(`Page with ID "${id}" not found`);
        }
        const deletedPage = await this.prisma.page.delete({
            where: { id },
            include: { blocks: true }
        });
        return deletedPage;
    }
    async addBlock(pageId, input) {
        const page = await this.prisma.page.findUnique({
            where: { id: pageId },
            include: { blocks: { where: { parentId: null } } }
        });
        if (!page) {
            throw new common_1.NotFoundException(`Page with ID "${pageId}" not found`);
        }
        const { children, parentId, ...blockData } = input;
        let order = blockData.order;
        if (order === undefined || order === null) {
            if (parentId) {
                const parent = await this.prisma.pageBlock.findUnique({
                    where: { id: parentId },
                    include: { children: true }
                });
                order = parent?.children?.length ?? 0;
            }
            else {
                order = page.blocks?.length ?? 0;
            }
        }
        const createData = {
            ...blockData,
            order,
            content: blockData.content || {},
            page: { connect: { id: pageId } },
            depth: blockData.depth || 0,
            config: blockData.config || null,
        };
        if (parentId) {
            createData.parent = { connect: { id: parentId } };
        }
        try {
            const block = await this.prisma.pageBlock.create({
                data: createData
            });
            return block;
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('order')) {
                const latestPage = await this.prisma.page.findUnique({
                    where: { id: pageId },
                    include: { blocks: { where: { parentId: input.parentId || null }, orderBy: { order: 'desc' }, take: 1 } }
                });
                const latestOrder = latestPage?.blocks?.[0]?.order ?? -1;
                createData.order = latestOrder + 1;
                const block = await this.prisma.pageBlock.create({
                    data: createData
                });
                return block;
            }
            throw error;
        }
    }
    async updateBlock(id, input) {
        const existingBlock = await this.prisma.pageBlock.findUnique({
            where: { id }
        });
        if (!existingBlock) {
            throw new common_1.NotFoundException(`Block with ID "${id}" not found`);
        }
        const { parentId, ...updateData } = input;
        const prismaUpdateData = { ...updateData };
        if (parentId !== undefined) {
            if (parentId === null) {
                prismaUpdateData.parent = { disconnect: true };
            }
            else {
                prismaUpdateData.parent = { connect: { id: parentId } };
            }
        }
        const updatedBlock = await this.prisma.pageBlock.update({
            where: { id },
            data: prismaUpdateData
        });
        return updatedBlock;
    }
    async deleteBlock(id) {
        const block = await this.prisma.pageBlock.findUnique({
            where: { id }
        });
        if (!block) {
            throw new common_1.NotFoundException(`Block with ID "${id}" not found`);
        }
        const deletedBlock = await this.prisma.pageBlock.delete({
            where: { id }
        });
        return deletedBlock;
    }
    async updateBlocksOrder(pageId, updates) {
        const page = await this.prisma.page.findUnique({
            where: { id: pageId },
            include: { blocks: true }
        });
        if (!page) {
            throw new common_1.NotFoundException(`Page with ID "${pageId}" not found`);
        }
        const maxOrder = Math.max(...updates.map(u => u.order), 0);
        const updatedBlocks = await this.prisma.$transaction(updates.map((update, index) => this.prisma.pageBlock.update({
            where: { id: update.id },
            data: {
                order: -(maxOrder + index + 1)
            }
        })));
        const finalUpdates = await this.prisma.$transaction(updates.map(update => this.prisma.pageBlock.update({
            where: { id: update.id },
            data: { order: update.order }
        })));
        return finalUpdates;
    }
    async findPublished(pagination) {
        return this.findMany(pagination, { status: page_model_1.PageStatus.PUBLISHED });
    }
    async findHomepage() {
        const homepage = await this.prisma.page.findFirst({
            where: {
                isHomepage: true,
                status: page_model_1.PageStatus.PUBLISHED
            },
            include: {
                blocks: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return homepage;
    }
    async findBySlugPattern(slugPattern) {
        const page = await this.prisma.page.findFirst({
            where: {
                isDynamic: true,
                slug: slugPattern,
                status: page_model_1.PageStatus.PUBLISHED
            },
            include: {
                blocks: {
                    where: { isVisible: true, parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            where: { isVisible: true },
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    where: { isVisible: true },
                                    orderBy: { order: 'asc' },
                                    include: {
                                        children: {
                                            where: { isVisible: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return page;
    }
    async duplicate(id, userId, newTitle, newSlug) {
        const originalPage = await this.findById(id);
        const duplicatedPage = await this.create({
            title: newTitle || `${originalPage.title} (Copy)`,
            slug: newSlug || `${originalPage.slug}-copy-${Date.now()}`,
            description: originalPage.description,
            content: originalPage.content,
            status: page_model_1.PageStatus.DRAFT,
            seoTitle: originalPage.seoTitle,
            seoDescription: originalPage.seoDescription,
            ogImage: originalPage.ogImage,
            blocks: originalPage.blocks.map(block => ({
                type: block.type,
                content: block.content,
                style: block.style,
                order: block.order,
                isVisible: block.isVisible
            }))
        }, userId);
        return duplicatedPage;
    }
    getReservedSlugs() {
        return [...this.RESERVED_SLUGS];
    }
    isSlugReserved(slug) {
        return this.RESERVED_SLUGS.includes(slug);
    }
};
exports.PageService = PageService;
exports.PageService = PageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PageService);
//# sourceMappingURL=page.service.js.map