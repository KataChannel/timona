"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AIResponseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIResponseService = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_service_1 = require("./ai-provider.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_provider_input_1 = require("../dto/ai-provider.input");
const openai_1 = __importDefault(require("openai"));
const generative_ai_1 = require("@google/generative-ai");
let AIResponseService = AIResponseService_1 = class AIResponseService {
    constructor(aiProviderService, prisma) {
        this.aiProviderService = aiProviderService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AIResponseService_1.name);
    }
    async generateResponse(messages, providerType) {
        const startTime = Date.now();
        try {
            const provider = await this.aiProviderService.getActiveProvider(providerType);
            if (!provider) {
                throw new common_1.BadRequestException('No active AI provider found');
            }
            this.logger.log(`Using AI provider: ${provider.name} (${provider.provider})`);
            let response;
            switch (provider.provider) {
                case ai_provider_input_1.AIProviderType.CHATGPT:
                    response = await this.callChatGPT(provider, messages);
                    break;
                case ai_provider_input_1.AIProviderType.GROK:
                    response = await this.callGrok(provider, messages);
                    break;
                case ai_provider_input_1.AIProviderType.GEMINI:
                    response = await this.callGemini(provider, messages);
                    break;
                default:
                    throw new common_1.BadRequestException(`Unsupported provider type: ${provider.provider}`);
            }
            const responseTime = Date.now() - startTime;
            await this.aiProviderService.updateStats(provider.id, true, responseTime);
            this.logger.log(`AI response generated in ${responseTime}ms`);
            return {
                response,
                providerId: provider.id,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.error(`AI response failed: ${error.message}`);
            if (providerType) {
                this.logger.log('Attempting fallback to default provider...');
                try {
                    return await this.generateResponse(messages);
                }
                catch (fallbackError) {
                    throw error;
                }
            }
            throw error;
        }
    }
    async testProvider(providerId, testMessage) {
        const startTime = Date.now();
        try {
            const provider = await this.aiProviderService.getProviderById(providerId);
            const actualProvider = await this.prisma.aIProvider.findUnique({
                where: { id: providerId },
            });
            if (!actualProvider) {
                throw new common_1.BadRequestException('Provider not found');
            }
            const messages = [
                {
                    role: 'user',
                    content: testMessage || 'Hello, this is a test message. Please respond briefly.',
                },
            ];
            let response;
            let tokensUsed = 0;
            switch (provider.provider) {
                case ai_provider_input_1.AIProviderType.CHATGPT:
                    const chatGPTResult = await this.callChatGPT({ ...provider, apiKey: actualProvider.apiKey }, messages);
                    response = chatGPTResult;
                    tokensUsed = 100;
                    break;
                case ai_provider_input_1.AIProviderType.GROK:
                    const grokResult = await this.callGrok({ ...provider, apiKey: actualProvider.apiKey }, messages);
                    response = grokResult;
                    tokensUsed = 100;
                    break;
                case ai_provider_input_1.AIProviderType.GEMINI:
                    const geminiResult = await this.callGemini({ ...provider, apiKey: actualProvider.apiKey }, messages);
                    response = geminiResult;
                    tokensUsed = 100;
                    break;
                default:
                    throw new common_1.BadRequestException(`Unsupported provider: ${provider.provider}`);
            }
            const responseTime = Date.now() - startTime;
            return {
                success: true,
                response,
                responseTime,
                tokensUsed,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                error: error.message,
                responseTime,
                tokensUsed: 0,
            };
        }
    }
    async callChatGPT(provider, messages) {
        try {
            const openai = new openai_1.default({
                apiKey: provider.apiKey,
            });
            const formattedMessages = [];
            if (provider.systemPrompt) {
                formattedMessages.push({
                    role: 'system',
                    content: provider.systemPrompt,
                });
            }
            formattedMessages.push(...messages);
            const completion = await openai.chat.completions.create({
                model: provider.model,
                messages: formattedMessages,
                temperature: provider.temperature,
                max_tokens: provider.maxTokens,
            });
            return completion.choices[0]?.message?.content || 'No response generated';
        }
        catch (error) {
            this.logger.error(`ChatGPT API error: ${error.message}`);
            throw new common_1.BadRequestException(`ChatGPT API error: ${error.message}`);
        }
    }
    async callGrok(provider, messages) {
        try {
            const grok = new openai_1.default({
                apiKey: provider.apiKey,
                baseURL: 'https://api.x.ai/v1',
            });
            const formattedMessages = [];
            if (provider.systemPrompt) {
                formattedMessages.push({
                    role: 'system',
                    content: provider.systemPrompt,
                });
            }
            formattedMessages.push(...messages);
            const completion = await grok.chat.completions.create({
                model: provider.model,
                messages: formattedMessages,
                temperature: provider.temperature,
                max_tokens: provider.maxTokens,
            });
            return completion.choices[0]?.message?.content || 'No response generated';
        }
        catch (error) {
            this.logger.error(`Grok API error: ${error.message}`);
            throw new common_1.BadRequestException(`Grok API error: ${error.message}`);
        }
    }
    async callGemini(provider, messages) {
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(provider.apiKey);
            const model = genAI.getGenerativeModel({ model: provider.model });
            let prompt = '';
            if (provider.systemPrompt) {
                prompt += `System: ${provider.systemPrompt}\n\n`;
            }
            messages.forEach(msg => {
                prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text || 'No response generated';
        }
        catch (error) {
            this.logger.error(`Gemini API error: ${error.message}`);
            throw new common_1.BadRequestException(`Gemini API error: ${error.message}`);
        }
    }
};
exports.AIResponseService = AIResponseService;
exports.AIResponseService = AIResponseService = AIResponseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_provider_service_1.AIProviderService,
        prisma_service_1.PrismaService])
], AIResponseService);
//# sourceMappingURL=ai-response.service.js.map