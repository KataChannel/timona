import { Injectable, Logger } from '@nestjs/common';
import { MenuType } from '@prisma/client';
import { MenuRepository } from './repositories/menu.repository';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MenuFilterDto,
  MenuResponseDto,
  MenuPaginationResponseDto,
  MenuHierarchicalDto,
} from './dto';
import {
  MenuNotFoundException,
  MenuAlreadyExistsException,
  MenuProtectedException,
  MenuInvalidParentException,
  MenuMaxDepthExceededException,
  MenuCircularReferenceException,
} from './exceptions/menu.exceptions';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

interface OrderByOptions {
  field?: string;
  direction?: 'asc' | 'desc';
}

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);
  private readonly MAX_DEPTH = 5;
  private readonly DEFAULT_PAGE_SIZE = 50;

  constructor(private readonly menuRepository: MenuRepository) {}

  /**
   * Clean empty strings from update data to avoid Prisma enum validation errors
   */
  private cleanEmptyStrings(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === '') {
        cleaned[key] = null;
      } else if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  // =====================================================
  // CREATE
  // =====================================================

  async createMenu(dto: CreateMenuDto, userId?: string): Promise<MenuResponseDto> {
    this.logger.log(`Creating menu: ${dto.slug}`);

    // Validate slug uniqueness
    await this.validateSlugUniqueness(dto.slug);

    // Validate and calculate hierarchy
    const { level, path } = await this.calculateHierarchy(dto.slug, dto.parentId);

    // Validate max depth
    if (level > this.MAX_DEPTH) {
      throw new MenuMaxDepthExceededException(this.MAX_DEPTH);
    }

    // Prepare create data
    const createData = {
      ...this.cleanEmptyStrings(dto),
      level,
      path,
      type: dto.type || MenuType.SIDEBAR,
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

    // Remove parentId from createData to avoid Prisma error (use parent relation instead)
    delete createData.parentId;

    const menu = await this.menuRepository.create(createData);
    this.logger.log(`Menu created successfully: ${menu.id}`);

    return MenuResponseDto.fromEntity(menu);
  }

  // =====================================================
  // READ
  // =====================================================

  async findById(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new MenuNotFoundException(id);
    }
    return MenuResponseDto.fromEntity(menu);
  }

  async findBySlug(slug: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findBySlug(slug);
    if (!menu) {
      throw new MenuNotFoundException(slug);
    }
    return MenuResponseDto.fromEntity(menu);
  }

  async findAll(
    filter?: MenuFilterDto,
    orderBy?: OrderByOptions,
    pagination?: PaginationOptions,
  ): Promise<MenuPaginationResponseDto> {
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
      items: MenuResponseDto.fromEntities(menus),
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async getMenuTree(type?: MenuType, parentId?: string): Promise<MenuResponseDto[]> {
    const roots = parentId
      ? await this.menuRepository.findChildren(parentId)
      : await this.menuRepository.findRoots(type);

    return MenuResponseDto.fromEntities(roots);
  }

  async getMenusByType(type: MenuType): Promise<MenuResponseDto[]> {
    const menus = await this.menuRepository.findByType(type);
    return MenuResponseDto.fromEntities(menus);
  }

  async getMenusByTypeHierarchical(type: MenuType): Promise<MenuHierarchicalDto[]> {
    const menus = await this.menuRepository.findRootsHierarchical(type, 3);
    return MenuHierarchicalDto.fromEntities(menus);
  }

  async getAccessibleMenus(
    userId: string,
    userRoles: string[],
    userPermissions: string[],
    type?: MenuType,
  ): Promise<MenuResponseDto[]> {
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

    return MenuResponseDto.fromEntities(menus);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async updateMenu(id: string, dto: UpdateMenuDto, userId?: string): Promise<MenuResponseDto> {
    this.logger.log(`Updating menu: ${id}`);

    const existingMenu = await this.menuRepository.findById(id);
    if (!existingMenu) {
      throw new MenuNotFoundException(id);
    }

    if (existingMenu.isProtected) {
      throw new MenuProtectedException(id);
    }

    // Validate slug uniqueness if changed
    if (dto.slug && dto.slug !== existingMenu.slug) {
      await this.validateSlugUniqueness(dto.slug);
    }

    // Recalculate hierarchy if parent changed
    let updateData: any = { ...this.cleanEmptyStrings(dto) };

    if (dto.parentId !== undefined && dto.parentId !== existingMenu.parentId) {
      // Prevent circular reference
      if (dto.parentId) {
        await this.validateNoCircularReference(id, dto.parentId);
      }

      const { level, path } = await this.calculateHierarchy(
        dto.slug || existingMenu.slug,
        dto.parentId,
      );

      if (level > this.MAX_DEPTH) {
        throw new MenuMaxDepthExceededException(this.MAX_DEPTH);
      }

      updateData.level = level;
      updateData.path = path;
      updateData.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
    }

    // Remove parentId from updateData to avoid Prisma error (use parent relation instead)
    delete updateData.parentId;
    
    updateData.updatedBy = userId;

    const menu = await this.menuRepository.update(id, updateData);
    this.logger.log(`Menu updated successfully: ${menu.id}`);

    return MenuResponseDto.fromEntity(menu);
  }

  async toggleActive(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new MenuNotFoundException(id);
    }

    const updated = await this.menuRepository.update(id, {
      isActive: !menu.isActive,
    });

    return MenuResponseDto.fromEntity(updated);
  }

  async toggleVisibility(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new MenuNotFoundException(id);
    }

    const updated = await this.menuRepository.update(id, {
      isVisible: !menu.isVisible,
    });

    return MenuResponseDto.fromEntity(updated);
  }

  // =====================================================
  // DELETE
  // =====================================================

  async deleteMenu(id: string): Promise<void> {
    this.logger.log(`Deleting menu: ${id}`);

    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new MenuNotFoundException(id);
    }

    if (menu.isProtected) {
      throw new MenuProtectedException(id);
    }

    // Check for children
    const children = await this.menuRepository.findChildren(id);
    if (children.length > 0) {
      throw new Error(`Cannot delete menu with ${children.length} children. Delete children first.`);
    }

    await this.menuRepository.delete(id);
    this.logger.log(`Menu deleted successfully: ${id}`);
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  async reorderMenus(ids: string[]): Promise<MenuResponseDto[]> {
    const menus = await Promise.all(
      ids.map((id, index) =>
        this.menuRepository.update(id, { order: index }),
      ),
    );

    return MenuResponseDto.fromEntities(menus);
  }

  async moveMenu(
    menuId: string,
    newParentId?: string,
    newOrder?: number,
  ): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(menuId);
    if (!menu) {
      throw new MenuNotFoundException(menuId);
    }

    // Prevent circular reference
    if (newParentId) {
      await this.validateNoCircularReference(menuId, newParentId);
    }

    const { level, path } = await this.calculateHierarchy(menu.slug, newParentId);

    if (level > this.MAX_DEPTH) {
      throw new MenuMaxDepthExceededException(this.MAX_DEPTH);
    }

    const updateData: any = {
      level,
      path,
      parent: newParentId ? { connect: { id: newParentId } } : { disconnect: true },
    };

    if (newOrder !== undefined) {
      updateData.order = newOrder;
    }

    const updated = await this.menuRepository.update(menuId, updateData);
    return MenuResponseDto.fromEntity(updated);
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  private async validateSlugUniqueness(slug: string): Promise<void> {
    const existing = await this.menuRepository.findBySlug(slug);
    if (existing) {
      throw new MenuAlreadyExistsException(slug);
    }
  }

  private async calculateHierarchy(
    slug: string,
    parentId?: string,
  ): Promise<{ level: number; path: string }> {
    if (!parentId) {
      return { level: 0, path: `/${slug}` };
    }

    const parent = await this.menuRepository.findById(parentId);
    if (!parent) {
      throw new MenuInvalidParentException(parentId);
    }

    return {
      level: parent.level + 1,
      path: `${parent.path}/${slug}`,
    };
  }

  private async validateNoCircularReference(menuId: string, newParentId: string): Promise<void> {
    let currentId: string | null = newParentId;
    const visited = new Set<string>([menuId]);

    while (currentId) {
      if (visited.has(currentId)) {
        throw new MenuCircularReferenceException();
      }

      visited.add(currentId);
      const parent = await this.menuRepository.findById(currentId);
      currentId = parent?.parentId || null;
    }
  }

  private buildOrderByClause(orderBy?: OrderByOptions): any {
    if (!orderBy || !orderBy.field) {
      return { order: 'asc' };
    }

    const direction = orderBy.direction || 'asc';
    const fieldMap: Record<string, string> = {
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
}
