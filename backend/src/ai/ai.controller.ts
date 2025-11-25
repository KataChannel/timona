import { Controller, Post, Get, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { TaskPrioritizationService, PriorityPrediction, WorkloadRecommendation } from './services/task-prioritization.service';
import { IntelligentSuggestionsService, SmartSuggestion, ContentAnalysis } from './services/intelligent-suggestions.service';
import { Task } from '@prisma/client';

export class PredictPriorityDto {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: string;
  tags?: string[];
}

export class AnalyzeContentDto {
  content: string;
}

export class GenerateTasksDto {
  notes: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly taskPrioritization: TaskPrioritizationService,
    private readonly intelligentSuggestions: IntelligentSuggestionsService,
  ) {}

  /**
   * Predict optimal priority for a task using AI/ML
   * POST /ai/predict-priority/:userId
   */
  @Post('predict-priority/:userId')
  async predictTaskPriority(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() taskData: PredictPriorityDto
  ): Promise<PriorityPrediction> {
    const task: Partial<Task> = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority as any,
    };

    return await this.taskPrioritization.predictTaskPriority(task, userId);
  }

  /**
   * Analyze user's workload and provide recommendations
   * GET /ai/workload-analysis/:userId
   */
  @Get('workload-analysis/:userId')
  async analyzeWorkload(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<WorkloadRecommendation> {
    return await this.taskPrioritization.analyzeWorkload(userId);
  }

  /**
   * Generate intelligent suggestions based on user behavior
   * GET /ai/suggestions/:userId
   */
  @Get('suggestions/:userId')
  async generateSmartSuggestions(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<SmartSuggestion[]> {
    return await this.intelligentSuggestions.generateSmartSuggestions(userId);
  }

  /**
   * Analyze text content and extract task-related information
   * POST /ai/analyze-content/:userId
   */
  @Post('analyze-content/:userId')
  async analyzeContent(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: AnalyzeContentDto
  ): Promise<ContentAnalysis> {
    return await this.intelligentSuggestions.analyzeContent(data.content, userId);
  }

  /**
   * Generate tasks from meeting notes or documents
   * POST /ai/generate-tasks/:userId
   */
  @Post('generate-tasks/:userId')
  async generateTasksFromNotes(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: GenerateTasksDto
  ): Promise<Partial<Task>[]> {
    return await this.intelligentSuggestions.generateTasksFromNotes(data.notes, userId);
  }

  /**
   * Get AI insights dashboard data
   * GET /ai/insights/:userId
   */
  @Get('insights/:userId')
  async getAiInsights(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<{
    workloadAnalysis: WorkloadRecommendation;
    smartSuggestions: SmartSuggestion[];
    productivityScore: number;
    completionRate: number;
    averageTaskComplexity: number;
  }> {
    // Get all AI insights in parallel
    const [workloadAnalysis, smartSuggestions] = await Promise.all([
      this.taskPrioritization.analyzeWorkload(userId),
      this.intelligentSuggestions.generateSmartSuggestions(userId)
    ]);

    // Calculate additional metrics
    const productivityScore = await this.calculateProductivityScore(userId);
    const completionRate = await this.calculateCompletionRate(userId);
    const averageTaskComplexity = await this.calculateAverageComplexity(userId);

    return {
      workloadAnalysis,
      smartSuggestions: smartSuggestions.slice(0, 5), // Top 5 suggestions
      productivityScore,
      completionRate,
      averageTaskComplexity
    };
  }

  /**
   * Calculate user's productivity score (simplified implementation)
   */
  private async calculateProductivityScore(userId: string): Promise<number> {
    // This would use the FeatureExtractionService in a real implementation
    // For now, return a mock score based on basic metrics
    return Math.floor(Math.random() * 40) + 60; // 60-100 range
  }

  /**
   * Calculate user's task completion rate
   */
  private async calculateCompletionRate(userId: string): Promise<number> {
    // This would use actual database queries in a real implementation
    // For now, return a mock completion rate
    return Math.floor(Math.random() * 30) + 70; // 70-100 range
  }

  /**
   * Calculate average task complexity for user
   */
  private async calculateAverageComplexity(userId: string): Promise<number> {
    // This would analyze user's historical tasks in a real implementation
    // For now, return a mock complexity score
    return Math.floor(Math.random() * 4) + 4; // 4-8 range
  }
}