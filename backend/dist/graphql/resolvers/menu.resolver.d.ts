import { MenuService } from '../../services/menu.service';
import { CreateMenuInput, UpdateMenuInput } from '../inputs/menu.input';
export declare class MenuResolver {
    private menuService;
    constructor(menuService: MenuService);
    getMenus(type?: string): Promise<any[]>;
    getMenu(id: string): Promise<any>;
    getMenuBySlug(slug: string): Promise<any>;
    createMenu(input: CreateMenuInput, context: any): Promise<any>;
    updateMenu(input: UpdateMenuInput, context: any): Promise<any>;
    deleteMenu(id: string): Promise<boolean>;
    reorderMenus(items: ReorderMenuInput[]): Promise<boolean>;
}
declare class ReorderMenuInput {
    id: string;
    order: number;
}
export {};
