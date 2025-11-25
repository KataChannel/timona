import { Task, TaskPriority } from '@prisma/client';
import { FeatureExtractionService } from './feature-extraction.service';
export interface PriorityPrediction {
    suggestedPriority: TaskPriority;
    confidence: number;
    reasoning: string[];
    urgencyScore: number;
    importanceScore: number;
    riskFactors: string[];
    recommendations: string[];
}
export interface WorkloadRecommendation {
    shouldTakeOnTask: boolean;
    estimatedEffort: number;
    suggestedDeadline: Date;
    workloadImpact: 'low' | 'medium' | 'high';
    alternatives: string[];
}
export declare class TaskPrioritizationService {
    private readonly featureExtraction;
    private readonly logger;
    private readonly modelWeights;
    constructor(featureExtraction: FeatureExtractionService);
    predictTaskPriority(task: Partial<Task>, userId: string): Promise<PriorityPrediction>;
    analyzeWorkload(userId: string): Promise<WorkloadRecommendation>;
    private calculatePriorityScore;
    private mapScoreToPriority;
    private calculateConfidence;
    private generateReasoning;
    private identifyRiskFactors;
    private generateRecommendations;
    private calculateHistoricalFactor;
    private calculateContextualFactor;
    private estimateEffort;
    private suggestDeadline;
    private generateAlternatives;
}
