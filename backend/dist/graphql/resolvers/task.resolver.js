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
exports.TaskResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const rate_limit_guard_1 = require("../../common/guards/rate-limit.guard");
const task_model_1 = require("../models/task.model");
const task_media_model_1 = require("../models/task-media.model");
const task_share_model_1 = require("../models/task-share.model");
const task_comment_model_1 = require("../models/task-comment.model");
const user_model_1 = require("../models/user.model");
const paginated_result_model_1 = require("../models/paginated-result.model");
const task_input_1 = require("../inputs/task.input");
const task_share_input_1 = require("../inputs/task-share.input");
const task_comment_input_1 = require("../inputs/task-comment.input");
const task_media_input_1 = require("../inputs/task-media.input");
const task_service_1 = require("../../services/task.service");
const task_share_service_1 = require("../../services/task-share.service");
const task_comment_service_1 = require("../../services/task-comment.service");
const task_media_service_1 = require("../../services/task-media.service");
const user_service_1 = require("../../services/user.service");
const pubsub_service_1 = require("../../services/pubsub.service");
const task_data_loader_service_1 = require("../../common/data-loaders/task-data-loader.service");
const cache_invalidation_service_1 = require("../../common/services/cache-invalidation.service");
let TaskResolver = class TaskResolver {
    constructor(taskService, taskShareService, taskCommentService, taskMediaService, userService, pubSubService, taskDataLoaderService, cacheInvalidationService) {
        this.taskService = taskService;
        this.taskShareService = taskShareService;
        this.taskCommentService = taskCommentService;
        this.taskMediaService = taskMediaService;
        this.userService = userService;
        this.pubSubService = pubSubService;
        this.taskDataLoaderService = taskDataLoaderService;
        this.cacheInvalidationService = cacheInvalidationService;
    }
    async getTasks(context, filters) {
        const userId = context.req.user.id;
        return this.taskService.findByUserId(userId, filters);
    }
    async getTaskById(id, context) {
        const userId = context.req.user.id;
        return this.taskService.findById(id, userId);
    }
    async getTask(id, context) {
        const userId = context.req.user.id;
        return this.taskService.findById(id, userId);
    }
    async getSharedTasks(context, filters) {
        const userId = context.req.user.id;
        return this.taskService.findSharedTasks(userId, filters);
    }
    async getTasksPaginated(context, page, limit, filters) {
        const userId = context.req.user.id;
        const result = await this.taskService.findPaginated(userId, page, limit, filters);
        return {
            data: result.data,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
                hasNextPage: page < Math.ceil(result.total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async createTask(input, context) {
        const userId = context.req.user.id;
        const task = await this.taskService.create(input, userId);
        console.log('Publishing taskCreated with task:', task);
        this.pubSubService.publishTaskCreated(task);
        await this.cacheInvalidationService.invalidateTaskCache(task.id, userId);
        return task;
    }
    async updateTask(input, context) {
        const userId = context.req.user.id;
        const task = await this.taskService.update(input, userId);
        console.log('Publishing taskUpdated with task:', task);
        try {
            this.pubSubService.publishTaskUpdated(task);
            console.log('Successfully published taskUpdated event');
        }
        catch (error) {
            console.error('Failed to publish taskUpdated event:', error);
        }
        await this.cacheInvalidationService.invalidateTaskCache(task.id, userId);
        return task;
    }
    async deleteTask(id, context) {
        const userId = context.req.user.id;
        await this.taskService.delete(id, userId);
        await this.pubSubService.publish('taskDeleted', { taskDeleted: { id } });
        await this.cacheInvalidationService.invalidateTaskCache(id, userId);
        return true;
    }
    async shareTask(input, context) {
        const userId = context.req.user.id;
        const share = await this.taskShareService.create(input, userId);
        await this.pubSubService.publish('taskShared', { taskShared: share });
        return share;
    }
    async createTaskComment(input, context) {
        const userId = context.req.user.id;
        const comment = await this.taskCommentService.create(input, userId);
        console.log('Publishing taskCommentCreated with comment:', comment);
        try {
            this.pubSubService.publishTaskCommentCreated(comment);
            console.log('Successfully published taskCommentCreated event');
        }
        catch (error) {
            console.error('Failed to publish taskCommentCreated event:', error);
        }
        await this.cacheInvalidationService.invalidateCommentCache(input.taskId, userId);
        return comment;
    }
    async createSubtask(parentId, input, context) {
        const userId = context.req.user.id;
        const subtask = await this.taskService.createSubtask(parentId, input, userId);
        await this.cacheInvalidationService.invalidateTaskCache(parentId, userId);
        await this.cacheInvalidationService.invalidateTaskCache(subtask.id, userId);
        return subtask;
    }
    async uploadTaskMedia(input, context) {
        const userId = context.req.user.id;
        const mediaData = {
            type: input.type,
            url: input.url,
            filename: input.filename,
            size: input.size,
            mimeType: input.mimeType,
            caption: input.caption,
        };
        const media = await this.taskMediaService.create(input.taskId, userId, mediaData);
        await this.cacheInvalidationService.invalidateTaskCache(input.taskId, userId);
        return media;
    }
    async deleteTaskMedia(mediaId, context) {
        const userId = context.req.user.id;
        await this.taskMediaService.delete(mediaId, userId);
        return true;
    }
    taskCreated() {
        return this.pubSubService.getTaskCreatedIterator();
    }
    taskUpdated() {
        return this.pubSubService.getTaskUpdatedIterator();
    }
    taskCommentCreated() {
        return this.pubSubService.getTaskCommentCreatedIterator();
    }
    async author(task) {
        return this.taskDataLoaderService.loadUser(task.userId);
    }
    async progress(task, context) {
        const userId = context.req.user.id;
        const progressData = await this.taskService.getTaskProgress(task.id, userId);
        return progressData.progressPercentage;
    }
    async media(task) {
        return this.taskDataLoaderService.loadMedia(task.id);
    }
    async shares(task) {
        return this.taskShareService.findByTaskId(task.id);
    }
    async comments(task) {
        return this.taskDataLoaderService.loadComments(task.id);
    }
    async commentCount(task) {
        const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
        return counts.comments;
    }
    async mediaCount(task) {
        const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
        return counts.media;
    }
    async subtaskCount(task) {
        const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
        return counts.subtasks;
    }
    async subtasks(task, context) {
        const userId = context.req.user.id;
        return this.taskService.findSubtasks(task.id, userId);
    }
    async parent(task, context) {
        if (!task.parentId)
            return null;
        const userId = context.req.user.id;
        return this.taskService.findById(task.parentId, userId);
    }
    async commentAuthor(comment) {
        return this.taskDataLoaderService.loadUser(comment.userId);
    }
    async commentParent(comment) {
        if (!comment.parentId)
            return null;
        return this.taskCommentService.findById(comment.parentId);
    }
    async commentReplies(comment) {
        return this.taskCommentService.findReplies(comment.id);
    }
    async getProjectTasks(projectId, filters, context) {
        const userId = context.req.user.id;
        return this.taskService.findByProjectId(projectId, userId, filters);
    }
    async createProjectTask(projectId, input, context) {
        const userId = context.req.user.id;
        return this.taskService.createProjectTask(projectId, userId, input);
    }
    async updateTaskOrder(taskId, newOrder, context) {
        const userId = context.req.user.id;
        return this.taskService.updateTaskOrder(taskId, userId, newOrder);
    }
    async assignTask(taskId, userIds, context) {
        const userId = context.req.user.id;
        return this.taskService.assignTask(taskId, userId, userIds);
    }
};
exports.TaskResolver = TaskResolver;
__decorate([
    (0, graphql_1.Query)(() => [task_model_1.Task], { name: 'getTasks' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, task_input_1.TaskFilterInput]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getTasks", null);
__decorate([
    (0, graphql_1.Query)(() => task_model_1.Task, { name: 'getTaskById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getTaskById", null);
__decorate([
    (0, graphql_1.Query)(() => task_model_1.Task, { name: 'getTask', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getTask", null);
__decorate([
    (0, graphql_1.Query)(() => [task_model_1.Task], { name: 'getSharedTasks' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, task_input_1.TaskFilterInput]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getSharedTasks", null);
__decorate([
    (0, graphql_1.Query)(() => paginated_result_model_1.TasksPaginatedResult, { name: 'getTasksPaginated' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __param(3, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, task_input_1.TaskFilterInput]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getTasksPaginated", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, { name: 'createTask' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_input_1.CreateTaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, { name: 'updateTask' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_input_1.UpdateTaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "updateTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteTask' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "deleteTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_share_model_1.TaskShare, { name: 'shareTask' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_share_input_1.ShareTaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "shareTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_comment_model_1.TaskComment, { name: 'createTaskComment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_comment_input_1.CreateTaskCommentInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createTaskComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, { name: 'createSubtask' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('parentId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, task_input_1.CreateTaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createSubtask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_media_model_1.TaskMedia, { name: 'uploadTaskMedia' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_media_input_1.UploadTaskMediaInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "uploadTaskMedia", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteTaskMedia' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rate_limit_guard_1.RateLimitGuard),
    __param(0, (0, graphql_1.Args)('mediaId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "deleteTaskMedia", null);
__decorate([
    (0, graphql_1.Subscription)(() => task_model_1.Task, { name: 'taskCreated', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "taskCreated", null);
__decorate([
    (0, graphql_1.Subscription)(() => task_model_1.Task, { name: 'taskUpdated', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "taskUpdated", null);
__decorate([
    (0, graphql_1.Subscription)(() => task_comment_model_1.TaskComment, { name: 'taskCommentCreated', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "taskCommentCreated", null);
__decorate([
    (0, graphql_1.ResolveField)(() => user_model_1.User),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "author", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "progress", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [task_media_model_1.TaskMedia]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "media", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [task_share_model_1.TaskShare]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "shares", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [task_comment_model_1.TaskComment]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "comments", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "commentCount", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "mediaCount", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "subtaskCount", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [task_model_1.Task]),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "subtasks", null);
__decorate([
    (0, graphql_1.ResolveField)(() => task_model_1.Task, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_model_1.Task, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "parent", null);
__decorate([
    (0, graphql_1.ResolveField)(() => user_model_1.User),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_comment_model_1.TaskComment]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "commentAuthor", null);
__decorate([
    (0, graphql_1.ResolveField)(() => task_comment_model_1.TaskComment, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_comment_model_1.TaskComment]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "commentParent", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [task_comment_model_1.TaskComment]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_comment_model_1.TaskComment]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "commentReplies", null);
__decorate([
    (0, graphql_1.Query)(() => [task_model_1.Task], {
        name: 'projectTasks',
        description: 'Get tasks by project ID (for TaskFeed)'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, task_input_1.TaskFilterInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "getProjectTasks", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, {
        name: 'createProjectTask',
        description: 'Create task in project with @mentions'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, task_input_1.CreateTaskInput, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createProjectTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, {
        name: 'updateTaskOrder',
        description: 'Update task order for drag & drop'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('taskId')),
    __param(1, (0, graphql_1.Args)('newOrder', { type: () => graphql_1.Int })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "updateTaskOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_model_1.Task, {
        name: 'assignTask',
        description: 'Assign task to users'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('taskId')),
    __param(1, (0, graphql_1.Args)('userIds', { type: () => [graphql_1.ID] })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "assignTask", null);
exports.TaskResolver = TaskResolver = __decorate([
    (0, graphql_1.Resolver)(() => task_model_1.Task),
    __metadata("design:paramtypes", [task_service_1.TaskService,
        task_share_service_1.TaskShareService,
        task_comment_service_1.TaskCommentService,
        task_media_service_1.TaskMediaService,
        user_service_1.UserService,
        pubsub_service_1.PubSubService,
        task_data_loader_service_1.TaskDataLoaderService,
        cache_invalidation_service_1.CacheInvalidationService])
], TaskResolver);
//# sourceMappingURL=task.resolver.js.map