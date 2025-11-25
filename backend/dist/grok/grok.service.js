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
var GrokService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrokService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let GrokService = GrokService_1 = class GrokService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GrokService_1.name);
        this.apiKey = this.configService.get('GROK_API_KEY');
        this.baseUrl = this.configService.get('GROK_API_URL', 'https://api.x.ai/v1');
        if (!this.apiKey) {
            this.logger.warn('GROK_API_KEY not found in environment variables');
        }
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async generateSummary(content, maxLength = 200) {
        if (!this.apiKey) {
            throw new common_1.HttpException('Grok API key not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const prompt = `Please provide a concise summary of the following content in maximum ${maxLength} characters. Focus on the main points and key information:\n\n${content}`;
            const response = await this.httpClient.post('/chat/completions', {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise, accurate summaries of content. Focus on extracting the most important information and present it clearly.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: Math.ceil(maxLength / 4),
                temperature: 0.3,
            });
            const summary = response.data.choices[0]?.message?.content?.trim();
            if (!summary) {
                throw new Error('No summary generated from Grok API');
            }
            return summary.length > maxLength
                ? summary.substring(0, maxLength - 3) + '...'
                : summary;
        }
        catch (error) {
            this.logger.error('Error generating summary with Grok API:', error);
            if (error.response?.status === 401) {
                throw new common_1.HttpException('Invalid Grok API key', common_1.HttpStatus.UNAUTHORIZED);
            }
            else if (error.response?.status === 429) {
                throw new common_1.HttpException('Grok API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            else if (error.response?.status >= 500) {
                throw new common_1.HttpException('Grok API service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw new common_1.HttpException('Failed to generate summary', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generatePostExcerpt(title, content) {
        const combinedContent = `Title: ${title}\n\nContent: ${content}`;
        return this.generateSummary(combinedContent, 150);
    }
    async generateTags(content, maxTags = 5) {
        if (!this.apiKey) {
            throw new common_1.HttpException('Grok API key not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const prompt = `Analyze the following content and suggest up to ${maxTags} relevant tags/keywords that would be appropriate for categorizing this content. Return only the tags as a comma-separated list, no additional text:\n\n${content}`;
            const response = await this.httpClient.post('/chat/completions', {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a content analyzer that extracts relevant tags/keywords from text. Return only the tags as a comma-separated list.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 100,
                temperature: 0.4,
            });
            const tagsResponse = response.data.choices[0]?.message?.content?.trim();
            if (!tagsResponse) {
                return [];
            }
            const tags = tagsResponse
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0 && tag.length <= 30)
                .slice(0, maxTags);
            return tags;
        }
        catch (error) {
            this.logger.error('Error generating tags with Grok API:', error);
            return [];
        }
    }
    async improveContent(content, instruction) {
        if (!this.apiKey) {
            throw new common_1.HttpException('Grok API key not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const prompt = `${instruction}\n\nOriginal content:\n${content}`;
            const response = await this.httpClient.post('/chat/completions', {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a skilled content editor and writer. Help improve the given content according to the specific instructions provided.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 2000,
                temperature: 0.7,
            });
            const improvedContent = response.data.choices[0]?.message?.content?.trim();
            if (!improvedContent) {
                throw new Error('No improved content generated from Grok API');
            }
            return improvedContent;
        }
        catch (error) {
            this.logger.error('Error improving content with Grok API:', error);
            throw new common_1.HttpException('Failed to improve content', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GrokService = GrokService;
exports.GrokService = GrokService = GrokService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GrokService);
//# sourceMappingURL=grok.service.js.map