import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, MenuFilterDto, MenuResponseDto, MenuPaginationResponseDto, MenuOrderDto, MenuHierarchicalDto } from './dto';
export declare class MenuResolver {
    private readonly menuService;
    private readonly logger;
    constructor(menuService: MenuService);
    getMenu(id: string): Promise<MenuResponseDto>;
    getMenuBySlug(slug: string): Promise<MenuResponseDto>;
    getMenus(filter?: MenuFilterDto, page?: number, limit?: number, orderByField?: string, direction?: 'asc' | 'desc'): Promise<MenuPaginationResponseDto>;
    getMenuTree(type?: string, parentId?: string): Promise<MenuResponseDto[]>;
    getSidebarMenus(): Promise<MenuResponseDto[]>;
    getHeaderMenus(): Promise<MenuHierarchicalDto[]>;
    getFooterMenus(): Promise<MenuHierarchicalDto[]>;
    getMobileMenus(): Promise<MenuHierarchicalDto[]>;
    getMyMenus(type?: string, ctx?: any): Promise<MenuResponseDto[]>;
    createMenu(input: CreateMenuDto, ctx?: any): Promise<MenuResponseDto>;
    updateMenu(id: string, input: UpdateMenuDto, ctx?: any): Promise<MenuResponseDto>;
    deleteMenu(id: string): Promise<boolean>;
    toggleMenuActive(id: string): Promise<MenuResponseDto>;
    toggleMenuVisibility(id: string): Promise<MenuResponseDto>;
    reorderMenus(menuOrders: MenuOrderDto[]): Promise<MenuResponseDto[]>;
    moveMenu(menuId: string, newParentId?: string, newOrder?: number): Promise<MenuResponseDto>;
}
