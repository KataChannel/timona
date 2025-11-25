import { ChatbotService } from './chatbot.service';
import type { CreateChatbotDto, SendMessageDto } from './chatbot.service';
export declare class ChatbotController {
    private readonly chatbotService;
    private readonly logger;
    constructor(chatbotService: ChatbotService);
    createChatbot(req: any, createChatbotDto: CreateChatbotDto): Promise<import("./chatbot.service").ChatbotResponse>;
    getUserChatbots(req: any): Promise<import("./chatbot.service").ChatbotResponse[]>;
    getChatbotById(req: any, id: string): Promise<import("./chatbot.service").ChatbotResponse>;
    updateChatbot(req: any, id: string, updateChatbotDto: Partial<CreateChatbotDto>): Promise<import("./chatbot.service").ChatbotResponse>;
    deleteChatbot(req: any, id: string): Promise<{
        message: string;
    }>;
    sendMessage(req: any, id: string, sendMessageDto: SendMessageDto): Promise<import("./chatbot.service").ChatMessageResponse>;
    getChatbotConversations(req: any, id: string): Promise<import("./chatbot.service").ChatConversationResponse[]>;
    getConversation(req: any, id: string): Promise<import("./chatbot.service").ChatConversationResponse>;
}
