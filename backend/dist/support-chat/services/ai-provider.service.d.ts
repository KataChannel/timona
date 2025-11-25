import { PrismaService } from '../../prisma/prisma.service';
import { CreateAIProviderInput, UpdateAIProviderInput, AIProviderType } from '../dto/ai-provider.input';
import { AIProvider, AIProviderStats } from '../entities/ai-provider.entity';
export declare class AIProviderService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createProvider(input: CreateAIProviderInput, userId?: string): Promise<AIProvider>;
    updateProvider(id: string, input: UpdateAIProviderInput): Promise<AIProvider>;
    deleteProvider(id: string): Promise<boolean>;
    getAllProviders(): Promise<AIProvider[]>;
    getProviderById(id: string): Promise<AIProvider>;
    getActiveProvider(providerType?: AIProviderType): Promise<AIProvider | null>;
    getDefaultProvider(providerType: AIProviderType): Promise<AIProvider | null>;
    updateStats(id: string, success: boolean, responseTime: number, error?: string): Promise<void>;
    getStats(): Promise<AIProviderStats>;
    private maskApiKey;
}
