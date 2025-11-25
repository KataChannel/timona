import { OnModuleInit } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RbacSeederService implements OnModuleInit {
    private rbacService;
    private prisma;
    private readonly logger;
    constructor(rbacService: RbacService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seedDefaultRolesAndPermissions(): Promise<void>;
    private createDefaultPermissions;
    private createDefaultRoles;
    private seedDefaultAdminUser;
    private seedDefaultMenus;
}
