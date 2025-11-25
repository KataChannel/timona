import { AIProviderService } from './ai-provider.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderType } from '../dto/ai-provider.input';
import { AIProviderTestResult } from '../entities/ai-provider.entity';
export declare class AIResponseService {
    private aiProviderService;
    private prisma;
    private readonly logger;
    constructor(aiProviderService: AIProviderService, prisma: PrismaService);
    generateResponse(messages: Array<{
        role: string;
        content: string;
    }>, providerType?: AIProviderType): Promise<{
        response: string;
        providerId: string;
    }>;
    testProvider(providerId: string, testMessage?: string): Promise<AIProviderTestResult>;
    private callChatGPT;
    private callGrok;
    private callGemini;
}
