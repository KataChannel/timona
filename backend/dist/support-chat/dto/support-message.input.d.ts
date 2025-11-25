import { SupportSender, SupportMessageType } from '@prisma/client';
export declare class CreateSupportMessageInput {
    conversationId: string;
    content: string;
    senderType: SupportSender;
    senderName?: string;
    senderId?: string;
    messageType?: SupportMessageType;
    metadata?: any;
}
export declare class MarkMessagesAsReadInput {
    conversationId: string;
    userId: string;
}
