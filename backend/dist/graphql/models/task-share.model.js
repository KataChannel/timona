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
exports.TaskShare = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_model_1 = require("./user.model");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.SharePermission, {
    name: 'SharePermission',
    description: 'The permission level for shared tasks',
});
let TaskShare = class TaskShare {
};
exports.TaskShare = TaskShare;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TaskShare.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SharePermission),
    __metadata("design:type", String)
], TaskShare.prototype, "permission", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskShare.prototype, "shareToken", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TaskShare.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TaskShare.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TaskShare.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TaskShare.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskShare.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], TaskShare.prototype, "sharedByUser", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskShare.prototype, "sharedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], TaskShare.prototype, "sharedWithUser", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TaskShare.prototype, "sharedWith", void 0);
exports.TaskShare = TaskShare = __decorate([
    (0, graphql_1.ObjectType)()
], TaskShare);
//# sourceMappingURL=task-share.model.js.map