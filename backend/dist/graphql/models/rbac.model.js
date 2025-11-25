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
exports.UserRolePermissionSummary = exports.UserSummary = exports.PermissionSearchResult = exports.RoleSearchResult = exports.UserPermission = exports.UserRoleAssignment = exports.Role = exports.RolePermission = exports.Permission = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let Permission = class Permission {
};
exports.Permission = Permission;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Permission.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Permission.prototype, "isSystemPerm", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Permission.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Permission.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Permission.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Permission.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Permission.prototype, "updatedAt", void 0);
exports.Permission = Permission = __decorate([
    (0, graphql_1.ObjectType)()
], Permission);
let RolePermission = class RolePermission {
};
exports.RolePermission = RolePermission;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RolePermission.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RolePermission.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => Permission),
    __metadata("design:type", Permission)
], RolePermission.prototype, "permission", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], RolePermission.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], RolePermission.prototype, "metadata", void 0);
exports.RolePermission = RolePermission = __decorate([
    (0, graphql_1.ObjectType)()
], RolePermission);
let Role = class Role {
};
exports.Role = Role;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Role.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Role, { nullable: true }),
    __metadata("design:type", Role)
], Role.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Role]),
    __metadata("design:type", Array)
], Role.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Role.prototype, "isSystemRole", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Role.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Role.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RolePermission]),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Role.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Role.prototype, "updatedAt", void 0);
exports.Role = Role = __decorate([
    (0, graphql_1.ObjectType)()
], Role);
let UserRoleAssignment = class UserRoleAssignment {
};
exports.UserRoleAssignment = UserRoleAssignment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserRoleAssignment.prototype, "assignedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserRoleAssignment.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UserRoleAssignment.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], UserRoleAssignment.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], UserRoleAssignment.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => Role),
    __metadata("design:type", Role)
], UserRoleAssignment.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserRoleAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserRoleAssignment.prototype, "updatedAt", void 0);
exports.UserRoleAssignment = UserRoleAssignment = __decorate([
    (0, graphql_1.ObjectType)()
], UserRoleAssignment);
let UserPermission = class UserPermission {
};
exports.UserPermission = UserPermission;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserPermission.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserPermission.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserPermission.prototype, "permissionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserPermission.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserPermission.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserPermission.prototype, "assignedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserPermission.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UserPermission.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserPermission.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], UserPermission.prototype, "conditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], UserPermission.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => Permission),
    __metadata("design:type", Permission)
], UserPermission.prototype, "permission", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserPermission.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserPermission.prototype, "updatedAt", void 0);
exports.UserPermission = UserPermission = __decorate([
    (0, graphql_1.ObjectType)()
], UserPermission);
let RoleSearchResult = class RoleSearchResult {
};
exports.RoleSearchResult = RoleSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [Role]),
    __metadata("design:type", Array)
], RoleSearchResult.prototype, "roles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResult.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResult.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResult.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResult.prototype, "totalPages", void 0);
exports.RoleSearchResult = RoleSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], RoleSearchResult);
let PermissionSearchResult = class PermissionSearchResult {
};
exports.PermissionSearchResult = PermissionSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [Permission]),
    __metadata("design:type", Array)
], PermissionSearchResult.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResult.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResult.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResult.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResult.prototype, "totalPages", void 0);
exports.PermissionSearchResult = PermissionSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], PermissionSearchResult);
let UserSummary = class UserSummary {
};
exports.UserSummary = UserSummary;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UserSummary.prototype, "totalDirectPermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UserSummary.prototype, "totalRoleAssignments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UserSummary.prototype, "totalEffectivePermissions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserSummary.prototype, "lastUpdated", void 0);
exports.UserSummary = UserSummary = __decorate([
    (0, graphql_1.ObjectType)()
], UserSummary);
let UserRolePermissionSummary = class UserRolePermissionSummary {
};
exports.UserRolePermissionSummary = UserRolePermissionSummary;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserRolePermissionSummary.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [UserRoleAssignment]),
    __metadata("design:type", Array)
], UserRolePermissionSummary.prototype, "roleAssignments", void 0);
__decorate([
    (0, graphql_1.Field)(() => [UserPermission]),
    __metadata("design:type", Array)
], UserRolePermissionSummary.prototype, "directPermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Permission]),
    __metadata("design:type", Array)
], UserRolePermissionSummary.prototype, "effectivePermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserSummary),
    __metadata("design:type", UserSummary)
], UserRolePermissionSummary.prototype, "summary", void 0);
exports.UserRolePermissionSummary = UserRolePermissionSummary = __decorate([
    (0, graphql_1.ObjectType)()
], UserRolePermissionSummary);
//# sourceMappingURL=rbac.model.js.map