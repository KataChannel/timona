import { PrismaService } from '../prisma/prisma.service';
export declare class ComprehensiveSeederService {
    private readonly prisma;
    private readonly logger;
    private adminUser;
    constructor(prisma: PrismaService);
    seedAll(): Promise<void>;
    private seedAdminUser;
    private seedRBAC;
    private seedContent;
    private seedTasks;
    private seedMenus;
    private seedPages;
    private seedAIData;
    private seedAffiliateSystem;
    private seedSecuritySettings;
    private seedNotifications;
    private getRandomPostTitle;
    private getRandomPostContent;
    private getRandomTaskTitle;
    private getRandomTaskDescription;
}
