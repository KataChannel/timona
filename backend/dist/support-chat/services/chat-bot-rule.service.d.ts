import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatBotRuleService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        priority: number;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        responseType: string;
        pattern: string | null;
        keywords: string[];
        platform: import("@prisma/client").$Enums.IntegrationPlatform[];
        successRate: number | null;
        responseContent: string;
        responseData: import("@prisma/client/runtime/library").JsonValue | null;
        useAI: boolean;
        aiPrompt: string | null;
        triggerCount: number;
    }[]>;
    matchRule(message: string, platform: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        priority: number;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        responseType: string;
        pattern: string | null;
        keywords: string[];
        platform: import("@prisma/client").$Enums.IntegrationPlatform[];
        successRate: number | null;
        responseContent: string;
        responseData: import("@prisma/client/runtime/library").JsonValue | null;
        useAI: boolean;
        aiPrompt: string | null;
        triggerCount: number;
    }>;
}
