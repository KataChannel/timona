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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskCount = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_model_1 = require("./user.model");
const task_media_model_1 = require("./task-media.model");
const task_share_model_1 = require("./task-share.model");
const task_comment_model_1 = require("./task-comment.model");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.TaskCategory, {
    name: 'TaskCategory',
    description: 'The category of a task',
});
(0, graphql_1.registerEnumType)(client_1.TaskPriority, {
    name: 'TaskPriority',
    description: 'The priority level of a task',
});
(0, graphql_1.registerEnumType)(client_1.TaskStatus, {
    name: 'TaskStatus',
    description: 'The status of a task',
});
let TaskCount = class TaskCount {
};
exports.TaskCount = TaskCount;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TaskCount.prototype, "comments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TaskCount.prototype, "subtasks", void 0);
exports.TaskCount = TaskCount = __decorate([
    (0, graphql_1.ObjectType)()
], TaskCount);
let Task = class Task {
};
exports.Task = Task;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskCategory),
    __metadata("design:type", String)
], Task.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskPriority),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskStatus),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "dueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Task.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Task.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Task.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Task, { nullable: true }),
    __metadata("design:type", Task)
], Task.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Task], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "subtasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "progress", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_media_model_1.TaskMedia], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "media", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_share_model_1.TaskShare], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "shares", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_comment_model_1.TaskComment], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "comments", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "projectId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "mentions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Task.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => TaskCount, { nullable: true }),
    __metadata("design:type", TaskCount)
], Task.prototype, "_count", void 0);
exports.Task = Task = __decorate([
    (0, graphql_1.ObjectType)()
], Task);
//# sourceMappingURL=task.model.js.map