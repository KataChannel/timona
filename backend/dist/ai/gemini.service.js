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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GeminiService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured. AI analysis features will be disabled.');
            return;
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.logger.log('Gemini AI service initialized');
    }
    async analyzeDocument(content, type) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = this.buildAnalysisPrompt(content, type);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return this.parseAnalysisResponse(text);
        }
        catch (error) {
            this.logger.error('Error analyzing document with Gemini:', error);
            throw new Error('Failed to analyze document');
        }
    }
    async summarizeText(text, maxLength = 500) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = `Summarize the following text in Vietnamese (maximum ${maxLength} characters):\n\n${text}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error('Error summarizing text:', error);
            throw new Error('Failed to summarize text');
        }
    }
    async extractKeywords(text, count = 10) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = `Extract ${count} most important keywords from the following text. Return only the keywords separated by commas:\n\n${text}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const keywords = response.text().split(',').map((k) => k.trim()).filter(Boolean);
            return keywords.slice(0, count);
        }
        catch (error) {
            this.logger.error('Error extracting keywords:', error);
            throw new Error('Failed to extract keywords');
        }
    }
    async identifyTopics(text, count = 5) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = `Identify ${count} main topics/themes from the following text. Return only the topics separated by commas:\n\n${text}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const topics = response.text().split(',').map((t) => t.trim()).filter(Boolean);
            return topics.slice(0, count);
        }
        catch (error) {
            this.logger.error('Error identifying topics:', error);
            throw new Error('Failed to identify topics');
        }
    }
    async analyzeVideoTranscript(transcript) {
        return this.analyzeDocument(transcript, 'VIDEO');
    }
    async analyzeAudioTranscript(transcript) {
        return this.analyzeDocument(transcript, 'AUDIO');
    }
    buildAnalysisPrompt(content, type) {
        return `Analyze the following ${type} content and provide:
1. A comprehensive summary (in Vietnamese, 200-300 words)
2. 10 most important keywords
3. 5 main topics/themes

Content:
${content}

Please format your response as JSON with the following structure:
{
  "summary": "...",
  "keywords": ["...", "...", ...],
  "topics": ["...", "...", ...]
}`;
    }
    parseAnalysisResponse(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    summary: parsed.summary || '',
                    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
                    topics: Array.isArray(parsed.topics) ? parsed.topics : [],
                };
            }
            this.logger.warn('Failed to parse JSON response, using fallback parsing');
            return this.fallbackParse(text);
        }
        catch (error) {
            this.logger.error('Error parsing analysis response:', error);
            return this.fallbackParse(text);
        }
    }
    fallbackParse(text) {
        const lines = text.split('\n').filter(Boolean);
        let summary = '';
        const keywords = [];
        const topics = [];
        let currentSection = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().includes('summary') || trimmed.toLowerCase().includes('tóm tắt')) {
                currentSection = 'summary';
                continue;
            }
            if (trimmed.toLowerCase().includes('keyword') || trimmed.toLowerCase().includes('từ khóa')) {
                currentSection = 'keywords';
                continue;
            }
            if (trimmed.toLowerCase().includes('topic') || trimmed.toLowerCase().includes('chủ đề')) {
                currentSection = 'topics';
                continue;
            }
            if (currentSection === 'summary' && trimmed) {
                summary += trimmed + ' ';
            }
            else if (currentSection === 'keywords' && trimmed) {
                keywords.push(...trimmed.split(',').map((k) => k.trim()).filter(Boolean));
            }
            else if (currentSection === 'topics' && trimmed) {
                topics.push(...trimmed.split(',').map((t) => t.trim()).filter(Boolean));
            }
        }
        return {
            summary: summary.trim() || 'Unable to generate summary',
            keywords: keywords.slice(0, 10),
            topics: topics.slice(0, 5),
        };
    }
    async analyzeLearningMaterial(content) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = `Analyze the following educational content and provide:
1. Difficulty level (Beginner/Intermediate/Advanced)
2. Prerequisites (list of required knowledge)
3. Learning objectives (what students will learn)
4. Estimated learning time

Content:
${content}

Format as JSON:
{
  "difficulty": "...",
  "prerequisites": ["...", ...],
  "learningObjectives": ["...", ...],
  "estimatedTime": "..."
}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse learning material analysis');
        }
        catch (error) {
            this.logger.error('Error analyzing learning material:', error);
            throw new Error('Failed to analyze learning material');
        }
    }
    async generateQuizQuestions(content, count = 5) {
        if (!this.model) {
            throw new Error('Gemini AI not configured');
        }
        try {
            const prompt = `Generate ${count} multiple-choice quiz questions based on the following content. Each question should have 4 options with one correct answer.

Content:
${content}

Format as JSON array:
[
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": 0,
    "explanation": "..."
  },
  ...
]`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse quiz questions');
        }
        catch (error) {
            this.logger.error('Error generating quiz questions:', error);
            throw new Error('Failed to generate quiz questions');
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map