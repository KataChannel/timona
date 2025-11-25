import { PrismaService } from '../../prisma/prisma.service';
export declare class SupportAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAnalytics(): Promise<{
        totalConversations: number;
        activeConversations: number;
        waitingConversations: number;
        closedConversations: number;
        averageResponseTime: number;
        averageResolutionTime: number;
        customerSatisfactionScore: number;
        totalMessages: number;
        aiGeneratedMessages: number;
        platformBreakdown: {
            platform: import("@prisma/client").$Enums.IntegrationPlatform;
            count: number;
        }[];
        agentPerformance: any[];
    }>;
    getDailyStats(date: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        avgRating: number | null;
        avgResponseTime: number | null;
        date: Date;
        totalConversations: number;
        activeConversations: number;
        closedConversations: number;
        totalMessages: number;
        customerMessages: number;
        agentMessages: number;
        botMessages: number;
        avgResolutionTime: number | null;
        firstResponseTime: number | null;
        platformStats: import("@prisma/client/runtime/library").JsonValue | null;
        agentId: string | null;
        totalRatings: number;
    }>;
    getAgentStats(agentId: string, startDate: Date, endDate: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        avgRating: number | null;
        avgResponseTime: number | null;
        date: Date;
        totalConversations: number;
        activeConversations: number;
        closedConversations: number;
        totalMessages: number;
        customerMessages: number;
        agentMessages: number;
        botMessages: number;
        avgResolutionTime: number | null;
        firstResponseTime: number | null;
        platformStats: import("@prisma/client/runtime/library").JsonValue | null;
        agentId: string | null;
        totalRatings: number;
    }[]>;
}
