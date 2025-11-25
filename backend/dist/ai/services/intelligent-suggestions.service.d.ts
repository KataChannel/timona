import { Task, TaskPriority } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export interface SmartSuggestion {
    type: 'task_creation' | 'task_optimization' | 'deadline_adjustment' | 'workload_balance' | 'process_improvement';
    title: string;
    description: string;
    confidence: number;
    action?: {
        type: 'create_task' | 'update_task' | 'reschedule' | 'delegate';
        parameters: Record<string, any>;
    };
    impact: 'low' | 'medium' | 'high';
    reasoning: string[];
}
export interface ContentAnalysis {
    extractedTasks: string[];
    suggestedTags: string[];
    estimatedComplexity: number;
    suggestedPriority: TaskPriority;
    relatedTasks: string[];
    keyPhrases: string[];
}
export declare class IntelligentSuggestionsService {
    private readonly prisma;
    private readonly logger;
    private readonly taskKeywords;
    private readonly urgencyKeywords;
    private readonly complexityKeywords;
    constructor(prisma: PrismaService);
    generateSmartSuggestions(userId: string): Promise<SmartSuggestion[]>;
    analyzeContent(content: string, userId: string): Promise<ContentAnalysis>;
    generateTasksFromNotes(notes: string, userId: string): Promise<Partial<Task>[]>;
    private getUserTaskData;
    private generateTaskOptimizationSuggestions;
    private generateWorkloadBalanceSuggestions;
    private generateDeadlineAdjustmentSuggestions;
    private generateProcessImprovementSuggestions;
    private tokenizeText;
    private splitIntoSentences;
    private extractTasksFromText;
    private extractTags;
    private estimateComplexityFromText;
    private suggestPriorityFromText;
    private findRelatedTasks;
    private extractKeyPhrases;
    private findSimilarTasks;
    private generateTaskDescription;
}
