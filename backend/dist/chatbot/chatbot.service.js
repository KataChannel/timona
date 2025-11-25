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
var ChatbotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const grok_service_1 = require("../grok/grok.service");
const client_1 = require("@prisma/client");
let ChatbotService = ChatbotService_1 = class ChatbotService {
    constructor(prisma, grokService) {
        this.prisma = prisma;
        this.grokService = grokService;
        this.logger = new common_1.Logger(ChatbotService_1.name);
    }
    async createChatbot(userId, data) {
        this.logger.debug(`Creating chatbot for userId: ${userId}`);
        if (!userId) {
            this.logger.error('UserId is undefined when creating chatbot');
            throw new common_1.BadRequestException('User ID is required');
        }
        const chatbot = await this.prisma.chatbotModel.create({
            data: {
                name: data.name,
                description: data.description,
                systemPrompt: data.systemPrompt || this.getDefaultSystemPrompt(),
                temperature: data.temperature ?? 0.7,
                maxTokens: data.maxTokens ?? 2048,
                status: client_1.ChatbotStatus.ACTIVE,
                userId,
            },
            include: {
                trainingData: true,
                conversations: true,
            },
        });
        return this.mapChatbotToResponse(chatbot);
    }
    async getUserChatbots(userId) {
        const chatbots = await this.prisma.chatbotModel.findMany({
            where: { userId },
            include: {
                trainingData: true,
                conversations: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return chatbots.map(this.mapChatbotToResponse);
    }
    async getChatbotById(userId, chatbotId) {
        const chatbot = await this.prisma.chatbotModel.findFirst({
            where: { id: chatbotId, userId },
            include: {
                trainingData: true,
                conversations: true,
            },
        });
        if (!chatbot) {
            throw new common_1.NotFoundException('Chatbot not found');
        }
        return this.mapChatbotToResponse(chatbot);
    }
    async updateChatbot(userId, chatbotId, data) {
        const chatbot = await this.prisma.chatbotModel.update({
            where: { id: chatbotId },
            data: {
                name: data.name,
                description: data.description,
                systemPrompt: data.systemPrompt,
                temperature: data.temperature,
                maxTokens: data.maxTokens,
            },
            include: {
                trainingData: true,
                conversations: true,
            },
        });
        return this.mapChatbotToResponse(chatbot);
    }
    async deleteChatbot(userId, chatbotId) {
        await this.prisma.chatbotModel.delete({
            where: { id: chatbotId },
        });
    }
    async sendMessage(userId, chatbotId, data) {
        let conversation;
        if (data.conversationId) {
            conversation = await this.prisma.chatConversation.findFirst({
                where: { id: data.conversationId, userId, chatbotId },
            });
        }
        else {
            conversation = await this.prisma.chatConversation.create({
                data: {
                    title: data.message.slice(0, 50),
                    userId,
                    chatbotId,
                },
            });
        }
        const userMessage = await this.prisma.chatMessage.create({
            data: {
                content: data.message,
                role: 'user',
                conversationId: conversation.id,
            },
        });
        const response = await this.grokService.generateSummary(data.message, 2048);
        const aiMessage = await this.prisma.chatMessage.create({
            data: {
                content: response,
                role: 'assistant',
                conversationId: conversation.id,
            },
        });
        return {
            id: aiMessage.id,
            content: aiMessage.content,
            role: aiMessage.role,
            timestamp: aiMessage.createdAt,
            conversationId: conversation.id,
        };
    }
    async getChatbotConversations(userId, chatbotId) {
        const conversations = await this.prisma.chatConversation.findMany({
            where: { userId, chatbotId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return conversations.map((conv) => ({
            id: conv.id,
            title: conv.title || 'Untitled',
            messages: conv.messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: msg.createdAt,
                conversationId: conv.id,
            })),
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
        }));
    }
    async getConversation(userId, conversationId) {
        const conversation = await this.prisma.chatConversation.findFirst({
            where: { id: conversationId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return {
            id: conversation.id,
            title: conversation.title || 'Untitled',
            messages: conversation.messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: msg.createdAt,
                conversationId: conversation.id,
            })),
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    getDefaultSystemPrompt() {
        return 'You are a helpful AI assistant.';
    }
    mapChatbotToResponse(chatbot) {
        return {
            id: chatbot.id,
            name: chatbot.name,
            description: chatbot.description,
            systemPrompt: chatbot.systemPrompt,
            status: chatbot.status,
            temperature: chatbot.temperature,
            maxTokens: chatbot.maxTokens,
            trainingDataCount: chatbot.trainingData?.length || 0,
            conversationCount: chatbot.conversations?.length || 0,
            createdAt: chatbot.createdAt,
            updatedAt: chatbot.updatedAt,
        };
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = ChatbotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        grok_service_1.GrokService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map