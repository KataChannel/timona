import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrokService } from '../grok/grok.service';
import { ChatbotStatus, TrainingStatus } from '@prisma/client';

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

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly grokService: GrokService,
  ) {}

  async createChatbot(userId: string, data: CreateChatbotDto): Promise<ChatbotResponse> {
    this.logger.debug(`Creating chatbot for userId: ${userId}`);
    
    if (!userId) {
      this.logger.error('UserId is undefined when creating chatbot');
      throw new BadRequestException('User ID is required');
    }

    const chatbot = await this.prisma.chatbotModel.create({
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt || this.getDefaultSystemPrompt(),
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 2048,
        status: ChatbotStatus.ACTIVE,
        userId,
      },
      include: {
        trainingData: true,
        conversations: true,
      },
    });
    return this.mapChatbotToResponse(chatbot);
  }

  async getUserChatbots(userId: string): Promise<ChatbotResponse[]> {
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

  async getChatbotById(userId: string, chatbotId: string): Promise<ChatbotResponse> {
    const chatbot = await this.prisma.chatbotModel.findFirst({
      where: { id: chatbotId, userId },
      include: {
        trainingData: true,
        conversations: true,
      },
    });
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }
    return this.mapChatbotToResponse(chatbot);
  }

  async updateChatbot(userId: string, chatbotId: string, data: Partial<CreateChatbotDto>): Promise<ChatbotResponse> {
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

  async deleteChatbot(userId: string, chatbotId: string): Promise<void> {
    await this.prisma.chatbotModel.delete({
      where: { id: chatbotId },
    });
  }

  async sendMessage(userId: string, chatbotId: string, data: SendMessageDto): Promise<ChatMessageResponse> {
    // Create or get conversation
    let conversation;
    if (data.conversationId) {
      conversation = await this.prisma.chatConversation.findFirst({
        where: { id: data.conversationId, userId, chatbotId },
      });
    } else {
      conversation = await this.prisma.chatConversation.create({
        data: {
          title: data.message.slice(0, 50),
          userId,
          chatbotId,
        },
      });
    }

    // Save user message
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        content: data.message,
        role: 'user',
        conversationId: conversation.id,
      },
    });

    // Generate AI response
    const response = await this.grokService.generateSummary(data.message, 2048);

    // Save AI response
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

  async getChatbotConversations(userId: string, chatbotId: string): Promise<ChatConversationResponse[]> {
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

  async getConversation(userId: string, conversationId: string): Promise<ChatConversationResponse> {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
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

  private getDefaultSystemPrompt(): string {
    return 'You are a helpful AI assistant.';
  }

  private mapChatbotToResponse(chatbot: any): ChatbotResponse {
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
}
