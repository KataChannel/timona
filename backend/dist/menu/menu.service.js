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
var MenuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const menu_repository_1 = require("./repositories/menu.repository");
const dto_1 = require("./dto");
const menu_exceptions_1 = require("./exceptions/menu.exceptions");
let MenuService = MenuService_1 = class MenuService {
    constructor(menuRepository) {
        this.menuRepository = menuRepository;
        this.logger = new common_1.Logger(MenuService_1.name);
        this.MAX_DEPTH = 5;
        this.DEFAULT_PAGE_SIZE = 50;
    }
    cleanEmptyStrings(data) {
        const cleaned = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === '') {
                cleaned[key] = null;
            }
            else if (value !== undefined) {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
    async createMenu(dto, userId) {
        this.logger.log(`Creating menu: ${dto.slug}`);
        await this.validateSlugUniqueness(dto.slug);
        const { level, path } = await this.calculateHierarchy(dto.slug, dto.parentId);
        if (level > this.MAX_DEPTH) {
            throw new menu_exceptions_1.MenuMaxDepthExceededException(this.MAX_DEPTH);
        }
        const createData = {
            ...this.cleanEmptyStrings(dto),
            level,
            path,
            type: dto.type || client_1.MenuType.SIDEBAR,
            target: dto.target || 'SELF',
            order: dto.order ?? 0,
            requiredPermissions: dto.requiredPermissions || [],
            requiredRoles: dto.requiredRoles || [],
            isPublic: dto.isPublic ?? true,
            isActive: dto.isActive ?? true,
            isVisible: dto.isVisible ?? true,
            isProtected: false,
            createdBy: userId,
            parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
        };
        delete createData.parentId;
        const menu = await this.menuRepository.create(createData);
        this.logger.log(`Menu created successfully: ${menu.id}`);
        return dto_1.MenuResponseDto.fromEntity(menu);
    }
    async findById(id) {
        const menu = await this.menuRepository.findById(id);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(id);
        }
        return dto_1.MenuResponseDto.fromEntity(menu);
    }
    async findBySlug(slug) {
        const menu = await this.menuRepository.findBySlug(slug);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(slug);
        }
        return dto_1.MenuResponseDto.fromEntity(menu);
    }
    async findAll(filter, orderBy, pagination) {
        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || this.DEFAULT_PAGE_SIZE;
        const skip = (page - 1) * pageSize;
        const where = this.menuRepository.buildWhereClause(filter);
        const orderByClause = this.buildOrderByClause(orderBy);
        const [menus, total] = await Promise.all([
            this.menuRepository.findMany(where, {
                skip,
                take: pageSize,
                orderBy: orderByClause,
            }),
            this.menuRepository.count(where),
        ]);
        const totalPages = Math.ceil(total / pageSize);
        return {
            items: dto_1.MenuResponseDto.fromEntities(menus),
            total,
            page,
            pageSize,
            totalPages,
            hasMore: page < totalPages,
        };
    }
    async getMenuTree(type, parentId) {
        const roots = parentId
            ? await this.menuRepository.findChildren(parentId)
            : await this.menuRepository.findRoots(type);
        return dto_1.MenuResponseDto.fromEntities(roots);
    }
    async getMenusByType(type) {
        const menus = await this.menuRepository.findByType(type);
        return dto_1.MenuResponseDto.fromEntities(menus);
    }
    async getMenusByTypeHierarchical(type) {
        const menus = await this.menuRepository.findRootsHierarchical(type, 3);
        return dto_1.MenuHierarchicalDto.fromEntities(menus);
    }
    async getAccessibleMenus(userId, userRoles, userPermissions, type) {
        const where = {
            isActive: true,
            isVisible: true,
            ...(type && { type }),
            OR: [
                { isPublic: true },
                { requiredRoles: { hasSome: userRoles } },
                { requiredPermissions: { hasSome: userPermissions } },
            ],
        };
        const menus = await this.menuRepository.findMany(where, {
            orderBy: { order: 'asc' },
        });
        return dto_1.MenuResponseDto.fromEntities(menus);
    }
    async updateMenu(id, dto, userId) {
        this.logger.log(`Updating menu: ${id}`);
        const existingMenu = await this.menuRepository.findById(id);
        if (!existingMenu) {
            throw new menu_exceptions_1.MenuNotFoundException(id);
        }
        if (existingMenu.isProtected) {
            throw new menu_exceptions_1.MenuProtectedException(id);
        }
        if (dto.slug && dto.slug !== existingMenu.slug) {
            await this.validateSlugUniqueness(dto.slug);
        }
        let updateData = { ...this.cleanEmptyStrings(dto) };
        if (dto.parentId !== undefined && dto.parentId !== existingMenu.parentId) {
            if (dto.parentId) {
                await this.validateNoCircularReference(id, dto.parentId);
            }
            const { level, path } = await this.calculateHierarchy(dto.slug || existingMenu.slug, dto.parentId);
            if (level > this.MAX_DEPTH) {
                throw new menu_exceptions_1.MenuMaxDepthExceededException(this.MAX_DEPTH);
            }
            updateData.level = level;
            updateData.path = path;
            updateData.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
        }
        delete updateData.parentId;
        updateData.updatedBy = userId;
        const menu = await this.menuRepository.update(id, updateData);
        this.logger.log(`Menu updated successfully: ${menu.id}`);
        return dto_1.MenuResponseDto.fromEntity(menu);
    }
    async toggleActive(id) {
        const menu = await this.menuRepository.findById(id);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(id);
        }
        const updated = await this.menuRepository.update(id, {
            isActive: !menu.isActive,
        });
        return dto_1.MenuResponseDto.fromEntity(updated);
    }
    async toggleVisibility(id) {
        const menu = await this.menuRepository.findById(id);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(id);
        }
        const updated = await this.menuRepository.update(id, {
            isVisible: !menu.isVisible,
        });
        return dto_1.MenuResponseDto.fromEntity(updated);
    }
    async deleteMenu(id) {
        this.logger.log(`Deleting menu: ${id}`);
        const menu = await this.menuRepository.findById(id);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(id);
        }
        if (menu.isProtected) {
            throw new menu_exceptions_1.MenuProtectedException(id);
        }
        const children = await this.menuRepository.findChildren(id);
        if (children.length > 0) {
            throw new Error(`Cannot delete menu with ${children.length} children. Delete children first.`);
        }
        await this.menuRepository.delete(id);
        this.logger.log(`Menu deleted successfully: ${id}`);
    }
    async reorderMenus(ids) {
        const menus = await Promise.all(ids.map((id, index) => this.menuRepository.update(id, { order: index })));
        return dto_1.MenuResponseDto.fromEntities(menus);
    }
    async moveMenu(menuId, newParentId, newOrder) {
        const menu = await this.menuRepository.findById(menuId);
        if (!menu) {
            throw new menu_exceptions_1.MenuNotFoundException(menuId);
        }
        if (newParentId) {
            await this.validateNoCircularReference(menuId, newParentId);
        }
        const { level, path } = await this.calculateHierarchy(menu.slug, newParentId);
        if (level > this.MAX_DEPTH) {
            throw new menu_exceptions_1.MenuMaxDepthExceededException(this.MAX_DEPTH);
        }
        const updateData = {
            level,
            path,
            parent: newParentId ? { connect: { id: newParentId } } : { disconnect: true },
        };
        if (newOrder !== undefined) {
            updateData.order = newOrder;
        }
        const updated = await this.menuRepository.update(menuId, updateData);
        return dto_1.MenuResponseDto.fromEntity(updated);
    }
    async validateSlugUniqueness(slug) {
        const existing = await this.menuRepository.findBySlug(slug);
        if (existing) {
            throw new menu_exceptions_1.MenuAlreadyExistsException(slug);
        }
    }
    async calculateHierarchy(slug, parentId) {
        if (!parentId) {
            return { level: 0, path: `/${slug}` };
        }
        const parent = await this.menuRepository.findById(parentId);
        if (!parent) {
            throw new menu_exceptions_1.MenuInvalidParentException(parentId);
        }
        return {
            level: parent.level + 1,
            path: `${parent.path}/${slug}`,
        };
    }
    async validateNoCircularReference(menuId, newParentId) {
        let currentId = newParentId;
        const visited = new Set([menuId]);
        while (currentId) {
            if (visited.has(currentId)) {
                throw new menu_exceptions_1.MenuCircularReferenceException();
            }
            visited.add(currentId);
            const parent = await this.menuRepository.findById(currentId);
            currentId = parent?.parentId || null;
        }
    }
    buildOrderByClause(orderBy) {
        if (!orderBy || !orderBy.field) {
            return { order: 'asc' };
        }
        const direction = orderBy.direction || 'asc';
        const fieldMap = {
            TITLE: 'title',
            SLUG: 'slug',
            ORDER: 'order',
            CREATED_AT: 'createdAt',
            UPDATED_AT: 'updatedAt',
            TYPE: 'type',
        };
        const field = fieldMap[orderBy.field] || 'order';
        return { [field]: direction };
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = MenuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menu_repository_1.MenuRepository])
], MenuService);
//# sourceMappingURL=menu.service.js.map