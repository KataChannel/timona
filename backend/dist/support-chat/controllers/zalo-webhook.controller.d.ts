import { SupportConversationService } from '../services/support-conversation.service';
import { SupportMessageService } from '../services/support-message.service';
import { ChatIntegrationService } from '../services/chat-integration.service';
import { SupportChatGateway } from '../gateways/support-chat.gateway';
export declare class ZaloWebhookController {
    private conversationService;
    private messageService;
    private integrationService;
    private chatGateway;
    constructor(conversationService: SupportConversationService, messageService: SupportMessageService, integrationService: ChatIntegrationService, chatGateway: SupportChatGateway);
    verifyWebhook(query: any): Promise<{
        success: boolean;
    }>;
    handleWebhook(body: any, signature: string): Promise<{
        success: boolean;
    }>;
    private handleUserMessage;
    private handleUserImage;
    private handleUserFollow;
}
