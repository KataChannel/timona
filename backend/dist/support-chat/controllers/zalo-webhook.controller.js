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
exports.ZaloWebhookController = void 0;
const common_1 = require("@nestjs/common");
const support_conversation_service_1 = require("../services/support-conversation.service");
const support_message_service_1 = require("../services/support-message.service");
const chat_integration_service_1 = require("../services/chat-integration.service");
const support_chat_gateway_1 = require("../gateways/support-chat.gateway");
const client_1 = require("@prisma/client");
let ZaloWebhookController = class ZaloWebhookController {
    constructor(conversationService, messageService, integrationService, chatGateway) {
        this.conversationService = conversationService;
        this.messageService = messageService;
        this.integrationService = integrationService;
        this.chatGateway = chatGateway;
    }
    async verifyWebhook(query) {
        const { code, state } = query;
        if (code) {
            await this.integrationService.verifyWebhook(client_1.IntegrationPlatform.ZALO);
            return { success: true };
        }
        return { success: false };
    }
    async handleWebhook(body, signature) {
        try {
            const integration = await this.integrationService.getIntegration(client_1.IntegrationPlatform.ZALO);
            if (!integration?.webhookSecret) {
                throw new common_1.HttpException('Integration not configured', common_1.HttpStatus.BAD_REQUEST);
            }
            const event = body.event_name;
            if (event === 'user_send_text') {
                await this.handleUserMessage(body);
            }
            else if (event === 'user_send_image') {
                await this.handleUserImage(body);
            }
            else if (event === 'follow') {
                await this.handleUserFollow(body);
            }
            return { success: true };
        }
        catch (error) {
            console.error('Zalo webhook error:', error);
            throw new common_1.HttpException('Webhook processing failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleUserMessage(data) {
        const userId = data.follower?.id;
        const userName = data.follower?.name;
        const message = data.message?.text;
        let conversation = await this.conversationService.findAll({
            where: {
                platform: client_1.IntegrationPlatform.ZALO,
                platformUserId: userId,
                status: { in: ['ACTIVE', 'WAITING', 'ASSIGNED'] },
            },
            take: 1,
        });
        if (!conversation || conversation.length === 0) {
            const newConversation = await this.conversationService.createConversation({
                platform: client_1.IntegrationPlatform.ZALO,
                platformUserId: userId,
                platformUserName: userName,
                customerName: userName,
            });
            conversation = [{
                    ...newConversation,
                    messages: [],
                }];
            this.chatGateway.notifyNewConversation(newConversation);
        }
        const newMessage = await this.messageService.createMessage({
            conversationId: conversation[0].id,
            content: message,
            senderType: client_1.SupportSender.CUSTOMER,
            senderName: userName,
        });
        this.chatGateway.server
            .to(`conversation_${conversation[0].id}`)
            .emit('new_message', newMessage);
    }
    async handleUserImage(data) {
        console.log('Zalo image received:', data);
    }
    async handleUserFollow(data) {
        console.log('New Zalo follower:', data);
    }
};
exports.ZaloWebhookController = ZaloWebhookController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZaloWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-zevent-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZaloWebhookController.prototype, "handleWebhook", null);
exports.ZaloWebhookController = ZaloWebhookController = __decorate([
    (0, common_1.Controller)('webhooks/zalo'),
    __metadata("design:paramtypes", [support_conversation_service_1.SupportConversationService,
        support_message_service_1.SupportMessageService,
        chat_integration_service_1.ChatIntegrationService,
        support_chat_gateway_1.SupportChatGateway])
], ZaloWebhookController);
//# sourceMappingURL=zalo-webhook.controller.js.map