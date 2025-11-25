import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportConversationStatus } from '@prisma/client';

@Injectable()
export class SupportAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    // Get conversation counts
    const totalConversations = await this.prisma.supportConversation.count();
    const activeConversations = await this.prisma.supportConversation.count({
      where: { status: SupportConversationStatus.ACTIVE },
    });
    const waitingConversations = await this.prisma.supportConversation.count({
      where: { status: SupportConversationStatus.WAITING },
    });
    const closedConversations = await this.prisma.supportConversation.count({
      where: { status: SupportConversationStatus.CLOSED },
    });

    // Get message counts
    const totalMessages = await this.prisma.supportMessage.count();
    const aiGeneratedMessages = await this.prisma.supportMessage.count({
      where: { isAIGenerated: true },
    });

    // Platform breakdown
    const platformBreakdown = await this.prisma.supportConversation.groupBy({
      by: ['platform'],
      _count: { platform: true },
    });

    // Mock data for now
    return {
      totalConversations,
      activeConversations,
      waitingConversations,
      closedConversations,
      averageResponseTime: 45, // seconds
      averageResolutionTime: 600, // seconds (10 minutes)
      customerSatisfactionScore: 4.5,
      totalMessages,
      aiGeneratedMessages,
      platformBreakdown: platformBreakdown.map(p => ({
        platform: p.platform,
        count: p._count.platform,
      })),
      agentPerformance: [], // TODO: Implement agent performance tracking
    };
  }

  async getDailyStats(date: Date) {
    return this.prisma.supportAnalytics.findFirst({
      where: { date },
    });
  }

  async getAgentStats(agentId: string, startDate: Date, endDate: Date) {
    return this.prisma.supportAnalytics.findMany({
      where: {
        agentId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
  }
}
