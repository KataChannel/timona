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
exports.UpdateMemberRoleInput = exports.AddMemberInput = exports.UpdateProjectInput = exports.CreateProjectInput = exports.ProjectMemberType = exports.ProjectType = exports.ProjectStats = exports.ProjectUserType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let ProjectUserType = class ProjectUserType {
};
exports.ProjectUserType = ProjectUserType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectUserType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectUserType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectUserType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectUserType.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectUserType.prototype, "avatar", void 0);
exports.ProjectUserType = ProjectUserType = __decorate([
    (0, graphql_1.ObjectType)('ProjectUser')
], ProjectUserType);
let ProjectStats = class ProjectStats {
};
exports.ProjectStats = ProjectStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProjectStats.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProjectStats.prototype, "chatMessages", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProjectStats.prototype, "members", void 0);
exports.ProjectStats = ProjectStats = __decorate([
    (0, graphql_1.ObjectType)('ProjectStats')
], ProjectStats);
let ProjectType = class ProjectType {
};
exports.ProjectType = ProjectType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectType.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProjectType.prototype, "isArchived", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectType.prototype, "ownerId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProjectUserType),
    __metadata("design:type", ProjectUserType)
], ProjectType.prototype, "owner", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ProjectMemberType]),
    __metadata("design:type", Array)
], ProjectType.prototype, "members", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProjectStats, { nullable: true }),
    __metadata("design:type", ProjectStats)
], ProjectType.prototype, "_count", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProjectType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProjectType.prototype, "updatedAt", void 0);
exports.ProjectType = ProjectType = __decorate([
    (0, graphql_1.ObjectType)('Project')
], ProjectType);
let ProjectMemberType = class ProjectMemberType {
};
exports.ProjectMemberType = ProjectMemberType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectMemberType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectMemberType.prototype, "projectId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectMemberType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMemberType.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProjectUserType),
    __metadata("design:type", ProjectUserType)
], ProjectMemberType.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProjectMemberType.prototype, "joinedAt", void 0);
exports.ProjectMemberType = ProjectMemberType = __decorate([
    (0, graphql_1.ObjectType)('ProjectMember')
], ProjectMemberType);
let CreateProjectInput = class CreateProjectInput {
};
exports.CreateProjectInput = CreateProjectInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Project name cannot be empty' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Project name is too long' }),
    __metadata("design:type", String)
], CreateProjectInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateProjectInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Avatar must be a valid URL' }),
    __metadata("design:type", String)
], CreateProjectInput.prototype, "avatar", void 0);
exports.CreateProjectInput = CreateProjectInput = __decorate([
    (0, graphql_1.InputType)('CreateProjectInput')
], CreateProjectInput);
let UpdateProjectInput = class UpdateProjectInput {
};
exports.UpdateProjectInput = UpdateProjectInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateProjectInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateProjectInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateProjectInput.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateProjectInput.prototype, "isArchived", void 0);
exports.UpdateProjectInput = UpdateProjectInput = __decorate([
    (0, graphql_1.InputType)('UpdateProjectInput')
], UpdateProjectInput);
let AddMemberInput = class AddMemberInput {
};
exports.AddMemberInput = AddMemberInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMemberInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'member' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddMemberInput.prototype, "role", void 0);
exports.AddMemberInput = AddMemberInput = __decorate([
    (0, graphql_1.InputType)('AddMemberInput')
], AddMemberInput);
let UpdateMemberRoleInput = class UpdateMemberRoleInput {
};
exports.UpdateMemberRoleInput = UpdateMemberRoleInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UpdateMemberRoleInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateMemberRoleInput.prototype, "role", void 0);
exports.UpdateMemberRoleInput = UpdateMemberRoleInput = __decorate([
    (0, graphql_1.InputType)('UpdateMemberRoleInput')
], UpdateMemberRoleInput);
//# sourceMappingURL=project.dto.js.map