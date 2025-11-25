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
var IntelligentSuggestionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentSuggestionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IntelligentSuggestionsService = IntelligentSuggestionsService_1 = class IntelligentSuggestionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(IntelligentSuggestionsService_1.name);
        this.taskKeywords = [
            'need to', 'should', 'must', 'have to', 'require', 'implement',
            'create', 'build', 'develop', 'design', 'fix', 'update',
            'research', 'analyze', 'review', 'test', 'deploy', 'optimize'
        ];
        this.urgencyKeywords = [
            'urgent', 'asap', 'immediately', 'critical', 'emergency',
            'deadline', 'due', 'overdue', 'rush', 'priority'
        ];
        this.complexityKeywords = {
            high: ['complex', 'difficult', 'challenging', 'advanced', 'intricate', 'comprehensive'],
            medium: ['moderate', 'standard', 'typical', 'regular', 'normal'],
            low: ['simple', 'easy', 'basic', 'straightforward', 'quick', 'minor']
        };
    }
    async generateSmartSuggestions(userId) {
        this.logger.debug(`Generating smart suggestions for user: ${userId}`);
        const suggestions = [];
        const userTasks = await this.getUserTaskData(userId);
        suggestions.push(...(await this.generateTaskOptimizationSuggestions(userTasks, userId)));
        suggestions.push(...(await this.generateWorkloadBalanceSuggestions(userTasks, userId)));
        suggestions.push(...(await this.generateDeadlineAdjustmentSuggestions(userTasks, userId)));
        suggestions.push(...(await this.generateProcessImprovementSuggestions(userTasks, userId)));
        return suggestions
            .sort((a, b) => {
            const scoreA = a.confidence * (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1);
            const scoreB = b.confidence * (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1);
            return scoreB - scoreA;
        })
            .slice(0, 10);
    }
    async analyzeContent(content, userId) {
        this.logger.debug(`Analyzing content: ${content.substring(0, 100)}...`);
        const words = this.tokenizeText(content);
        const sentences = this.splitIntoSentences(content);
        const extractedTasks = this.extractTasksFromText(sentences);
        const suggestedTags = this.extractTags(words);
        const estimatedComplexity = this.estimateComplexityFromText(content);
        const suggestedPriority = this.suggestPriorityFromText(content);
        const relatedTasks = await this.findRelatedTasks(content, userId);
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
    async generateTasksFromNotes(notes, userId) {
        const analysis = await this.analyzeContent(notes, userId);
        return analysis.extractedTasks.map(taskTitle => ({
            title: taskTitle,
            description: this.generateTaskDescription(taskTitle, notes),
            priority: analysis.suggestedPriority,
            userId,
            status: 'PENDING',
            tags: analysis.suggestedTags.slice(0, 3)
        }));
    }
    async getUserTaskData(userId) {
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
    async generateTaskOptimizationSuggestions(tasks, userId) {
        const suggestions = [];
        const complexTasks = tasks.filter(task => task.description && task.description.length > 500 &&
            task.status === 'PENDING');
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
    async generateWorkloadBalanceSuggestions(tasks, userId) {
        const suggestions = [];
        const pendingTasks = tasks.filter(t => t.status === 'PENDING');
        const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED');
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
    async generateDeadlineAdjustmentSuggestions(tasks, userId) {
        const suggestions = [];
        const upcomingTasks = tasks.filter(t => {
            if (!t.dueDate || t.status === 'COMPLETED')
                return false;
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
    async generateProcessImprovementSuggestions(tasks, userId) {
        const suggestions = [];
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
    tokenizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
    splitIntoSentences(text) {
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }
    extractTasksFromText(sentences) {
        const tasks = [];
        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            const hasTaskKeyword = this.taskKeywords.some(keyword => lowerSentence.includes(keyword));
            if (hasTaskKeyword) {
                let task = sentence
                    .replace(/^(we |i |you )/i, '')
                    .replace(/^(need to |should |must |have to )/i, '')
                    .trim();
                if (task.length > 10 && task.length < 100) {
                    tasks.push(task.charAt(0).toUpperCase() + task.slice(1));
                }
            }
        }
        return tasks.slice(0, 5);
    }
    extractTags(words) {
        const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const wordFreq = new Map();
        for (const word of words) {
            if (!commonWords.has(word) && word.length > 3) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        }
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }
    estimateComplexityFromText(text) {
        const words = this.tokenizeText(text);
        let complexityScore = 5;
        for (const word of words) {
            if (this.complexityKeywords.high.includes(word))
                complexityScore += 2;
            if (this.complexityKeywords.medium.includes(word))
                complexityScore += 0;
            if (this.complexityKeywords.low.includes(word))
                complexityScore -= 2;
        }
        if (text.length > 500)
            complexityScore += 2;
        if (text.length > 1000)
            complexityScore += 2;
        return Math.max(1, Math.min(10, complexityScore));
    }
    suggestPriorityFromText(text) {
        const lowerText = text.toLowerCase();
        let urgencyScore = 0;
        for (const keyword of this.urgencyKeywords) {
            if (lowerText.includes(keyword)) {
                urgencyScore += keyword === 'urgent' || keyword === 'critical' ? 3 : 1;
            }
        }
        if (urgencyScore >= 5)
            return 'URGENT';
        if (urgencyScore >= 3)
            return 'HIGH';
        if (urgencyScore >= 1)
            return 'MEDIUM';
        return 'LOW';
    }
    async findRelatedTasks(content, userId) {
        const contentWords = new Set(this.tokenizeText(content));
        const recentTasks = await this.prisma.task.findMany({
            where: { userId },
            take: 50,
            orderBy: { createdAt: 'desc' }
        });
        const relatedTasks = [];
        for (const task of recentTasks) {
            const taskText = `${task.title} ${task.description || ''}`;
            const taskWords = new Set(this.tokenizeText(taskText));
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
    extractKeyPhrases(words) {
        const phrases = [];
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i + 1]}`;
            if (phrase.length > 6 && phrase.length < 20) {
                phrases.push(phrase);
            }
        }
        return phrases.slice(0, 5);
    }
    findSimilarTasks(tasks) {
        const pendingTasks = tasks.filter(t => t.status === 'PENDING');
        const similarGroups = new Map();
        for (const task of pendingTasks) {
            const words = this.tokenizeText(task.title);
            const key = words.slice(0, 2).join(' ');
            if (!similarGroups.has(key)) {
                similarGroups.set(key, []);
            }
            similarGroups.get(key).push(task);
        }
        let largestGroup = [];
        const groupsArray = Array.from(similarGroups.values());
        for (const group of groupsArray) {
            if (group.length > largestGroup.length) {
                largestGroup = group;
            }
        }
        return largestGroup;
    }
    generateTaskDescription(title, context) {
        const sentences = this.splitIntoSentences(context);
        const relevantSentences = sentences.filter(sentence => this.tokenizeText(sentence).some(word => this.tokenizeText(title).includes(word)));
        return relevantSentences.slice(0, 2).join('. ') || title;
    }
};
exports.IntelligentSuggestionsService = IntelligentSuggestionsService;
exports.IntelligentSuggestionsService = IntelligentSuggestionsService = IntelligentSuggestionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntelligentSuggestionsService);
//# sourceMappingURL=intelligent-suggestions.service.js.map