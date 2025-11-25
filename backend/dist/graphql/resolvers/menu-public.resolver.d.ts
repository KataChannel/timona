import { PrismaService } from '../../prisma/prisma.service';
export declare class MenuPublicResolver {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    publicMenus(type?: string, isActive?: boolean, isVisible?: boolean, orderBy?: any, skip?: number, take?: number, includeChildren?: boolean): Promise<any[]>;
    publicMenuById(id: string, includeChildren?: boolean): Promise<any | null>;
}
