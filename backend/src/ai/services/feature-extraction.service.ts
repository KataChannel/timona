import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface TaskFeatures {
  // Task characteristics
  titleLength: number;
  descriptionLength: number;
  hasDescription: boolean;
  hasDueDate: boolean;
  daysUntilDue: number;
  
  // User context
  currentWorkload: number;
  userProductivity: number;
  taskComplexity: number;
  similarTasksCompleted: number;
  avgCompletionTime: number;
  
  // Historical patterns
  userPriorityPattern: Record<TaskPriority, number>;
  completionRate: number;
  procrastinationTendency: number;
  
  // Context factors
  timeOfDay: number;
  dayOfWeek: number;
  seasonality: number;
  urgencyScore: number;
  importanceScore: number;
}

export interface UserContext {
  userId: string;
  currentTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  productivityScore: number;
  workingHours: { start: number; end: number };
  timezone: string;
  preferences: {
    preferredPriorities: TaskPriority[];
    workStyle: 'focused' | 'multitask' | 'deadline-driven';
    planningHorizon: number; // days
  };
}

@Injectable()
export class FeatureExtractionService {
  private readonly logger = new Logger(FeatureExtractionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Extract comprehensive features for AI model prediction
   */
  async extractTaskFeatures(
    task: Partial<Task>, 
    userContext: UserContext
  ): Promise<TaskFeatures> {
    const features: TaskFeatures = {
      // Basic task features
      titleLength: task.title?.length || 0,
      descriptionLength: task.description?.length || 0,
      hasDescription: Boolean(task.description),
      hasDueDate: Boolean(task.dueDate),
      daysUntilDue: this.calculateDaysUntilDue(task.dueDate),
      
      // User context features
      currentWorkload: await this.calculateCurrentWorkload(userContext.userId),
      userProductivity: userContext.productivityScore,
      taskComplexity: await this.estimateTaskComplexity(task),
      similarTasksCompleted: await this.countSimilarTasksCompleted(task, userContext.userId),
      avgCompletionTime: userContext.averageCompletionTime,
      
      // Historical patterns
      userPriorityPattern: await this.getUserPriorityPattern(userContext.userId),
      completionRate: await this.calculateCompletionRate(userContext.userId),
      procrastinationTendency: await this.calculateProcrastinationTendency(userContext.userId),
      
      // Context factors
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      seasonality: this.getSeasonality(),
      urgencyScore: this.calculateUrgencyScore(task),
      importanceScore: this.calculateImportanceScore(task, userContext)
    };

    this.logger.debug(`Extracted features for task: ${JSON.stringify(features)}`);
    return features;
  }

  /**
   * Get user context for AI predictions
   */
  async getUserContext(userId: string): Promise<UserContext> {
    const [currentTasks, completedTasks, overdueTasks, avgCompletionTime] = await Promise.all([
      this.countCurrentTasks(userId),
      this.countCompletedTasks(userId),
      this.countOverdueTasks(userId),
      this.calculateAverageCompletionTime(userId)
    ]);

    const productivityScore = this.calculateProductivityScore({
      completed: completedTasks,
      overdue: overdueTasks,
      current: currentTasks,
      avgCompletion: avgCompletionTime
    });

    return {
      userId,
      currentTasks,
      completedTasks,
      overdueTasks,
      averageCompletionTime: avgCompletionTime,
      productivityScore,
      workingHours: { start: 9, end: 17 }, // Default, could be user-customizable
      timezone: 'UTC',
      preferences: {
        preferredPriorities: ['HIGH', 'MEDIUM'] as TaskPriority[], // Could be learned from data
        workStyle: 'focused',
        planningHorizon: 7
      }
    };
  }

  /**
   * Calculate days until due date
   */
  private calculateDaysUntilDue(dueDate?: string | Date): number {
    if (!dueDate) return -1; // No due date
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Calculate current workload as percentage
   */
  private async calculateCurrentWorkload(userId: string): Promise<number> {
    const activeTasks = await this.prisma.task.count({
      where: {
        userId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });

    // Normalize to 0-100 scale (assuming 20 active tasks = 100% workload)
    return Math.min(100, (activeTasks / 20) * 100);
  }

  /**
   * Estimate task complexity based on various factors
   */
  private async estimateTaskComplexity(task: Partial<Task>): Promise<number> {
    let complexity = 5; // Base complexity

    // Title length indicates complexity
    if (task.title) {
      if (task.title.length > 50) complexity += 2;
      if (task.title.includes('project') || task.title.includes('system')) complexity += 1;
    }

    // Description length indicates complexity
    if (task.description) {
      if (task.description.length > 200) complexity += 2;
      if (task.description.length > 500) complexity += 2;
    }

    // Keywords that indicate complexity
    const complexKeywords = ['implement', 'refactor', 'optimize', 'integrate', 'design', 'architecture'];
    const taskText = `${task.title || ''} ${task.description || ''}`.toLowerCase();
    
    complexKeywords.forEach(keyword => {
      if (taskText.includes(keyword)) complexity += 1;
    });

    // Priority affects perceived complexity
    if (task.priority === 'URGENT') complexity += 2;
    if (task.priority === 'HIGH') complexity += 1;

    return Math.min(10, complexity);
  }

  /**
   * Count similar completed tasks
   */
  private async countSimilarTasksCompleted(task: Partial<Task>, userId: string): Promise<number> {
    if (!task.title) return 0;

    // Simple similarity based on common words
    const taskWords = task.title.toLowerCase().split(' ').filter(word => word.length > 3);
    if (taskWords.length === 0) return 0;

    const similarTasks = await this.prisma.task.count({
      where: {
        userId: userId,
        status: 'COMPLETED',
        OR: taskWords.map(word => ({
          title: { contains: word, mode: 'insensitive' }
        }))
      }
    });

    return similarTasks;
  }

  /**
   * Get user's priority distribution pattern
   */
  private async getUserPriorityPattern(userId: string): Promise<Record<TaskPriority, number>> {
    const tasks = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { userId: userId },
      _count: true
    });

    const pattern: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    };

    const total = tasks.reduce((sum, group) => sum + group._count, 0);
    
    tasks.forEach(group => {
      pattern[group.priority as TaskPriority] = total > 0 ? group._count / total : 0;
    });

    return pattern;
  }

  /**
   * Calculate user's completion rate
   */
  private async calculateCompletionRate(userId: string): Promise<number> {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: { userId: userId } }),
      this.prisma.task.count({ where: { userId: userId, status: 'COMPLETED' } })
    ]);

    return total > 0 ? completed / total : 0;
  }

  /**
   * Calculate procrastination tendency
   */
  private async calculateProcrastinationTendency(userId: string): Promise<number> {
    const completedTasks = await this.prisma.task.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
        dueDate: { not: null },
        completedAt: { not: null }
      },
      select: {
        dueDate: true,
        completedAt: true
      }
    });

    if (completedTasks.length === 0) return 0.5; // Neutral

    let lateCompletions = 0;
    completedTasks.forEach(task => {
      if (new Date(task.completedAt!) > new Date(task.dueDate!)) {
        lateCompletions++;
      }
    });

    return lateCompletions / completedTasks.length;
  }

  /**
   * Helper methods for context factors
   */
  private getTimeOfDay(): number {
    return new Date().getHours();
  }

  private getDayOfWeek(): number {
    return new Date().getDay(); // 0 = Sunday, 6 = Saturday
  }

  private getSeasonality(): number {
    const month = new Date().getMonth(); // 0-11
    return Math.sin((month / 12) * 2 * Math.PI); // Seasonal variation
  }

  private calculateUrgencyScore(task: Partial<Task>): number {
    let score = 0;

    if (task.priority === 'URGENT') score += 10;
    else if (task.priority === 'HIGH') score += 7;
    else if (task.priority === 'MEDIUM') score += 4;
    else score += 1;

    // Due date urgency
    const daysUntilDue = this.calculateDaysUntilDue(task.dueDate);
    if (daysUntilDue >= 0) {
      if (daysUntilDue === 0) score += 5;
      else if (daysUntilDue <= 1) score += 4;
      else if (daysUntilDue <= 3) score += 3;
      else if (daysUntilDue <= 7) score += 2;
    }

    return Math.min(10, score);
  }

  private calculateImportanceScore(task: Partial<Task>, userContext: UserContext): number {
    let score = 5; // Base importance

    // Priority indicates importance
    if (task.priority === 'URGENT') score += 3;
    else if (task.priority === 'HIGH') score += 2;
    else if (task.priority === 'MEDIUM') score += 1;

    // Description length indicates thought put into task
    if (task.description && task.description.length > 100) score += 1;

    // User's current workload affects importance perception
    if (userContext.productivityScore < 30) score += 1; // Low productivity means high importance

    return Math.min(10, score);
  }

  /**
   * Helper methods for user context
   */
  private async countCurrentTasks(userId: string): Promise<number> {
    return this.prisma.task.count({
      where: {
        userId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });
  }

  private async countCompletedTasks(userId: string): Promise<number> {
    return this.prisma.task.count({
      where: {
        userId: userId,
        status: 'COMPLETED'
      }
    });
  }

  private async countOverdueTasks(userId: string): Promise<number> {
    const now = new Date();
    return this.prisma.task.count({
      where: {
        userId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now }
      }
    });
  }

  private async calculateAverageCompletionTime(userId: string): Promise<number> {
    const completedTasks = await this.prisma.task.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime();
      return sum + completionTime;
    }, 0);

    // Return average completion time in hours
    return totalTime / completedTasks.length / (1000 * 60 * 60);
  }

  private calculateProductivityScore(stats: {
    completed: number;
    overdue: number;
    current: number;
    avgCompletion: number;
  }): number {
    let score = 50; // Base score

    // Completion rate boost
    const total = stats.completed + stats.overdue + stats.current;
    if (total > 0) {
      const completionRate = stats.completed / total;
      score += completionRate * 30;
    }

    // Overdue penalty
    if (total > 0) {
      const overdueRate = stats.overdue / total;
      score -= overdueRate * 20;
    }

    // Fast completion bonus
    if (stats.avgCompletion > 0 && stats.avgCompletion < 24) { // Less than 24 hours
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}