import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskPriority } from '@prisma/client';
import { FeatureExtractionService, TaskFeatures, UserContext } from './feature-extraction.service';

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
  estimatedEffort: number; // hours
  suggestedDeadline: Date;
  workloadImpact: 'low' | 'medium' | 'high';
  alternatives: string[];
}

@Injectable()
export class TaskPrioritizationService {
  private readonly logger = new Logger(TaskPrioritizationService.name);
  
  // Simple rule-based ML model weights (could be replaced with trained model)
  private readonly modelWeights = {
    urgency: 0.25,
    importance: 0.25,
    workload: 0.15,
    complexity: 0.15,
    historicalPattern: 0.10,
    contextual: 0.10
  };

  constructor(
    private readonly featureExtraction: FeatureExtractionService
  ) {}

  /**
   * Predict optimal priority for a task using AI/ML
   */
  async predictTaskPriority(
    task: Partial<Task>, 
    userId: string
  ): Promise<PriorityPrediction> {
    this.logger.debug(`Predicting priority for task: ${task.title}`);

    // Get user context and extract features
    const userContext = await this.featureExtraction.getUserContext(userId);
    const features = await this.featureExtraction.extractTaskFeatures(task, userContext);

    // Calculate priority score using weighted features
    const priorityScore = this.calculatePriorityScore(features);
    
    // Map score to priority level
    const suggestedPriority = this.mapScoreToPriority(priorityScore);
    
    // Calculate confidence based on feature certainty
    const confidence = this.calculateConfidence(features, userContext);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(features, priorityScore);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(features, userContext);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(features, userContext, suggestedPriority);

    const prediction: PriorityPrediction = {
      suggestedPriority,
      confidence,
      reasoning,
      urgencyScore: features.urgencyScore,
      importanceScore: features.importanceScore,
      riskFactors,
      recommendations
    };

    this.logger.debug(`Priority prediction: ${JSON.stringify(prediction)}`);
    return prediction;
  }

  /**
   * Analyze workload and provide recommendations
   */
  async analyzeWorkload(userId: string): Promise<WorkloadRecommendation> {
    const userContext = await this.featureExtraction.getUserContext(userId);
    
    const workloadPercentage = (userContext.currentTasks / 20) * 100; // Assuming 20 is max
    const shouldTakeOnTask = workloadPercentage < 80; // Don't overload
    
    const estimatedEffort = this.estimateEffort(userContext);
    const suggestedDeadline = this.suggestDeadline(userContext);
    
    let workloadImpact: 'low' | 'medium' | 'high' = 'low';
    if (workloadPercentage > 60) workloadImpact = 'medium';
    if (workloadPercentage > 80) workloadImpact = 'high';
    
    const alternatives = this.generateAlternatives(userContext, workloadPercentage);

    return {
      shouldTakeOnTask,
      estimatedEffort,
      suggestedDeadline,
      workloadImpact,
      alternatives
    };
  }

  /**
   * Calculate priority score using weighted features
   */
  private calculatePriorityScore(features: TaskFeatures): number {
    let score = 0;

    // Urgency component (0-10 scale)
    score += (features.urgencyScore / 10) * this.modelWeights.urgency;
    
    // Importance component (0-10 scale)  
    score += (features.importanceScore / 10) * this.modelWeights.importance;
    
    // Workload component (inverse - high workload reduces priority)
    const workloadFactor = Math.max(0, 1 - features.currentWorkload / 100);
    score += workloadFactor * this.modelWeights.workload;
    
    // Complexity component (higher complexity = higher priority)
    score += (features.taskComplexity / 10) * this.modelWeights.complexity;
    
    // Historical pattern component
    const historicalFactor = this.calculateHistoricalFactor(features);
    score += historicalFactor * this.modelWeights.historicalPattern;
    
    // Contextual factors (time, day, etc.)
    const contextualFactor = this.calculateContextualFactor(features);
    score += contextualFactor * this.modelWeights.contextual;

    return Math.max(0, Math.min(1, score)); // Normalize to 0-1
  }

  /**
   * Map numerical score to priority enum
   */
  private mapScoreToPriority(score: number): TaskPriority {
    if (score >= 0.8) return 'URGENT';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate confidence in the prediction
   */
  private calculateConfidence(features: TaskFeatures, userContext: UserContext): number {
    let confidence = 0.5; // Base confidence

    // More historical data = higher confidence
    if (userContext.completedTasks > 10) confidence += 0.2;
    if (userContext.completedTasks > 50) confidence += 0.1;
    
    // Clear deadlines increase confidence
    if (features.hasDueDate) confidence += 0.1;
    
    // Similar tasks completed increases confidence
    if (features.similarTasksCompleted > 3) confidence += 0.1;
    
    // Good productivity score increases confidence
    if (userContext.productivityScore > 70) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(features: TaskFeatures, score: number): string[] {
    const reasoning: string[] = [];

    if (features.urgencyScore > 7) {
      reasoning.push(`High urgency score (${features.urgencyScore}/10) due to priority level and deadline proximity`);
    }

    if (features.daysUntilDue >= 0 && features.daysUntilDue <= 1) {
      reasoning.push(`Task is due ${features.daysUntilDue === 0 ? 'today' : 'tomorrow'}`);
    }

    if (features.currentWorkload > 80) {
      reasoning.push(`High current workload (${features.currentWorkload.toFixed(0)}%) may affect task completion`);
    }

    if (features.taskComplexity > 7) {
      reasoning.push(`High task complexity (${features.taskComplexity}/10) requires significant attention`);
    }

    if (features.similarTasksCompleted > 5) {
      reasoning.push(`Experience with ${features.similarTasksCompleted} similar tasks completed`);
    }

    if (features.procrastinationTendency > 0.3) {
      reasoning.push(`Historical procrastination tendency suggests earlier start recommended`);
    }

    if (score > 0.8) {
      reasoning.push(`Overall score of ${(score * 100).toFixed(0)}% indicates urgent priority`);
    }

    return reasoning;
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(features: TaskFeatures, userContext: UserContext): string[] {
    const risks: string[] = [];

    if (features.currentWorkload > 90) {
      risks.push('Extremely high workload may lead to burnout');
    }

    if (features.daysUntilDue >= 0 && features.daysUntilDue <= 2 && features.taskComplexity > 6) {
      risks.push('Complex task with tight deadline - high risk of incomplete work');
    }

    if (userContext.overdueTasks > 3) {
      risks.push('Multiple overdue tasks indicate capacity issues');
    }

    if (features.procrastinationTendency > 0.5) {
      risks.push('High procrastination tendency may delay completion');
    }

    if (userContext.productivityScore < 30) {
      risks.push('Low productivity score suggests need for process improvement');
    }

    if (features.avgCompletionTime > 72) { // More than 3 days
      risks.push('Historically slow task completion may affect deadlines');
    }

    return risks;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    features: TaskFeatures, 
    userContext: UserContext, 
    priority: TaskPriority
  ): string[] {
    const recommendations: string[] = [];

    if (priority === 'URGENT' || priority === 'HIGH') {
      recommendations.push('Consider tackling this task immediately or early in the day');
      
      if (features.taskComplexity > 6) {
        recommendations.push('Break down this complex task into smaller, manageable subtasks');
      }
    }

    if (features.currentWorkload > 80) {
      recommendations.push('Consider delegating other tasks or rescheduling non-urgent items');
    }

    if (features.procrastinationTendency > 0.3) {
      recommendations.push('Set specific time blocks and use productivity techniques like Pomodoro');
    }

    if (!features.hasDueDate && priority !== 'LOW') {
      recommendations.push('Set a specific deadline to maintain accountability');
    }

    if (features.similarTasksCompleted === 0) {
      recommendations.push('Research similar approaches or seek guidance from experienced colleagues');
    }

    if (userContext.productivityScore < 50) {
      recommendations.push('Consider reviewing your task management process and eliminating distractions');
    }

    if (features.daysUntilDue > 7 && priority === 'LOW') {
      recommendations.push('This task can be scheduled for later in the week');
    }

    return recommendations;
  }

  /**
   * Calculate historical pattern factor
   */
  private calculateHistoricalFactor(features: TaskFeatures): number {
    let factor = 0.5; // Neutral base

    // User's priority preferences
    const prioritySum = Object.values(features.userPriorityPattern).reduce((sum, val) => sum + val, 0);
    if (prioritySum > 0) {
      // Weight based on user's historical priority distribution
      factor += features.userPriorityPattern.HIGH * 0.3;
      factor += features.userPriorityPattern.URGENT * 0.2;
    }

    // Completion rate affects confidence in taking on tasks
    factor += features.completionRate * 0.3;

    // Procrastination tendency reduces effective priority
    factor -= features.procrastinationTendency * 0.2;

    return Math.max(0, Math.min(1, factor));
  }

  /**
   * Calculate contextual factors
   */
  private calculateContextualFactor(features: TaskFeatures): number {
    let factor = 0.5; // Neutral base

    // Time of day considerations (assuming 9-17 are peak hours)
    if (features.timeOfDay >= 9 && features.timeOfDay <= 17) {
      factor += 0.2; // Peak productivity hours
    }

    // Day of week (Monday/Tuesday typically more productive)
    if (features.dayOfWeek >= 1 && features.dayOfWeek <= 2) {
      factor += 0.1;
    }

    // Avoid Fridays for complex tasks
    if (features.dayOfWeek === 5 && features.taskComplexity > 6) {
      factor -= 0.1;
    }

    // Seasonal considerations (minor effect)
    factor += features.seasonality * 0.05;

    return Math.max(0, Math.min(1, factor));
  }

  /**
   * Estimate effort required for workload analysis
   */
  private estimateEffort(userContext: UserContext): number {
    // Base effort estimate in hours
    let effort = userContext.averageCompletionTime || 4;

    // Adjust based on current workload
    if (userContext.currentTasks > 10) effort *= 1.2;
    if (userContext.productivityScore < 50) effort *= 1.5;

    return Math.max(1, Math.round(effort));
  }

  /**
   * Suggest optimal deadline based on workload
   */
  private suggestDeadline(userContext: UserContext): Date {
    const now = new Date();
    let daysToAdd = 3; // Default 3 days

    // Adjust based on workload
    if (userContext.currentTasks > 15) daysToAdd += 2;
    if (userContext.currentTasks > 20) daysToAdd += 3;

    // Adjust based on productivity
    if (userContext.productivityScore < 30) daysToAdd += 2;

    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + daysToAdd);
    
    return deadline;
  }

  /**
   * Generate workload management alternatives
   */
  private generateAlternatives(userContext: UserContext, workloadPercentage: number): string[] {
    const alternatives: string[] = [];

    if (workloadPercentage > 80) {
      alternatives.push('Delegate lower-priority tasks to team members');
      alternatives.push('Postpone non-urgent tasks to next week');
      alternatives.push('Break large tasks into smaller phases');
    }

    if (workloadPercentage > 60) {
      alternatives.push('Focus on completing current tasks before taking on new ones');
      alternatives.push('Set clearer boundaries on task scope');
    }

    if (userContext.overdueTasks > 0) {
      alternatives.push('Prioritize overdue tasks before accepting new work');
    }

    if (userContext.productivityScore < 50) {
      alternatives.push('Schedule tasks during your most productive hours');
      alternatives.push('Eliminate distractions and focus on deep work');
    }

    return alternatives;
  }
}