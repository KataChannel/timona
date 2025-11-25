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
exports.DeleteNotificationInput = exports.MarkNotificationAsReadInput = exports.NotificationListResponse = exports.NotificationType = exports.MentionerType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let MentionerType = class MentionerType {
};
exports.MentionerType = MentionerType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MentionerType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MentionerType.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MentionerType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MentionerType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MentionerType.prototype, "avatar", void 0);
exports.MentionerType = MentionerType = __decorate([
    (0, graphql_1.ObjectType)()
], MentionerType);
let NotificationType = class NotificationType {
};
exports.NotificationType = NotificationType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationType.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NotificationType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], NotificationType.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], NotificationType.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NotificationType.prototype, "mentionedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NotificationType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NotificationType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => MentionerType, { nullable: true }),
    __metadata("design:type", MentionerType)
], NotificationType.prototype, "mentioner", void 0);
exports.NotificationType = NotificationType = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationType);
let NotificationListResponse = class NotificationListResponse {
};
exports.NotificationListResponse = NotificationListResponse;
__decorate([
    (0, graphql_1.Field)(() => [NotificationType]),
    __metadata("design:type", Array)
], NotificationListResponse.prototype, "notifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NotificationListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NotificationListResponse.prototype, "unreadCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], NotificationListResponse.prototype, "hasMore", void 0);
exports.NotificationListResponse = NotificationListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationListResponse);
let MarkNotificationAsReadInput = class MarkNotificationAsReadInput {
};
exports.MarkNotificationAsReadInput = MarkNotificationAsReadInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MarkNotificationAsReadInput.prototype, "notificationId", void 0);
exports.MarkNotificationAsReadInput = MarkNotificationAsReadInput = __decorate([
    (0, graphql_1.InputType)()
], MarkNotificationAsReadInput);
let DeleteNotificationInput = class DeleteNotificationInput {
};
exports.DeleteNotificationInput = DeleteNotificationInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DeleteNotificationInput.prototype, "notificationId", void 0);
exports.DeleteNotificationInput = DeleteNotificationInput = __decorate([
    (0, graphql_1.InputType)()
], DeleteNotificationInput);
//# sourceMappingURL=notification.schema.js.map