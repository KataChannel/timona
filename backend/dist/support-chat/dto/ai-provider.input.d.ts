export declare enum AIProviderType {
    CHATGPT = "CHATGPT",
    GROK = "GROK",
    GEMINI = "GEMINI"
}
export declare class CreateAIProviderInput {
    provider: AIProviderType;
    name: string;
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    isActive?: boolean;
    priority?: number;
    isDefault?: boolean;
    description?: string;
    tags?: string[];
}
export declare class UpdateAIProviderInput {
    name?: string;
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    isActive?: boolean;
    priority?: number;
    isDefault?: boolean;
    description?: string;
    tags?: string[];
}
export declare class TestAIProviderInput {
    providerId: string;
    testMessage?: string;
}
