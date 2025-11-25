import { AIProviderService } from '../services/ai-provider.service';
import { AIResponseService } from '../services/ai-response.service';
import { CreateAIProviderInput, UpdateAIProviderInput, TestAIProviderInput, AIProviderType } from '../dto/ai-provider.input';
import { AIProvider, AIProviderTestResult, AIProviderStats } from '../entities/ai-provider.entity';
export declare class AIProviderResolver {
    private aiProviderService;
    private aiResponseService;
    constructor(aiProviderService: AIProviderService, aiResponseService: AIResponseService);
    getAIProviders(): Promise<AIProvider[]>;
    getAIProvider(id: string): Promise<AIProvider>;
    getActiveAIProvider(providerType?: AIProviderType): Promise<AIProvider | null>;
    getAIProviderStats(): Promise<AIProviderStats>;
    createAIProvider(input: CreateAIProviderInput, user: any): Promise<AIProvider>;
    updateAIProvider(id: string, input: UpdateAIProviderInput): Promise<AIProvider>;
    deleteAIProvider(id: string): Promise<boolean>;
    testAIProvider(input: TestAIProviderInput): Promise<AIProviderTestResult>;
    setDefaultAIProvider(id: string): Promise<AIProvider>;
    toggleAIProviderStatus(id: string, isActive: boolean): Promise<AIProvider>;
}
