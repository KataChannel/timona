import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatQuickReplyService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        category: string | null;
        message: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        tags: string[];
        title: string;
        usageCount: number;
        shortcut: string;
        createdById: string | null;
    }[]>;
    create(data: any): Promise<{
        category: string | null;
        message: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        tags: string[];
        title: string;
        usageCount: number;
        shortcut: string;
        createdById: string | null;
    }>;
    incrementUsage(id: string): Promise<{
        category: string | null;
        message: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        tags: string[];
        title: string;
        usageCount: number;
        shortcut: string;
        createdById: string | null;
    }>;
}
