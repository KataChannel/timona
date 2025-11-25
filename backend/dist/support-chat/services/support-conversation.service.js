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
exports.SupportConversationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SupportConversationService = class SupportConversationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConversation(data) {
        return this.prisma.supportConversation.create({
            data: {
                ...data,
                status: client_1.SupportConversationStatus.WAITING,
                startedAt: new Date(),
            },
            include: {
                customer: true,
                assignedAgent: true,
            },
        });
    }
    async findAll(params) {
        const { skip, take, where, orderBy } = params || {};
        return this.prisma.supportConversation.findMany({
            skip,
            take: take || 20,
            where,
            orderBy: orderBy || { createdAt: 'desc' },
            include: {
                customer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                assignedAgent: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { sentAt: 'desc' },
                },
            },
        });
    }
    async findOne(id) {
        const conversation = await this.prisma.supportConversation.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                assignedAgent: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: { sentAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                        attachments: true,
                    },
                },
                tickets: true,
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
    async assignToAgent(conversationId, agentId) {
        if (agentId && agentId !== 'unassigned') {
            const agentExists = await this.prisma.user.findUnique({
                where: { id: agentId },
            });
            if (!agentExists) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
        }
        return this.prisma.supportConversation.update({
            where: { id: conversationId },
            data: {
                assignedAgentId: agentId === 'unassigned' ? null : agentId,
                assignedAt: agentId === 'unassigned' ? null : new Date(),
                status: agentId === 'unassigned'
                    ? client_1.SupportConversationStatus.WAITING
                    : client_1.SupportConversationStatus.ASSIGNED,
            },
            include: {
                customer: true,
                assignedAgent: true,
            },
        });
    }
    async updateStatus(conversationId, status) {
        const updateData = { status };
        if (status === client_1.SupportConversationStatus.CLOSED ||
            status === client_1.SupportConversationStatus.RESOLVED) {
            updateData.closedAt = new Date();
        }
        return this.prisma.supportConversation.update({
            where: { id: conversationId },
            data: updateData,
            include: {
                customer: true,
                assignedAgent: true,
            },
        });
    }
    async updatePriority(conversationId, priority) {
        return this.prisma.supportConversation.update({
            where: { id: conversationId },
            data: { priority },
        });
    }
    async addRating(conversationId, rating, feedback) {
        return this.prisma.supportConversation.update({
            where: { id: conversationId },
            data: { rating, feedback },
        });
    }
    async getActiveConversations(agentId) {
        const where = {
            status: {
                in: [
                    client_1.SupportConversationStatus.ACTIVE,
                    client_1.SupportConversationStatus.WAITING,
                    client_1.SupportConversationStatus.ASSIGNED,
                ],
            },
        };
        if (agentId) {
            where.assignedAgentId = agentId;
        }
        return this.findAll({ where });
    }
    async getConversationByCode(conversationCode) {
        return this.prisma.supportConversation.findUnique({
            where: { conversationCode },
            include: {
                customer: true,
                assignedAgent: true,
                messages: {
                    orderBy: { sentAt: 'asc' },
                    include: {
                        sender: true,
                        attachments: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        return this.prisma.supportConversation.delete({
            where: { id },
        });
    }
};
exports.SupportConversationService = SupportConversationService;
exports.SupportConversationService = SupportConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportConversationService);
//# sourceMappingURL=support-conversation.service.js.map