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
var MenuRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MenuRepository = MenuRepository_1 = class MenuRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MenuRepository_1.name);
    }
    async findById(id) {
        return this.prisma.menu.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                creator: true,
                updater: true,
            },
        });
    }
    async findBySlug(slug) {
        return this.prisma.menu.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async findMany(where, options) {
        return this.prisma.menu.findMany({
            where,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy,
            include: options?.include || {
                parent: true,
                children: true,
            },
        });
    }
    async count(where) {
        return this.prisma.menu.count({ where });
    }
    async create(data) {
        return this.prisma.menu.create({
            data,
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.menu.update({
            where: { id },
            data,
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.menu.delete({
            where: { id },
        });
    }
    async deleteMany(ids) {
        const result = await this.prisma.menu.deleteMany({
            where: { id: { in: ids } },
        });
        return result.count;
    }
    async findByType(type) {
        return this.findMany({ type, isActive: true, isVisible: true }, { orderBy: { order: 'asc' } });
    }
    async findChildren(parentId) {
        return this.findMany({ parentId }, { orderBy: { order: 'asc' } });
    }
    async findRoots(type) {
        const where = {
            parentId: null,
            isActive: true,
            isVisible: true,
        };
        if (type)
            where.type = type;
        return this.findMany(where, { orderBy: { order: 'asc' } });
    }
    async findRootsHierarchical(type, depth = 3) {
        const where = {
            parentId: null,
            isActive: true,
            isVisible: true,
        };
        if (type)
            where.type = type;
        const menus = await this.prisma.menu.findMany({
            where,
            orderBy: { order: 'asc' },
        });
        const loadChildren = async (menuId, currentDepth) => {
            if (currentDepth <= 0)
                return null;
            const children = await this.prisma.menu.findMany({
                where: { parentId: menuId, isActive: true, isVisible: true },
                orderBy: { order: 'asc' },
            });
            if (children.length === 0)
                return undefined;
            return Promise.all(children.map(async (child) => ({
                ...child,
                children: await loadChildren(child.id, currentDepth - 1),
            })));
        };
        return Promise.all(menus.map(async (menu) => ({
            ...menu,
            children: await loadChildren(menu.id, depth - 1),
        })));
    }
    async updateMany(ids, data) {
        const result = await this.prisma.menu.updateMany({
            where: { id: { in: ids } },
            data,
        });
        return result.count;
    }
    buildWhereClause(filter) {
        const where = {};
        if (!filter)
            return where;
        if (filter.type)
            where.type = filter.type;
        if (filter.parentId !== undefined)
            where.parentId = filter.parentId;
        if (filter.isActive !== undefined)
            where.isActive = filter.isActive;
        if (filter.isVisible !== undefined)
            where.isVisible = filter.isVisible;
        if (filter.isPublic !== undefined)
            where.isPublic = filter.isPublic;
        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { slug: { contains: filter.search, mode: 'insensitive' } },
                { description: { contains: filter.search, mode: 'insensitive' } },
            ];
        }
        return where;
    }
};
exports.MenuRepository = MenuRepository;
exports.MenuRepository = MenuRepository = MenuRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuRepository);
//# sourceMappingURL=menu.repository.js.map