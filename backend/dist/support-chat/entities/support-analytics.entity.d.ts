export declare class PlatformBreakdown {
    platform: string;
    count: number;
}
export declare class AgentPerformance {
    agentId: string;
    agentName: string;
    conversationsHandled: number;
    averageResponseTime: number;
    satisfactionScore: number;
}
export declare class SupportAnalytics {
    totalConversations: number;
    activeConversations: number;
    waitingConversations: number;
    closedConversations: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfactionScore: number;
    totalMessages: number;
    aiGeneratedMessages: number;
    platformBreakdown: PlatformBreakdown[];
    agentPerformance: AgentPerformance[];
}
