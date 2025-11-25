"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SupportAnalyticsService = class SupportAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAnalytics() {
        const totalConversations = await this.prisma.supportConversation.count();
        const activeConversations = await this.prisma.supportConversation.count({
            where: { status: client_1.SupportConversationStatus.ACTIVE },
        });
        const waitingConversations = await this.prisma.supportConversation.count({
            where: { status: client_1.SupportConversationStatus.WAITING },
        });
        const closedConversations = await this.prisma.supportConversation.count({
            where: { status: client_1.SupportConversationStatus.CLOSED },
        });
        const totalMessages = await this.prisma.supportMessage.count();
        const aiGeneratedMessages = await this.prisma.supportMessage.count({
            where: { isAIGenerated: true },
        });
        const platformBreakdown = await this.prisma.supportConversation.groupBy({
            by: ['platform'],
            _count: { platform: true },
        });
        return {
            totalConversations,
            activeConversations,
            waitingConversations,
            closedConversations,
            averageResponseTime: 45,
            averageResolutionTime: 600,
            customerSatisfactionScore: 4.5,
            totalMessages,
            aiGeneratedMessages,
            platformBreakdown: platformBreakdown.map(p => ({
                platform: p.platform,
                count: p._count.platform,
            })),
            agentPerformance: [],
        };
    }
    async getDailyStats(date) {
        return this.prisma.supportAnalytics.findFirst({
            where: { date },
        });
    }
    async getAgentStats(agentId, startDate, endDate) {
        return this.prisma.supportAnalytics.findMany({
            where: {
                agentId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'desc' },
        });
    }
};
exports.SupportAnalyticsService = SupportAnalyticsService;
exports.SupportAnalyticsService = SupportAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportAnalyticsService);
//# sourceMappingURL=support-analytics.service.js.map