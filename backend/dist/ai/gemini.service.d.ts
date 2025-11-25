import { ConfigService } from '@nestjs/config';
interface AIAnalysisResult {
    summary: string;
    keywords: string[];
    topics: string[];
}
export declare class GeminiService {
    private readonly configService;
    private readonly logger;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    analyzeDocument(content: string, type: string): Promise<AIAnalysisResult>;
    summarizeText(text: string, maxLength?: number): Promise<string>;
    extractKeywords(text: string, count?: number): Promise<string[]>;
    identifyTopics(text: string, count?: number): Promise<string[]>;
    analyzeVideoTranscript(transcript: string): Promise<AIAnalysisResult>;
    analyzeAudioTranscript(transcript: string): Promise<AIAnalysisResult>;
    private buildAnalysisPrompt;
    private parseAnalysisResponse;
    private fallbackParse;
    analyzeLearningMaterial(content: string): Promise<{
        difficulty: string;
        prerequisites: string[];
        learningObjectives: string[];
        estimatedTime: string;
    }>;
    generateQuizQuestions(content: string, count?: number): Promise<any[]>;
}
export {};
