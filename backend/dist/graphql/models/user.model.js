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
exports.AdminResetPasswordResult = exports.BulkUserActionResult = exports.UserStats = exports.UserSearchResult = exports.User = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const rbac_model_1 = require("./rbac.model");
const prisma = new client_1.PrismaClient();
const UserRoleTypeValues = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    GUEST: 'GUEST',
};
(0, graphql_1.registerEnumType)(UserRoleTypeValues, {
    name: 'UserRole',
    description: 'User role types',
});
let User = class User {
};
exports.User = User;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "roleType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "district", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "ward", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lockedUntil", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [rbac_model_1.Role], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, graphql_1.Field)(() => [rbac_model_1.Permission], { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "permissions", void 0);
exports.User = User = __decorate([
    (0, graphql_1.ObjectType)()
], User);
let UserSearchResult = class UserSearchResult {
};
exports.UserSearchResult = UserSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [User]),
    __metadata("design:type", Array)
], UserSearchResult.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserSearchResult.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserSearchResult.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserSearchResult.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserSearchResult.prototype, "totalPages", void 0);
exports.UserSearchResult = UserSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], UserSearchResult);
let UserStats = class UserStats {
};
exports.UserStats = UserStats;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "totalUsers", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "activeUsers", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "verifiedUsers", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "newUsersThisMonth", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "adminUsers", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "regularUsers", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], UserStats.prototype, "guestUsers", void 0);
exports.UserStats = UserStats = __decorate([
    (0, graphql_1.ObjectType)()
], UserStats);
let BulkUserActionResult = class BulkUserActionResult {
};
exports.BulkUserActionResult = BulkUserActionResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], BulkUserActionResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BulkUserActionResult.prototype, "affectedCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], BulkUserActionResult.prototype, "errors", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BulkUserActionResult.prototype, "message", void 0);
exports.BulkUserActionResult = BulkUserActionResult = __decorate([
    (0, graphql_1.ObjectType)()
], BulkUserActionResult);
let AdminResetPasswordResult = class AdminResetPasswordResult {
};
exports.AdminResetPasswordResult = AdminResetPasswordResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AdminResetPasswordResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminResetPasswordResult.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AdminResetPasswordResult.prototype, "newPassword", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", User)
], AdminResetPasswordResult.prototype, "user", void 0);
exports.AdminResetPasswordResult = AdminResetPasswordResult = __decorate([
    (0, graphql_1.ObjectType)()
], AdminResetPasswordResult);
//# sourceMappingURL=user.model.js.map