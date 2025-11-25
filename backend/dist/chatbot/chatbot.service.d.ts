import { PrismaService } from '../prisma/prisma.service';
import { GrokService } from '../grok/grok.service';
import { ChatbotStatus } from '@prisma/client';
export interface CreateChatbotDto {
    name: string;
    description?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    trainingDataIds?: string[];
}
export interface ChatbotResponse {
    id: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    status: ChatbotStatus;
    temperature: number;
    maxTokens: number;
    trainingDataCount: number;
    conversationCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface SendMessageDto {
    message: string;
    conversationId?: string;
}
export interface ChatMessageResponse {
    id: string;
    content: string;
    role: string;
    timestamp: Date;
    conversationId: string;
}
export interface ChatConversationResponse {
    id: string;
    title: string;
    messages: ChatMessageResponse[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ChatbotService {
    private readonly prisma;
    private readonly grokService;
    private readonly logger;
    constructor(prisma: PrismaService, grokService: GrokService);
    createChatbot(userId: string, data: CreateChatbotDto): Promise<ChatbotResponse>;
    getUserChatbots(userId: string): Promise<ChatbotResponse[]>;
    getChatbotById(userId: string, chatbotId: string): Promise<ChatbotResponse>;
    updateChatbot(userId: string, chatbotId: string, data: Partial<CreateChatbotDto>): Promise<ChatbotResponse>;
    deleteChatbot(userId: string, chatbotId: string): Promise<void>;
    sendMessage(userId: string, chatbotId: string, data: SendMessageDto): Promise<ChatMessageResponse>;
    getChatbotConversations(userId: string, chatbotId: string): Promise<ChatConversationResponse[]>;
    getConversation(userId: string, conversationId: string): Promise<ChatConversationResponse>;
    private getDefaultSystemPrompt;
    private mapChatbotToResponse;
}
