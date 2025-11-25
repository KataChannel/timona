import { PrismaService } from '../../prisma/prisma.service';
import { SupportMessageType, SupportSender } from '@prisma/client';
import { AIResponseService } from './ai-response.service';
export declare class SupportMessageService {
    private prisma;
    private aiResponseService;
    private readonly logger;
    constructor(prisma: PrismaService, aiResponseService: AIResponseService);
    createMessage(data: {
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
    }, options?: {
        autoAIResponse?: boolean;
    }): Promise<{
        attachments: {
            id: string;
            createdAt: Date;
            fileName: string;
            fileSize: number;
            conversationId: string | null;
            fileType: string;
            thumbnailUrl: string | null;
            fileUrl: string;
            messageId: string | null;
            uploadedById: string | null;
        }[];
        sender: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        content: string;
        isRead: boolean;
        conversationId: string;
        readAt: Date | null;
        sentAt: Date;
        messageType: import("@prisma/client").$Enums.SupportMessageType;
        senderType: import("@prisma/client").$Enums.SupportSender;
        senderId: string | null;
        senderName: string | null;
        isAIGenerated: boolean;
        aiConfidence: number | null;
        aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    generateAIResponse(conversationId: string): Promise<void>;
    findByConversation(conversationId: string, params?: {
        skip?: number;
        take?: number;
    }): Promise<({
        attachments: {
            id: string;
            createdAt: Date;
            fileName: string;
            fileSize: number;
            conversationId: string | null;
            fileType: string;
            thumbnailUrl: string | null;
            fileUrl: string;
            messageId: string | null;
            uploadedById: string | null;
        }[];
        sender: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        content: string;
        isRead: boolean;
        conversationId: string;
        readAt: Date | null;
        sentAt: Date;
        messageType: import("@prisma/client").$Enums.SupportMessageType;
        senderType: import("@prisma/client").$Enums.SupportSender;
        senderId: string | null;
        senderName: string | null;
        isAIGenerated: boolean;
        aiConfidence: number | null;
        aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
        isEdited: boolean;
        editedAt: Date | null;
    })[]>;
    markAsRead(messageId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        content: string;
        isRead: boolean;
        conversationId: string;
        readAt: Date | null;
        sentAt: Date;
        messageType: import("@prisma/client").$Enums.SupportMessageType;
        senderType: import("@prisma/client").$Enums.SupportSender;
        senderId: string | null;
        senderName: string | null;
        isAIGenerated: boolean;
        aiConfidence: number | null;
        aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    markConversationMessagesAsRead(conversationId: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateMessage(messageId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        content: string;
        isRead: boolean;
        conversationId: string;
        readAt: Date | null;
        sentAt: Date;
        messageType: import("@prisma/client").$Enums.SupportMessageType;
        senderType: import("@prisma/client").$Enums.SupportSender;
        senderId: string | null;
        senderName: string | null;
        isAIGenerated: boolean;
        aiConfidence: number | null;
        aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        content: string;
        isRead: boolean;
        conversationId: string;
        readAt: Date | null;
        sentAt: Date;
        messageType: import("@prisma/client").$Enums.SupportMessageType;
        senderType: import("@prisma/client").$Enums.SupportSender;
        senderId: string | null;
        senderName: string | null;
        isAIGenerated: boolean;
        aiConfidence: number | null;
        aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    getUnreadCount(conversationId: string, userId: string): Promise<number>;
}
