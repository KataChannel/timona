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
exports.SupportConversation = exports.SupportMessage = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const user_model_1 = require("../../graphql/models/user.model");
(0, graphql_1.registerEnumType)(client_1.SupportConversationStatus, {
    name: 'SupportConversationStatus',
});
(0, graphql_1.registerEnumType)(client_1.IntegrationPlatform, {
    name: 'IntegrationPlatform',
});
(0, graphql_1.registerEnumType)(client_1.TicketPriority, {
    name: 'TicketPriority',
});
(0, graphql_1.registerEnumType)(client_1.SupportSender, {
    name: 'SupportSender',
});
(0, graphql_1.registerEnumType)(client_1.SupportMessageType, {
    name: 'SupportMessageType',
});
let SupportMessage = class SupportMessage {
};
exports.SupportMessage = SupportMessage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SupportMessage.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessage.prototype, "conversationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessage.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessage.prototype, "senderType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportMessage.prototype, "senderName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SupportMessage.prototype, "isAIGenerated", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], SupportMessage.prototype, "aiConfidence", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SupportMessage.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportMessage.prototype, "sentAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportMessage.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], SupportMessage.prototype, "sender", void 0);
exports.SupportMessage = SupportMessage = __decorate([
    (0, graphql_1.ObjectType)()
], SupportMessage);
let SupportConversation = class SupportConversation {
};
exports.SupportConversation = SupportConversation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SupportConversation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportConversation.prototype, "conversationCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerIp", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "customerLocation", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "assignedAgentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SupportConversation.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportConversationStatus),
    __metadata("design:type", String)
], SupportConversation.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TicketPriority),
    __metadata("design:type", String)
], SupportConversation.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.IntegrationPlatform),
    __metadata("design:type", String)
], SupportConversation.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "platformUserId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "platformUserName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SupportConversation.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SupportConversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], SupportConversation.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportConversation.prototype, "feedback", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportConversation.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SupportConversation.prototype, "closedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportConversation.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportConversation.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], SupportConversation.prototype, "customer", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], SupportConversation.prototype, "assignedAgent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SupportMessage], { nullable: true }),
    __metadata("design:type", Array)
], SupportConversation.prototype, "messages", void 0);
exports.SupportConversation = SupportConversation = __decorate([
    (0, graphql_1.ObjectType)()
], SupportConversation);
//# sourceMappingURL=support-conversation.entity.js.map