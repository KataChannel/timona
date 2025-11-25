import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportMessageService } from '../services/support-message.service';
import { SupportConversationService } from '../services/support-conversation.service';
import { AIAssistantService } from '../services/ai-assistant.service';
import { SupportSender } from '@prisma/client';
export declare class SupportChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private supportMessageService;
    private supportConversationService;
    private aiAssistantService;
    server: Server;
    private activeConnections;
    constructor(supportMessageService: SupportMessageService, supportConversationService: SupportConversationService, aiAssistantService: AIAssistantService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinConversation(data: {
        conversationId: string;
        userId?: string;
    }, client: Socket): Promise<{
        event: string;
        conversationId: string;
    }>;
    handleLeaveConversation(data: {
        conversationId: string;
    }, client: Socket): Promise<{
        event: string;
        conversationId: string;
    }>;
    handleSendMessage(data: {
        conversationId: string;
        content: string;
        senderId?: string;
        senderType: SupportSender;
        senderName?: string;
    }, client: Socket): Promise<{
        success: boolean;
        message: {
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
        };
    }>;
    handleTypingStart(data: {
        conversationId: string;
        userId: string;
    }, client: Socket): void;
    handleTypingStop(data: {
        conversationId: string;
        userId: string;
    }, client: Socket): void;
    handleMarkAsRead(data: {
        messageId: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyNewConversation(conversation: any): void;
    notifyConversationStatusChange(conversationId: string, status: string): void;
    notifyAgentAssignment(conversationId: string, agent: any): void;
}
