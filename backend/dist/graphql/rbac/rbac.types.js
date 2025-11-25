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
exports.PermissionSearchResultType = exports.RoleSearchResultType = exports.PermissionsByCategoryType = exports.RemoveRoleResultType = exports.UserRoleAssignmentType = exports.UserBasicType = exports.RolePermissionType = exports.RoleType = exports.PermissionType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let PermissionType = class PermissionType {
};
exports.PermissionType = PermissionType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], PermissionType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PermissionType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PermissionType.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PermissionType.prototype, "resource", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PermissionType.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PermissionType.prototype, "scope", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PermissionType.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PermissionType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PermissionType.prototype, "isSystemPerm", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PermissionType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PermissionType.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PermissionType.prototype, "roleName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], PermissionType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], PermissionType.prototype, "updatedAt", void 0);
exports.PermissionType = PermissionType = __decorate([
    (0, graphql_1.ObjectType)()
], PermissionType);
let RoleType = class RoleType {
};
exports.RoleType = RoleType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RoleType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RoleType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RoleType.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], RoleType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RoleType.prototype, "isSystemRole", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RoleType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleType.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], RoleType.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RolePermissionType], { nullable: true }),
    __metadata("design:type", Array)
], RoleType.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [UserRoleAssignmentType], { nullable: true }),
    __metadata("design:type", Array)
], RoleType.prototype, "userRoles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], RoleType.prototype, "userCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], RoleType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], RoleType.prototype, "updatedAt", void 0);
exports.RoleType = RoleType = __decorate([
    (0, graphql_1.ObjectType)()
], RoleType);
let RolePermissionType = class RolePermissionType {
};
exports.RolePermissionType = RolePermissionType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RolePermissionType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RolePermissionType.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RolePermissionType.prototype, "permissionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RolePermissionType.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], RolePermissionType.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => PermissionType),
    __metadata("design:type", PermissionType)
], RolePermissionType.prototype, "permission", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], RolePermissionType.prototype, "createdAt", void 0);
exports.RolePermissionType = RolePermissionType = __decorate([
    (0, graphql_1.ObjectType)()
], RolePermissionType);
let UserBasicType = class UserBasicType {
};
exports.UserBasicType = UserBasicType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserBasicType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserBasicType.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBasicType.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBasicType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBasicType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBasicType.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UserBasicType.prototype, "isActive", void 0);
exports.UserBasicType = UserBasicType = __decorate([
    (0, graphql_1.ObjectType)()
], UserBasicType);
let UserRoleAssignmentType = class UserRoleAssignmentType {
};
exports.UserRoleAssignmentType = UserRoleAssignmentType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserRoleAssignmentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserRoleAssignmentType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserRoleAssignmentType.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserRoleAssignmentType.prototype, "effect", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserRoleAssignmentType.prototype, "assignedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserRoleAssignmentType.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], UserRoleAssignmentType.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => RoleType, { nullable: true }),
    __metadata("design:type", RoleType)
], UserRoleAssignmentType.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserBasicType, { nullable: true }),
    __metadata("design:type", UserBasicType)
], UserRoleAssignmentType.prototype, "user", void 0);
exports.UserRoleAssignmentType = UserRoleAssignmentType = __decorate([
    (0, graphql_1.ObjectType)()
], UserRoleAssignmentType);
let RemoveRoleResultType = class RemoveRoleResultType {
};
exports.RemoveRoleResultType = RemoveRoleResultType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RemoveRoleResultType.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RemoveRoleResultType.prototype, "message", void 0);
exports.RemoveRoleResultType = RemoveRoleResultType = __decorate([
    (0, graphql_1.ObjectType)()
], RemoveRoleResultType);
let PermissionsByCategoryType = class PermissionsByCategoryType {
};
exports.PermissionsByCategoryType = PermissionsByCategoryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], PermissionsByCategoryType.prototype, "data", void 0);
exports.PermissionsByCategoryType = PermissionsByCategoryType = __decorate([
    (0, graphql_1.ObjectType)()
], PermissionsByCategoryType);
let RoleSearchResultType = class RoleSearchResultType {
};
exports.RoleSearchResultType = RoleSearchResultType;
__decorate([
    (0, graphql_1.Field)(() => [RoleType]),
    __metadata("design:type", Array)
], RoleSearchResultType.prototype, "roles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResultType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResultType.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResultType.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RoleSearchResultType.prototype, "totalPages", void 0);
exports.RoleSearchResultType = RoleSearchResultType = __decorate([
    (0, graphql_1.ObjectType)()
], RoleSearchResultType);
let PermissionSearchResultType = class PermissionSearchResultType {
};
exports.PermissionSearchResultType = PermissionSearchResultType;
__decorate([
    (0, graphql_1.Field)(() => [PermissionType]),
    __metadata("design:type", Array)
], PermissionSearchResultType.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResultType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResultType.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResultType.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PermissionSearchResultType.prototype, "totalPages", void 0);
exports.PermissionSearchResultType = PermissionSearchResultType = __decorate([
    (0, graphql_1.ObjectType)()
], PermissionSearchResultType);
//# sourceMappingURL=rbac.types.js.map