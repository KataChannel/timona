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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportMessageResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const support_message_service_1 = require("../services/support-message.service");
const support_conversation_entity_1 = require("../entities/support-conversation.entity");
const support_message_input_1 = require("../dto/support-message.input");
let SupportMessageResolver = class SupportMessageResolver {
    constructor(messageService) {
        this.messageService = messageService;
    }
    async supportMessages(conversationId) {
        return this.messageService.findByConversation(conversationId);
    }
    async sendSupportMessage(input) {
        return this.messageService.createMessage(input);
    }
    async markMessagesAsRead(conversationId, userId) {
        const result = await this.messageService.markConversationMessagesAsRead(conversationId, userId);
        return result.count;
    }
};
exports.SupportMessageResolver = SupportMessageResolver;
__decorate([
    (0, graphql_1.Query)(() => [support_conversation_entity_1.SupportMessage], { name: 'supportMessages' }),
    __param(0, (0, graphql_1.Args)('conversationId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportMessageResolver.prototype, "supportMessages", null);
__decorate([
    (0, graphql_1.Mutation)(() => support_conversation_entity_1.SupportMessage),
    __param(0, (0, graphql_1.Args)('input', { type: () => support_message_input_1.CreateSupportMessageInput })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_message_input_1.CreateSupportMessageInput]),
    __metadata("design:returntype", Promise)
], SupportMessageResolver.prototype, "sendSupportMessage", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.Int),
    __param(0, (0, graphql_1.Args)('conversationId', { type: () => String })),
    __param(1, (0, graphql_1.Args)('userId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SupportMessageResolver.prototype, "markMessagesAsRead", null);
exports.SupportMessageResolver = SupportMessageResolver = __decorate([
    (0, graphql_1.Resolver)(() => support_conversation_entity_1.SupportMessage),
    __metadata("design:paramtypes", [support_message_service_1.SupportMessageService])
], SupportMessageResolver);
//# sourceMappingURL=support-message.resolver.js.map