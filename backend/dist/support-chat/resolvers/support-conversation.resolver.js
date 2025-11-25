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
exports.SupportConversationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const support_conversation_service_1 = require("../services/support-conversation.service");
const support_conversation_entity_1 = require("../entities/support-conversation.entity");
const support_conversation_input_1 = require("../dto/support-conversation.input");
let SupportConversationResolver = class SupportConversationResolver {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async supportConversations(where, take) {
        return this.conversationService.findAll({ where, take });
    }
    async supportConversation(id) {
        return this.conversationService.findOne(id);
    }
    async createSupportConversation(input) {
        return this.conversationService.createConversation(input);
    }
    async assignConversationToAgent(conversationId, agentId) {
        return this.conversationService.assignToAgent(conversationId, agentId);
    }
};
exports.SupportConversationResolver = SupportConversationResolver;
__decorate([
    (0, graphql_1.Query)(() => [support_conversation_entity_1.SupportConversation], { name: 'supportConversations' }),
    __param(0, (0, graphql_1.Args)('where', { type: () => support_conversation_input_1.SupportConversationWhereInput, nullable: true })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_conversation_input_1.SupportConversationWhereInput, Number]),
    __metadata("design:returntype", Promise)
], SupportConversationResolver.prototype, "supportConversations", null);
__decorate([
    (0, graphql_1.Query)(() => support_conversation_entity_1.SupportConversation, { name: 'supportConversation' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportConversationResolver.prototype, "supportConversation", null);
__decorate([
    (0, graphql_1.Mutation)(() => support_conversation_entity_1.SupportConversation),
    __param(0, (0, graphql_1.Args)('input', { type: () => support_conversation_input_1.CreateSupportConversationInput })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_conversation_input_1.CreateSupportConversationInput]),
    __metadata("design:returntype", Promise)
], SupportConversationResolver.prototype, "createSupportConversation", null);
__decorate([
    (0, graphql_1.Mutation)(() => support_conversation_entity_1.SupportConversation),
    __param(0, (0, graphql_1.Args)('conversationId', { type: () => String })),
    __param(1, (0, graphql_1.Args)('agentId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SupportConversationResolver.prototype, "assignConversationToAgent", null);
exports.SupportConversationResolver = SupportConversationResolver = __decorate([
    (0, graphql_1.Resolver)(() => support_conversation_entity_1.SupportConversation),
    __metadata("design:paramtypes", [support_conversation_service_1.SupportConversationService])
], SupportConversationResolver);
//# sourceMappingURL=support-conversation.resolver.js.map