import { PrismaService } from '../../prisma/prisma.service';
import { Menu, MenuType, Prisma } from '@prisma/client';
import { MenuFilterDto } from '../dto';
export declare class MenuRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Menu | null>;
    findBySlug(slug: string): Promise<Menu | null>;
    findMany(where: Prisma.MenuWhereInput, options?: {
        skip?: number;
        take?: number;
        orderBy?: Prisma.MenuOrderByWithRelationInput;
        include?: Prisma.MenuInclude;
    }): Promise<Menu[]>;
    count(where: Prisma.MenuWhereInput): Promise<number>;
    create(data: Prisma.MenuCreateInput): Promise<Menu>;
    update(id: string, data: Prisma.MenuUpdateInput): Promise<Menu>;
    delete(id: string): Promise<Menu>;
    deleteMany(ids: string[]): Promise<number>;
    findByType(type: MenuType): Promise<Menu[]>;
    findChildren(parentId: string): Promise<Menu[]>;
    findRoots(type?: MenuType): Promise<Menu[]>;
    findRootsHierarchical(type?: MenuType, depth?: number): Promise<any[]>;
    updateMany(ids: string[], data: Prisma.MenuUpdateInput): Promise<number>;
    buildWhereClause(filter?: MenuFilterDto): Prisma.MenuWhereInput;
}
