import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AIProviderService } from './ai-provider.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderType } from '../dto/ai-provider.input';
import { AIProvider, AIProviderTestResult } from '../entities/ai-provider.entity';

// OpenAI (ChatGPT) SDK
import OpenAI from 'openai';

// Google Generative AI (Gemini) SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIResponseService {
  private readonly logger = new Logger(AIResponseService.name);

  constructor(
    private aiProviderService: AIProviderService,
    private prisma: PrismaService,
  ) {}

  /**
   * Generate AI response dựa trên conversation context
   */
  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    providerType?: AIProviderType,
  ): Promise<{ response: string; providerId: string }> {
    const startTime = Date.now();

    try {
      // Lấy active provider
      const provider = await this.aiProviderService.getActiveProvider(providerType);
      if (!provider) {
        throw new BadRequestException('No active AI provider found');
      }

      this.logger.log(`Using AI provider: ${provider.name} (${provider.provider})`);

      let response: string;

      // Gọi API theo provider type
      switch (provider.provider) {
        case AIProviderType.CHATGPT:
          response = await this.callChatGPT(provider, messages);
          break;
        case AIProviderType.GROK:
          response = await this.callGrok(provider, messages);
          break;
        case AIProviderType.GEMINI:
          response = await this.callGemini(provider, messages);
          break;
        default:
          throw new BadRequestException(`Unsupported provider type: ${provider.provider}`);
      }

      const responseTime = Date.now() - startTime;

      // Update stats
      await this.aiProviderService.updateStats(provider.id, true, responseTime);

      this.logger.log(`AI response generated in ${responseTime}ms`);

      return {
        response,
        providerId: provider.id,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`AI response failed: ${error.message}`);

      // Try fallback provider if available
      if (providerType) {
        this.logger.log('Attempting fallback to default provider...');
        try {
          return await this.generateResponse(messages); // Retry without specific type
        } catch (fallbackError) {
          throw error; // Throw original error if fallback also fails
        }
      }

      throw error;
    }
  }

  /**
   * Test AI provider connection
   */
  async testProvider(providerId: string, testMessage?: string): Promise<AIProviderTestResult> {
    const startTime = Date.now();

    try {
      const provider = await this.aiProviderService.getProviderById(providerId);

      // Get actual API key (not masked)
      const actualProvider = await this.prisma.aIProvider.findUnique({
        where: { id: providerId },
      });

      if (!actualProvider) {
        throw new BadRequestException('Provider not found');
      }

      const messages = [
        {
          role: 'user',
          content: testMessage || 'Hello, this is a test message. Please respond briefly.',
        },
      ];

      let response: string;
      let tokensUsed = 0;

      // Call API based on provider type
      switch (provider.provider) {
        case AIProviderType.CHATGPT:
          const chatGPTResult = await this.callChatGPT(
            { ...provider, apiKey: actualProvider.apiKey },
            messages,
          );
          response = chatGPTResult;
          tokensUsed = 100; // TODO: Get from actual response
          break;

        case AIProviderType.GROK:
          const grokResult = await this.callGrok(
            { ...provider, apiKey: actualProvider.apiKey },
            messages,
          );
          response = grokResult;
          tokensUsed = 100;
          break;

        case AIProviderType.GEMINI:
          const geminiResult = await this.callGemini(
            { ...provider, apiKey: actualProvider.apiKey },
            messages,
          );
          response = geminiResult;
          tokensUsed = 100;
          break;

        default:
          throw new BadRequestException(`Unsupported provider: ${provider.provider}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        response,
        responseTime,
        tokensUsed,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        responseTime,
        tokensUsed: 0,
      };
    }
  }

  /**
   * Call ChatGPT API
   */
  private async callChatGPT(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: provider.apiKey,
      });

      const formattedMessages: any[] = [];

      // Add system prompt if exists
      if (provider.systemPrompt) {
        formattedMessages.push({
          role: 'system',
          content: provider.systemPrompt,
        });
      }

      // Add conversation messages
      formattedMessages.push(...messages);

      const completion = await openai.chat.completions.create({
        model: provider.model,
        messages: formattedMessages,
        temperature: provider.temperature,
        max_tokens: provider.maxTokens,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      this.logger.error(`ChatGPT API error: ${error.message}`);
      throw new BadRequestException(`ChatGPT API error: ${error.message}`);
    }
  }

  /**
   * Call Grok API (sử dụng OpenAI SDK vì Grok tương thích)
   */
  private async callGrok(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      // Grok uses OpenAI-compatible API
      const grok = new OpenAI({
        apiKey: provider.apiKey,
        baseURL: 'https://api.x.ai/v1', // Grok API endpoint
      });

      const formattedMessages: any[] = [];

      if (provider.systemPrompt) {
        formattedMessages.push({
          role: 'system',
          content: provider.systemPrompt,
        });
      }

      formattedMessages.push(...messages);

      const completion = await grok.chat.completions.create({
        model: provider.model, // e.g., 'grok-2'
        messages: formattedMessages,
        temperature: provider.temperature,
        max_tokens: provider.maxTokens,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      this.logger.error(`Grok API error: ${error.message}`);
      throw new BadRequestException(`Grok API error: ${error.message}`);
    }
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(provider.apiKey);
      const model = genAI.getGenerativeModel({ model: provider.model });

      // Build prompt from messages
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
    } catch (error) {
      this.logger.error(`Gemini API error: ${error.message}`);
      throw new BadRequestException(`Gemini API error: ${error.message}`);
    }
  }
}
