import { TaskPrioritizationService, PriorityPrediction, WorkloadRecommendation } from './services/task-prioritization.service';
import { IntelligentSuggestionsService, SmartSuggestion, ContentAnalysis } from './services/intelligent-suggestions.service';
import { Task } from '@prisma/client';
export declare class PredictPriorityDto {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: string;
    tags?: string[];
}
export declare class AnalyzeContentDto {
    content: string;
}
export declare class GenerateTasksDto {
    notes: string;
}
export declare class AiController {
    private readonly taskPrioritization;
    private readonly intelligentSuggestions;
    constructor(taskPrioritization: TaskPrioritizationService, intelligentSuggestions: IntelligentSuggestionsService);
    predictTaskPriority(userId: string, taskData: PredictPriorityDto): Promise<PriorityPrediction>;
    analyzeWorkload(userId: string): Promise<WorkloadRecommendation>;
    generateSmartSuggestions(userId: string): Promise<SmartSuggestion[]>;
    analyzeContent(userId: string, data: AnalyzeContentDto): Promise<ContentAnalysis>;
    generateTasksFromNotes(userId: string, data: GenerateTasksDto): Promise<Partial<Task>[]>;
    getAiInsights(userId: string): Promise<{
        workloadAnalysis: WorkloadRecommendation;
        smartSuggestions: SmartSuggestion[];
        productivityScore: number;
        completionRate: number;
        averageTaskComplexity: number;
    }>;
    private calculateProductivityScore;
    private calculateCompletionRate;
    private calculateAverageComplexity;
}
