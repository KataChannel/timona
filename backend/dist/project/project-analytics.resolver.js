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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const project_analytics_service_1 = require("./project-analytics.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ProjectAnalyticsResolver = class ProjectAnalyticsResolver {
    constructor(projectAnalyticsService) {
        this.projectAnalyticsService = projectAnalyticsService;
    }
    async getProjectAnalytics(projectId, startDate, endDate, userId) {
        const analytics = await this.projectAnalyticsService.getProjectAnalytics(projectId, { startDate, endDate });
        return JSON.stringify(analytics);
    }
    async getTaskStatistics(projectId) {
        const stats = await this.projectAnalyticsService.getTaskStatistics(projectId);
        return JSON.stringify(stats);
    }
    async getMemberStatistics(projectId) {
        const stats = await this.projectAnalyticsService.getMemberStatistics(projectId);
        return JSON.stringify(stats);
    }
    async getTaskVelocity(projectId, days) {
        const velocity = await this.projectAnalyticsService.getTaskVelocity(projectId, days);
        return JSON.stringify(velocity);
    }
    async getProjectHealthScore(projectId) {
        const health = await this.projectAnalyticsService.getProjectHealthScore(projectId);
        return JSON.stringify(health);
    }
    async getUpcomingDeadlines(projectId) {
        const tasks = await this.projectAnalyticsService.getUpcomingDeadlines(projectId);
        return JSON.stringify(tasks);
    }
    async getOverdueTasks(projectId) {
        const tasks = await this.projectAnalyticsService.getOverdueTasks(projectId);
        return JSON.stringify(tasks);
    }
    async getTagStatistics(projectId) {
        const stats = await this.projectAnalyticsService.getTagStatistics(projectId);
        return JSON.stringify(stats);
    }
};
exports.ProjectAnalyticsResolver = ProjectAnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'projectAnalytics',
        description: 'Get comprehensive project analytics (returned as JSON string)',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(2, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getProjectAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'taskStatistics',
        description: 'Get task statistics by status and priority',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getTaskStatistics", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'memberStatistics',
        description: 'Get member performance statistics',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getMemberStatistics", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'taskVelocity',
        description: 'Get task completion velocity',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('days', { defaultValue: 30 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getTaskVelocity", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'projectHealthScore',
        description: 'Get project health score (0-100)',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getProjectHealthScore", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'upcomingDeadlines',
        description: 'Get tasks with upcoming deadlines (next 7 days)',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getUpcomingDeadlines", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'overdueTasks',
        description: 'Get overdue tasks',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getOverdueTasks", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'tagStatistics',
        description: 'Get tag usage statistics',
    }),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAnalyticsResolver.prototype, "getTagStatistics", null);
exports.ProjectAnalyticsResolver = ProjectAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_analytics_service_1.ProjectAnalyticsService])
], ProjectAnalyticsResolver);
//# sourceMappingURL=project-analytics.resolver.js.map