import { SupportConversationStatus, IntegrationPlatform, TicketPriority } from '@prisma/client';
import { User } from '../../graphql/models/user.model';
export declare class SupportMessage {
    id: string;
    conversationId: string;
    content: string;
    senderType: string;
    senderName?: string;
    isAIGenerated: boolean;
    aiConfidence?: number;
    isRead: boolean;
    sentAt: Date;
    createdAt: Date;
    sender?: User;
}
export declare class SupportConversation {
    id: string;
    conversationCode: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerIp?: string;
    customerLocation?: string;
    assignedAgentId?: string;
    assignedAt?: Date;
    status: SupportConversationStatus;
    priority: TicketPriority;
    platform: IntegrationPlatform;
    platformUserId?: string;
    platformUserName?: string;
    subject?: string;
    tags: string[];
    notes?: string;
    lastMessageAt?: Date;
    lastMessagePreview?: string;
    rating?: number;
    feedback?: string;
    startedAt: Date;
    closedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    customer?: User;
    assignedAgent?: User;
    messages?: SupportMessage[];
}
