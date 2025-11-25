import { PrismaService } from '../prisma/prisma.service';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getMenus(type?: string): Promise<any[]>;
    getMenuById(id: string): Promise<any>;
    getMenuBySlug(slug: string): Promise<any>;
    createMenu(input: any, userId?: string): Promise<any>;
    updateMenu(id: string, input: any, userId?: string): Promise<any>;
    deleteMenu(id: string): Promise<boolean>;
    reorderMenus(items: {
        id: string;
        order: number;
    }[]): Promise<boolean>;
    private buildMenuTree;
    private addFinalUrl;
}
