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
var TaskPrioritizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPrioritizationService = void 0;
const common_1 = require("@nestjs/common");
const feature_extraction_service_1 = require("./feature-extraction.service");
let TaskPrioritizationService = TaskPrioritizationService_1 = class TaskPrioritizationService {
    constructor(featureExtraction) {
        this.featureExtraction = featureExtraction;
        this.logger = new common_1.Logger(TaskPrioritizationService_1.name);
        this.modelWeights = {
            urgency: 0.25,
            importance: 0.25,
            workload: 0.15,
            complexity: 0.15,
            historicalPattern: 0.10,
            contextual: 0.10
        };
    }
    async predictTaskPriority(task, userId) {
        this.logger.debug(`Predicting priority for task: ${task.title}`);
        const userContext = await this.featureExtraction.getUserContext(userId);
        const features = await this.featureExtraction.extractTaskFeatures(task, userContext);
        const priorityScore = this.calculatePriorityScore(features);
        const suggestedPriority = this.mapScoreToPriority(priorityScore);
        const confidence = this.calculateConfidence(features, userContext);
        const reasoning = this.generateReasoning(features, priorityScore);
        const riskFactors = this.identifyRiskFactors(features, userContext);
        const recommendations = this.generateRecommendations(features, userContext, suggestedPriority);
        const prediction = {
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
    async analyzeWorkload(userId) {
        const userContext = await this.featureExtraction.getUserContext(userId);
        const workloadPercentage = (userContext.currentTasks / 20) * 100;
        const shouldTakeOnTask = workloadPercentage < 80;
        const estimatedEffort = this.estimateEffort(userContext);
        const suggestedDeadline = this.suggestDeadline(userContext);
        let workloadImpact = 'low';
        if (workloadPercentage > 60)
            workloadImpact = 'medium';
        if (workloadPercentage > 80)
            workloadImpact = 'high';
        const alternatives = this.generateAlternatives(userContext, workloadPercentage);
        return {
            shouldTakeOnTask,
            estimatedEffort,
            suggestedDeadline,
            workloadImpact,
            alternatives
        };
    }
    calculatePriorityScore(features) {
        let score = 0;
        score += (features.urgencyScore / 10) * this.modelWeights.urgency;
        score += (features.importanceScore / 10) * this.modelWeights.importance;
        const workloadFactor = Math.max(0, 1 - features.currentWorkload / 100);
        score += workloadFactor * this.modelWeights.workload;
        score += (features.taskComplexity / 10) * this.modelWeights.complexity;
        const historicalFactor = this.calculateHistoricalFactor(features);
        score += historicalFactor * this.modelWeights.historicalPattern;
        const contextualFactor = this.calculateContextualFactor(features);
        score += contextualFactor * this.modelWeights.contextual;
        return Math.max(0, Math.min(1, score));
    }
    mapScoreToPriority(score) {
        if (score >= 0.8)
            return 'URGENT';
        if (score >= 0.6)
            return 'HIGH';
        if (score >= 0.3)
            return 'MEDIUM';
        return 'LOW';
    }
    calculateConfidence(features, userContext) {
        let confidence = 0.5;
        if (userContext.completedTasks > 10)
            confidence += 0.2;
        if (userContext.completedTasks > 50)
            confidence += 0.1;
        if (features.hasDueDate)
            confidence += 0.1;
        if (features.similarTasksCompleted > 3)
            confidence += 0.1;
        if (userContext.productivityScore > 70)
            confidence += 0.1;
        return Math.min(1, confidence);
    }
    generateReasoning(features, score) {
        const reasoning = [];
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
    identifyRiskFactors(features, userContext) {
        const risks = [];
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
        if (features.avgCompletionTime > 72) {
            risks.push('Historically slow task completion may affect deadlines');
        }
        return risks;
    }
    generateRecommendations(features, userContext, priority) {
        const recommendations = [];
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
    calculateHistoricalFactor(features) {
        let factor = 0.5;
        const prioritySum = Object.values(features.userPriorityPattern).reduce((sum, val) => sum + val, 0);
        if (prioritySum > 0) {
            factor += features.userPriorityPattern.HIGH * 0.3;
            factor += features.userPriorityPattern.URGENT * 0.2;
        }
        factor += features.completionRate * 0.3;
        factor -= features.procrastinationTendency * 0.2;
        return Math.max(0, Math.min(1, factor));
    }
    calculateContextualFactor(features) {
        let factor = 0.5;
        if (features.timeOfDay >= 9 && features.timeOfDay <= 17) {
            factor += 0.2;
        }
        if (features.dayOfWeek >= 1 && features.dayOfWeek <= 2) {
            factor += 0.1;
        }
        if (features.dayOfWeek === 5 && features.taskComplexity > 6) {
            factor -= 0.1;
        }
        factor += features.seasonality * 0.05;
        return Math.max(0, Math.min(1, factor));
    }
    estimateEffort(userContext) {
        let effort = userContext.averageCompletionTime || 4;
        if (userContext.currentTasks > 10)
            effort *= 1.2;
        if (userContext.productivityScore < 50)
            effort *= 1.5;
        return Math.max(1, Math.round(effort));
    }
    suggestDeadline(userContext) {
        const now = new Date();
        let daysToAdd = 3;
        if (userContext.currentTasks > 15)
            daysToAdd += 2;
        if (userContext.currentTasks > 20)
            daysToAdd += 3;
        if (userContext.productivityScore < 30)
            daysToAdd += 2;
        const deadline = new Date(now);
        deadline.setDate(deadline.getDate() + daysToAdd);
        return deadline;
    }
    generateAlternatives(userContext, workloadPercentage) {
        const alternatives = [];
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
};
exports.TaskPrioritizationService = TaskPrioritizationService;
exports.TaskPrioritizationService = TaskPrioritizationService = TaskPrioritizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [feature_extraction_service_1.FeatureExtractionService])
], TaskPrioritizationService);
//# sourceMappingURL=task-prioritization.service.js.map