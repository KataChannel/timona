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
exports.TaskFilterInput = exports.UpdateTaskInput = exports.CreateTaskInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let CreateTaskInput = class CreateTaskInput {
};
exports.CreateTaskInput = CreateTaskInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskCategory),
    (0, class_validator_1.IsEnum)(client_1.TaskCategory),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskPriority),
    (0, class_validator_1.IsEnum)(client_1.TaskPriority),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskStatus),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "dueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskInput.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskInput.prototype, "mentions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTaskInput.prototype, "order", void 0);
exports.CreateTaskInput = CreateTaskInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTaskInput);
let UpdateTaskInput = class UpdateTaskInput {
};
exports.UpdateTaskInput = UpdateTaskInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskCategory, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskCategory),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskPriority, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskPriority),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskStatus),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTaskInput.prototype, "dueDate", void 0);
exports.UpdateTaskInput = UpdateTaskInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTaskInput);
let TaskFilterInput = class TaskFilterInput {
};
exports.TaskFilterInput = TaskFilterInput;
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskCategory, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskCategory),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskPriority, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskPriority),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TaskStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaskStatus),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "dueBefore", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaskFilterInput.prototype, "dueAfter", void 0);
exports.TaskFilterInput = TaskFilterInput = __decorate([
    (0, graphql_1.InputType)()
], TaskFilterInput);
//# sourceMappingURL=task.input.js.map