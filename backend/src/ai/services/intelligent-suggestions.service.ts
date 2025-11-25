import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
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

@Injectable()
export class IntelligentSuggestionsService {
  private readonly logger = new Logger(IntelligentSuggestionsService.name);

  // Simple keyword patterns for task recognition
  private readonly taskKeywords = [
    'need to', 'should', 'must', 'have to', 'require', 'implement',
    'create', 'build', 'develop', 'design', 'fix', 'update',
    'research', 'analyze', 'review', 'test', 'deploy', 'optimize'
  ];

  private readonly urgencyKeywords = [
    'urgent', 'asap', 'immediately', 'critical', 'emergency',
    'deadline', 'due', 'overdue', 'rush', 'priority'
  ];

  private readonly complexityKeywords = {
    high: ['complex', 'difficult', 'challenging', 'advanced', 'intricate', 'comprehensive'],
    medium: ['moderate', 'standard', 'typical', 'regular', 'normal'],
    low: ['simple', 'easy', 'basic', 'straightforward', 'quick', 'minor']
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate intelligent suggestions based on user behavior and task patterns
   */
  async generateSmartSuggestions(userId: string): Promise<SmartSuggestion[]> {
    this.logger.debug(`Generating smart suggestions for user: ${userId}`);

    const suggestions: SmartSuggestion[] = [];

    // Get user's task data for analysis
    const userTasks = await this.getUserTaskData(userId);
    
    // Generate different types of suggestions
    suggestions.push(...(await this.generateTaskOptimizationSuggestions(userTasks, userId)));
    suggestions.push(...(await this.generateWorkloadBalanceSuggestions(userTasks, userId)));
    suggestions.push(...(await this.generateDeadlineAdjustmentSuggestions(userTasks, userId)));
    suggestions.push(...(await this.generateProcessImprovementSuggestions(userTasks, userId)));

    // Sort by confidence and impact
    return suggestions
      .sort((a, b) => {
        const scoreA = a.confidence * (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1);
        const scoreB = b.confidence * (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1);
        return scoreB - scoreA;
      })
      .slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Analyze text content and extract task-related information
   */
  async analyzeContent(content: string, userId: string): Promise<ContentAnalysis> {
    this.logger.debug(`Analyzing content: ${content.substring(0, 100)}...`);

    const words = this.tokenizeText(content);
    const sentences = this.splitIntoSentences(content);

    // Extract potential tasks
    const extractedTasks = this.extractTasksFromText(sentences);
    
    // Suggest tags based on content
    const suggestedTags = this.extractTags(words);
    
    // Estimate complexity
    const estimatedComplexity = this.estimateComplexityFromText(content);
    
    // Suggest priority
    const suggestedPriority = this.suggestPriorityFromText(content);
    
    // Find related tasks
    const relatedTasks = await this.findRelatedTasks(content, userId);
    
    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(words);

    return {
      extractedTasks,
      suggestedTags,
      estimatedComplexity,
      suggestedPriority,
      relatedTasks,
      keyPhrases
    };
  }

  /**
   * Generate task suggestions from meeting notes or documents
   */
  async generateTasksFromNotes(notes: string, userId: string): Promise<Partial<Task>[]> {
    const analysis = await this.analyzeContent(notes, userId);
    
    return analysis.extractedTasks.map(taskTitle => ({
      title: taskTitle,
      description: this.generateTaskDescription(taskTitle, notes),
      priority: analysis.suggestedPriority,
      userId,
      status: 'PENDING' as TaskStatus,
      tags: analysis.suggestedTags.slice(0, 3) // Limit to 3 tags
    }));
  }

  /**
   * Get user task data for analysis
   */
  private async getUserTaskData(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  /**
   * Generate task optimization suggestions
   */
  private async generateTaskOptimizationSuggestions(
    tasks: Task[], 
    userId: string
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    // Identify tasks that could be broken down
    const complexTasks = tasks.filter(task => 
      task.description && task.description.length > 500 && 
      task.status === 'PENDING'
    );

    if (complexTasks.length > 0) {
      suggestions.push({
        type: 'task_optimization',
        title: 'Break down complex tasks',
        description: `You have ${complexTasks.length} complex tasks that could be broken into smaller, manageable pieces`,
        confidence: 0.8,
        impact: 'high',
        reasoning: [
          'Large tasks are harder to track and complete',
          'Breaking tasks down improves completion rates',
          'Smaller tasks provide better progress visibility'
        ],
        action: {
          type: 'update_task',
          parameters: { taskIds: complexTasks.map(t => t.id) }
        }
      });
    }

    // Identify similar tasks that could be batched
    const similarTasks = this.findSimilarTasks(tasks);
    if (similarTasks.length > 1) {
      suggestions.push({
        type: 'task_optimization',
        title: 'Batch similar tasks',
        description: `Consider batching ${similarTasks.length} similar tasks for increased efficiency`,
        confidence: 0.7,
        impact: 'medium',
        reasoning: [
          'Batching similar tasks reduces context switching',
          'Improved focus and efficiency',
          'Better time management'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Generate workload balance suggestions
   */
  private async generateWorkloadBalanceSuggestions(
    tasks: Task[], 
    userId: string
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
    );

    // Too many pending tasks
    if (pendingTasks.length > 15) {
      suggestions.push({
        type: 'workload_balance',
        title: 'High task volume detected',
        description: `You have ${pendingTasks.length} pending tasks. Consider prioritizing or delegating some.`,
        confidence: 0.9,
        impact: 'high',
        reasoning: [
          'High task volume can lead to overwhelm',
          'Prioritization helps focus on important work',
          'Delegation can distribute workload effectively'
        ]
      });
    }

    // Overdue tasks accumulating
    if (overdueTasks.length > 3) {
      suggestions.push({
        type: 'workload_balance',
        title: 'Address overdue tasks',
        description: `${overdueTasks.length} tasks are overdue. Consider rescheduling or reprioritizing.`,
        confidence: 0.95,
        impact: 'high',
        reasoning: [
          'Overdue tasks indicate capacity issues',
          'Rescheduling prevents further delays',
          'Regular reviews prevent task accumulation'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Generate deadline adjustment suggestions
   */
  private async generateDeadlineAdjustmentSuggestions(
    tasks: Task[], 
    userId: string
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    const upcomingTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    });

    if (upcomingTasks.length > 5) {
      suggestions.push({
        type: 'deadline_adjustment',
        title: 'Multiple upcoming deadlines',
        description: `${upcomingTasks.length} tasks are due within 3 days. Consider adjusting some deadlines.`,
        confidence: 0.8,
        impact: 'medium',
        reasoning: [
          'Clustered deadlines create pressure',
          'Spreading deadlines improves quality',
          'Realistic scheduling reduces stress'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Generate process improvement suggestions
   */
  private async generateProcessImprovementSuggestions(
    tasks: Task[], 
    userId: string
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    // Calculate completion rate
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const completionRate = completedTasks / Math.max(tasks.length, 1);

    if (completionRate < 0.7) {
      suggestions.push({
        type: 'process_improvement',
        title: 'Improve task completion rate',
        description: `Your completion rate is ${(completionRate * 100).toFixed(0)}%. Consider process improvements.`,
        confidence: 0.85,
        impact: 'high',
        reasoning: [
          'Low completion rates indicate process issues',
          'Better planning improves outcomes',
          'Regular reviews help identify blockers'
        ]
      });
    }

    // Check for tasks without descriptions
    const tasksWithoutDescription = tasks.filter(t => !t.description || t.description.length < 10).length;
    if (tasksWithoutDescription > tasks.length * 0.3) {
      suggestions.push({
        type: 'process_improvement',
        title: 'Add detailed task descriptions',
        description: `${tasksWithoutDescription} tasks lack detailed descriptions. This helps with clarity and completion.`,
        confidence: 0.7,
        impact: 'medium',
        reasoning: [
          'Detailed descriptions improve clarity',
          'Clear requirements reduce confusion',
          'Better documentation aids completion'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Simple text tokenization
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  /**
   * Extract potential tasks from text
   */
  private extractTasksFromText(sentences: string[]): string[] {
    const tasks: string[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains task keywords
      const hasTaskKeyword = this.taskKeywords.some(keyword => 
        lowerSentence.includes(keyword)
      );

      if (hasTaskKeyword) {
        // Clean up and extract the task
        let task = sentence
          .replace(/^(we |i |you )/i, '')
          .replace(/^(need to |should |must |have to )/i, '')
          .trim();

        if (task.length > 10 && task.length < 100) {
          tasks.push(task.charAt(0).toUpperCase() + task.slice(1));
        }
      }
    }

    return tasks.slice(0, 5); // Limit to 5 tasks
  }

  /**
   * Extract tags from text
   */
  private extractTags(words: string[]): string[] {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const wordFreq = new Map<string, number>();

    // Count word frequency
    for (const word of words) {
      if (!commonWords.has(word) && word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    // Return most frequent words as tags
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Estimate complexity from text content
   */
  private estimateComplexityFromText(text: string): number {
    const words = this.tokenizeText(text);
    let complexityScore = 5; // Base score

    // Check for complexity indicators
    for (const word of words) {
      if (this.complexityKeywords.high.includes(word)) complexityScore += 2;
      if (this.complexityKeywords.medium.includes(word)) complexityScore += 0;
      if (this.complexityKeywords.low.includes(word)) complexityScore -= 2;
    }

    // Length indicates complexity
    if (text.length > 500) complexityScore += 2;
    if (text.length > 1000) complexityScore += 2;

    return Math.max(1, Math.min(10, complexityScore));
  }

  /**
   * Suggest priority from text content
   */
  private suggestPriorityFromText(text: string): TaskPriority {
    const lowerText = text.toLowerCase();
    let urgencyScore = 0;

    // Check for urgency keywords
    for (const keyword of this.urgencyKeywords) {
      if (lowerText.includes(keyword)) {
        urgencyScore += keyword === 'urgent' || keyword === 'critical' ? 3 : 1;
      }
    }

    if (urgencyScore >= 5) return 'URGENT';
    if (urgencyScore >= 3) return 'HIGH';
    if (urgencyScore >= 1) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Find related tasks based on content similarity
   */
  private async findRelatedTasks(content: string, userId: string): Promise<string[]> {
    const contentWords = new Set(this.tokenizeText(content));
    const recentTasks = await this.prisma.task.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    const relatedTasks: { task: Task; similarity: number }[] = [];

    for (const task of recentTasks) {
      const taskText = `${task.title} ${task.description || ''}`;
      const taskWords = new Set(this.tokenizeText(taskText));
      
      // Calculate Jaccard similarity
      const contentWordsArray = Array.from(contentWords);
      const taskWordsArray = Array.from(taskWords);
      const intersectionArray = contentWordsArray.filter(x => taskWords.has(x));
      const unionArray = [...contentWordsArray, ...taskWordsArray.filter(x => !contentWords.has(x))];
      const similarity = intersectionArray.length / unionArray.length;

      if (similarity > 0.1) {
        relatedTasks.push({ task, similarity });
      }
    }

    return relatedTasks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.task.title);
  }

  /**
   * Extract key phrases (simplified version)
   */
  private extractKeyPhrases(words: string[]): string[] {
    // This is a simplified version - in production, you'd use more sophisticated NLP
    const phrases: string[] = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 6 && phrase.length < 20) {
        phrases.push(phrase);
      }
    }

    return phrases.slice(0, 5);
  }

  /**
   * Find similar tasks for batching
   */
  private findSimilarTasks(tasks: Task[]): Task[] {
    // Simple similarity check based on title words
    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const similarGroups = new Map<string, Task[]>();

    for (const task of pendingTasks) {
      const words = this.tokenizeText(task.title);
      const key = words.slice(0, 2).join(' '); // Use first 2 words as similarity key
      
      if (!similarGroups.has(key)) {
        similarGroups.set(key, []);
      }
      similarGroups.get(key)!.push(task);
    }

    // Find the largest group of similar tasks
    let largestGroup: Task[] = [];
    const groupsArray = Array.from(similarGroups.values());
    for (const group of groupsArray) {
      if (group.length > largestGroup.length) {
        largestGroup = group;
      }
    }

    return largestGroup;
  }

  /**
   * Generate task description from context
   */
  private generateTaskDescription(title: string, context: string): string {
    const sentences = this.splitIntoSentences(context);
    const relevantSentences = sentences.filter(sentence => 
      this.tokenizeText(sentence).some(word => 
        this.tokenizeText(title).includes(word)
      )
    );

    return relevantSentences.slice(0, 2).join('. ') || title;
  }
}