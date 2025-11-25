import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportMessageType, SupportSender } from '@prisma/client';
import { AIResponseService } from './ai-response.service';

@Injectable()
export class SupportMessageService {
  private readonly logger = new Logger(SupportMessageService.name);

  constructor(
    private prisma: PrismaService,
    private aiResponseService: AIResponseService,
  ) {}

  async createMessage(
    data: {
      conversationId: string;
      content: string;
      messageType?: SupportMessageType;
      senderType: SupportSender;
      senderId?: string;
      senderName?: string;
      isAIGenerated?: boolean;
      aiConfidence?: number;
      aiSuggestions?: any;
      metadata?: any;
    },
    options?: {
      autoAIResponse?: boolean; // Tự động tạo AI response
    },
  ) {
    const message = await this.prisma.supportMessage.create({
      data: {
        ...data,
        sentAt: new Date(),
      },
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
    });

    // Update conversation's last message info
    await this.prisma.supportConversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: data.content.substring(0, 100),
      },
    });

    // Tự động tạo AI response nếu message từ customer
    if (
      options?.autoAIResponse &&
      data.senderType === SupportSender.CUSTOMER &&
      !data.isAIGenerated
    ) {
      this.generateAIResponse(data.conversationId).catch(err => {
        this.logger.error(`Failed to generate AI response: ${err.message}`);
      });
    }

    return message;
  }

  /**
   * Tạo AI response tự động cho conversation
   */
  async generateAIResponse(conversationId: string): Promise<void> {
    try {
      // Lấy lịch sử conversation để build context
      const messages = await this.prisma.supportMessage.findMany({
        where: { conversationId },
        orderBy: { sentAt: 'asc' },
        take: 10, // Lấy 10 messages gần nhất
        select: {
          senderType: true,
          content: true,
          isAIGenerated: true,
        },
      });

      // Build conversation context cho AI
      const conversationContext = messages.map(msg => ({
        role: msg.senderType === SupportSender.CUSTOMER ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Gọi AI để generate response
      const { response, providerId } = await this.aiResponseService.generateResponse(
        conversationContext,
      );

      // Lưu AI response vào database
      await this.prisma.supportMessage.create({
        data: {
          conversationId,
          content: response,
          messageType: SupportMessageType.TEXT,
          senderType: SupportSender.BOT,
          senderName: 'AI Assistant',
          isAIGenerated: true,
          aiConfidence: 0.9, // TODO: Get from AI response
          metadata: {
            providerId,
            generatedAt: new Date().toISOString(),
          },
          sentAt: new Date(),
        },
      });

      this.logger.log(`AI response generated for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`Failed to generate AI response: ${error.message}`);
      throw error;
    }
  }

  async findByConversation(conversationId: string, params?: {
    skip?: number;
    take?: number;
  }) {
    return this.prisma.supportMessage.findMany({
      where: { conversationId },
      skip: params?.skip,
      take: params?.take || 50,
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
    });
  }

  async markAsRead(messageId: string) {
    return this.prisma.supportMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markConversationMessagesAsRead(conversationId: string, userId: string) {
    return this.prisma.supportMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderId: { not: userId },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async updateMessage(messageId: string, content: string) {
    return this.prisma.supportMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.supportMessage.delete({
      where: { id },
    });
  }

  async getUnreadCount(conversationId: string, userId: string) {
    return this.prisma.supportMessage.count({
      where: {
        conversationId,
        isRead: false,
        senderId: { not: userId },
      },
    });
  }
}
