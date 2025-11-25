import { MenuType } from '@prisma/client';
import { MenuRepository } from './repositories/menu.repository';
import { CreateMenuDto, UpdateMenuDto, MenuFilterDto, MenuResponseDto, MenuPaginationResponseDto, MenuHierarchicalDto } from './dto';
interface PaginationOptions {
    page?: number;
    pageSize?: number;
}
interface OrderByOptions {
    field?: string;
    direction?: 'asc' | 'desc';
}
export declare class MenuService {
    private readonly menuRepository;
    private readonly logger;
    private readonly MAX_DEPTH;
    private readonly DEFAULT_PAGE_SIZE;
    constructor(menuRepository: MenuRepository);
    private cleanEmptyStrings;
    createMenu(dto: CreateMenuDto, userId?: string): Promise<MenuResponseDto>;
    findById(id: string): Promise<MenuResponseDto>;
    findBySlug(slug: string): Promise<MenuResponseDto>;
    findAll(filter?: MenuFilterDto, orderBy?: OrderByOptions, pagination?: PaginationOptions): Promise<MenuPaginationResponseDto>;
    getMenuTree(type?: MenuType, parentId?: string): Promise<MenuResponseDto[]>;
    getMenusByType(type: MenuType): Promise<MenuResponseDto[]>;
    getMenusByTypeHierarchical(type: MenuType): Promise<MenuHierarchicalDto[]>;
    getAccessibleMenus(userId: string, userRoles: string[], userPermissions: string[], type?: MenuType): Promise<MenuResponseDto[]>;
    updateMenu(id: string, dto: UpdateMenuDto, userId?: string): Promise<MenuResponseDto>;
    toggleActive(id: string): Promise<MenuResponseDto>;
    toggleVisibility(id: string): Promise<MenuResponseDto>;
    deleteMenu(id: string): Promise<void>;
    reorderMenus(ids: string[]): Promise<MenuResponseDto[]>;
    moveMenu(menuId: string, newParentId?: string, newOrder?: number): Promise<MenuResponseDto>;
    private validateSlugUniqueness;
    private calculateHierarchy;
    private validateNoCircularReference;
    private buildOrderByClause;
}
export {};
