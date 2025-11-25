import { ConfigService } from '@nestjs/config';
interface AIResponse {
    response: string;
    confidence: number;
    suggestions?: string[];
    intent?: string;
}
export declare class AIAssistantService {
    private configService;
    private apiKey;
    private apiEndpoint;
    constructor(configService: ConfigService);
    generateResponse(message: string, context?: {
        conversationHistory?: any[];
        customerInfo?: any;
        productContext?: any;
    }): Promise<AIResponse>;
    generateSuggestions(message: string, context?: any): Promise<string[]>;
    detectIntent(message: string): Promise<string>;
    analyzeCustomerSentiment(message: string): Promise<{
        sentiment: 'positive' | 'neutral' | 'negative';
        score: number;
    }>;
    suggestProducts(customerMessage: string, customerHistory?: any[]): Promise<any[]>;
    private buildSystemPrompt;
    private formatConversationHistory;
    private getFallbackResponse;
}
export {};
