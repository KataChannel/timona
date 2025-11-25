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
exports.AssignUserPermissionInput = exports.PermissionAssignmentInput = exports.AssignUserRoleInput = exports.RoleAssignmentInput = exports.AssignRolePermissionInput = exports.RoleSearchInput = exports.UpdateRoleInput = exports.CreateRoleInput = exports.PermissionSearchInput = exports.UpdatePermissionInput = exports.CreatePermissionInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const graphql_type_json_1 = require("graphql-type-json");
let CreatePermissionInput = class CreatePermissionInput {
};
exports.CreatePermissionInput = CreatePermissionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "resource", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'general' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePermissionInput.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePermissionInput.prototype, "metadata", void 0);
exports.CreatePermissionInput = CreatePermissionInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePermissionInput);
let UpdatePermissionInput = class UpdatePermissionInput {
};
exports.UpdatePermissionInput = UpdatePermissionInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePermissionInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePermissionInput.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePermissionInput.prototype, "metadata", void 0);
exports.UpdatePermissionInput = UpdatePermissionInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePermissionInput);
let PermissionSearchInput = class PermissionSearchInput {
};
exports.PermissionSearchInput = PermissionSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "resource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionSearchInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PermissionSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PermissionSearchInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'asc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], PermissionSearchInput.prototype, "sortOrder", void 0);
exports.PermissionSearchInput = PermissionSearchInput = __decorate([
    (0, graphql_1.InputType)()
], PermissionSearchInput);
let CreateRoleInput = class CreateRoleInput {
};
exports.CreateRoleInput = CreateRoleInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateRoleInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateRoleInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateRoleInput.prototype, "permissionIds", void 0);
exports.CreateRoleInput = CreateRoleInput = __decorate([
    (0, graphql_1.InputType)()
], CreateRoleInput);
let UpdateRoleInput = class UpdateRoleInput {
};
exports.UpdateRoleInput = UpdateRoleInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleInput.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateRoleInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRoleInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateRoleInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateRoleInput.prototype, "metadata", void 0);
exports.UpdateRoleInput = UpdateRoleInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateRoleInput);
let RoleSearchInput = class RoleSearchInput {
};
exports.RoleSearchInput = RoleSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleSearchInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RoleSearchInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RoleSearchInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RoleSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RoleSearchInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'asc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], RoleSearchInput.prototype, "sortOrder", void 0);
exports.RoleSearchInput = RoleSearchInput = __decorate([
    (0, graphql_1.InputType)()
], RoleSearchInput);
let AssignRolePermissionInput = class AssignRolePermissionInput {
};
exports.AssignRolePermissionInput = AssignRolePermissionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignRolePermissionInput.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    __metadata("design:type", Array)
], AssignRolePermissionInput.prototype, "permissionIds", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'allow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['allow', 'deny']),
    __metadata("design:type", String)
], AssignRolePermissionInput.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AssignRolePermissionInput.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], AssignRolePermissionInput.prototype, "expiresAt", void 0);
exports.AssignRolePermissionInput = AssignRolePermissionInput = __decorate([
    (0, graphql_1.InputType)()
], AssignRolePermissionInput);
let RoleAssignmentInput = class RoleAssignmentInput {
};
exports.RoleAssignmentInput = RoleAssignmentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleAssignmentInput.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'allow' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['allow', 'deny']),
    __metadata("design:type", String)
], RoleAssignmentInput.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RoleAssignmentInput.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RoleAssignmentInput.prototype, "metadata", void 0);
exports.RoleAssignmentInput = RoleAssignmentInput = __decorate([
    (0, graphql_1.InputType)()
], RoleAssignmentInput);
let AssignUserRoleInput = class AssignUserRoleInput {
};
exports.AssignUserRoleInput = AssignUserRoleInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignUserRoleInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RoleAssignmentInput]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RoleAssignmentInput),
    __metadata("design:type", Array)
], AssignUserRoleInput.prototype, "assignments", void 0);
exports.AssignUserRoleInput = AssignUserRoleInput = __decorate([
    (0, graphql_1.InputType)()
], AssignUserRoleInput);
let PermissionAssignmentInput = class PermissionAssignmentInput {
};
exports.PermissionAssignmentInput = PermissionAssignmentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionAssignmentInput.prototype, "permissionId", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'allow' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['allow', 'deny']),
    __metadata("design:type", String)
], PermissionAssignmentInput.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PermissionAssignmentInput.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PermissionAssignmentInput.prototype, "metadata", void 0);
exports.PermissionAssignmentInput = PermissionAssignmentInput = __decorate([
    (0, graphql_1.InputType)()
], PermissionAssignmentInput);
let AssignUserPermissionInput = class AssignUserPermissionInput {
};
exports.AssignUserPermissionInput = AssignUserPermissionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignUserPermissionInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PermissionAssignmentInput]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionAssignmentInput),
    __metadata("design:type", Array)
], AssignUserPermissionInput.prototype, "assignments", void 0);
exports.AssignUserPermissionInput = AssignUserPermissionInput = __decorate([
    (0, graphql_1.InputType)()
], AssignUserPermissionInput);
//# sourceMappingURL=rbac.input.js.map