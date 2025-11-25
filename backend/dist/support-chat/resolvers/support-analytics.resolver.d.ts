import { SupportAnalyticsService } from '../services/support-analytics.service';
export declare class SupportAnalyticsResolver {
    private analyticsService;
    constructor(analyticsService: SupportAnalyticsService);
    getSupportAnalytics(): Promise<{
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
}
