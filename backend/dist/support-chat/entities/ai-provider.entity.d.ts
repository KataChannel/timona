import { AIProviderType } from '../dto/ai-provider.input';
import { User } from '../../graphql/models/user.model';
export declare class AIProvider {
    id: string;
    provider: AIProviderType;
    name: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    isActive: boolean;
    priority: number;
    isDefault: boolean;
    description?: string;
    tags?: string[];
    totalRequests: number;
    successCount: number;
    failureCount: number;
    avgResponseTime?: number;
    lastUsedAt?: Date;
    lastError?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    creator?: User;
}
export declare class AIProviderTestResult {
    success: boolean;
    response?: string;
    error?: string;
    responseTime: number;
    tokensUsed: number;
}
export declare class AIProviderStats {
    totalProviders: number;
    activeProviders: number;
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
}
