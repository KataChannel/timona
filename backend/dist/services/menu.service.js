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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuService = class MenuService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMenus(type) {
        const where = { isActive: true };
        if (type)
            where.type = type;
        const menus = await this.prisma.menu.findMany({
            where,
            orderBy: { order: 'asc' },
        });
        return this.buildMenuTree(menus);
    }
    async getMenuById(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                children: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with id ${id} not found`);
        }
        return this.addFinalUrl(menu);
    }
    async getMenuBySlug(slug) {
        const menu = await this.prisma.menu.findUnique({
            where: { slug },
            include: {
                children: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with slug ${slug} not found`);
        }
        return this.addFinalUrl(menu);
    }
    async createMenu(input, userId) {
        const existing = await this.prisma.menu.findUnique({
            where: { slug: input.slug },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Menu with slug "${input.slug}" already exists`);
        }
        let level = 0;
        let path = `/${input.slug}`;
        if (input.parentId) {
            const parent = await this.prisma.menu.findUnique({
                where: { id: input.parentId },
            });
            if (parent) {
                level = parent.level + 1;
                path = `${parent.path}/${input.slug}`;
            }
        }
        const data = {
            ...input,
            level,
            path,
            createdBy: userId,
        };
        const menu = await this.prisma.menu.create({ data });
        return this.addFinalUrl(menu);
    }
    async updateMenu(id, input, userId) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with id ${id} not found`);
        }
        if (menu.isProtected) {
            throw new common_1.BadRequestException('Cannot modify protected menu');
        }
        if (input.slug && input.slug !== menu.slug) {
            const existing = await this.prisma.menu.findUnique({
                where: { slug: input.slug },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Menu with slug "${input.slug}" already exists`);
            }
        }
        const data = {
            ...input,
            updatedBy: userId,
        };
        if (input.parentId !== undefined) {
            if (input.parentId) {
                const parent = await this.prisma.menu.findUnique({
                    where: { id: input.parentId },
                });
                if (parent) {
                    data.level = parent.level + 1;
                    data.path = `${parent.path}/${input.slug || menu.slug}`;
                }
            }
            else {
                data.level = 0;
                data.path = `/${input.slug || menu.slug}`;
            }
        }
        const updated = await this.prisma.menu.update({
            where: { id },
            data,
        });
        return this.addFinalUrl(updated);
    }
    async deleteMenu(id) {
        const menu = await this.prisma.menu.findUnique({ where: { id } });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with id ${id} not found`);
        }
        if (menu.isProtected) {
            throw new common_1.BadRequestException('Cannot delete protected menu');
        }
        await this.prisma.menu.delete({ where: { id } });
        return true;
    }
    async reorderMenus(items) {
        const updates = items.map(item => this.prisma.menu.update({
            where: { id: item.id },
            data: { order: item.order },
        }));
        await Promise.all(updates);
        return true;
    }
    buildMenuTree(menus, parentId = null) {
        const tree = menus
            .filter(menu => menu.parentId === parentId)
            .map(menu => ({
            ...this.addFinalUrl(menu),
            children: this.buildMenuTree(menus, menu.id),
        }));
        return tree;
    }
    addFinalUrl(menu) {
        let finalUrl = menu.url || menu.route || menu.externalUrl;
        if (menu.linkType) {
            switch (menu.linkType) {
                case 'PRODUCT_LIST':
                    finalUrl = '/san-pham';
                    if (menu.queryConditions) {
                        const params = new URLSearchParams(menu.queryConditions).toString();
                        finalUrl += `?${params}`;
                    }
                    break;
                case 'PRODUCT_DETAIL':
                    if (menu.productId) {
                        finalUrl = `/san-pham/${menu.productId}`;
                    }
                    break;
                case 'BLOG_LIST':
                    finalUrl = '/bai-viet';
                    if (menu.queryConditions) {
                        const params = new URLSearchParams(menu.queryConditions).toString();
                        finalUrl += `?${params}`;
                    }
                    break;
                case 'BLOG_DETAIL':
                    if (menu.blogPostId) {
                        finalUrl = `/bai-viet/${menu.blogPostId}`;
                    }
                    break;
                case 'PAGE':
                    if (menu.pageId) {
                        finalUrl = `/page/${menu.pageId}`;
                    }
                    break;
                case 'CATEGORY':
                    if (menu.categoryId) {
                        finalUrl = `/danh-muc/${menu.categoryId}`;
                    }
                    break;
                case 'BLOG_CATEGORY':
                    if (menu.blogCategoryId) {
                        finalUrl = `/bai-viet/danh-muc/${menu.blogCategoryId}`;
                    }
                    break;
            }
        }
        return { ...menu, finalUrl };
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map