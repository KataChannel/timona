import { SupportMessageService } from '../services/support-message.service';
import { CreateSupportMessageInput } from '../dto/support-message.input';
export declare class SupportMessageResolver {
    private messageService;
    constructor(messageService: SupportMessageService);
    supportMessages(conversationId: string): Promise<({
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
    sendSupportMessage(input: CreateSupportMessageInput): Promise<{
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
    markMessagesAsRead(conversationId: string, userId: string): Promise<number>;
}
