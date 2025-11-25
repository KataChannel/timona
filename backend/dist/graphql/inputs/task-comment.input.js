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
exports.UpdateTaskCommentInput = exports.CreateTaskCommentInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateTaskCommentInput = class CreateTaskCommentInput {
};
exports.CreateTaskCommentInput = CreateTaskCommentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskCommentInput.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskCommentInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskCommentInput.prototype, "parentId", void 0);
exports.CreateTaskCommentInput = CreateTaskCommentInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTaskCommentInput);
let UpdateTaskCommentInput = class UpdateTaskCommentInput {
};
exports.UpdateTaskCommentInput = UpdateTaskCommentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskCommentInput.prototype, "commentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskCommentInput.prototype, "content", void 0);
exports.UpdateTaskCommentInput = UpdateTaskCommentInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTaskCommentInput);
//# sourceMappingURL=task-comment.input.js.map