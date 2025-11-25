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
exports.FacebookWebhookController = void 0;
const common_1 = require("@nestjs/common");
const support_conversation_service_1 = require("../services/support-conversation.service");
const support_message_service_1 = require("../services/support-message.service");
const chat_integration_service_1 = require("../services/chat-integration.service");
const support_chat_gateway_1 = require("../gateways/support-chat.gateway");
const client_1 = require("@prisma/client");
let FacebookWebhookController = class FacebookWebhookController {
    constructor(conversationService, messageService, integrationService, chatGateway) {
        this.conversationService = conversationService;
        this.messageService = messageService;
        this.integrationService = integrationService;
        this.chatGateway = chatGateway;
    }
    async verifyWebhook(query) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        const integration = await this.integrationService.getIntegration(client_1.IntegrationPlatform.FACEBOOK);
        if (mode === 'subscribe' && token === integration?.webhookSecret) {
            console.log('Facebook webhook verified');
            await this.integrationService.verifyWebhook(client_1.IntegrationPlatform.FACEBOOK);
            return challenge;
        }
        throw new common_1.HttpException('Verification failed', common_1.HttpStatus.FORBIDDEN);
    }
    async handleWebhook(body, signature) {
        try {
            const integration = await this.integrationService.getIntegration(client_1.IntegrationPlatform.FACEBOOK);
            if (!integration?.webhookSecret) {
                throw new common_1.HttpException('Integration not configured', common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.object === 'page') {
                for (const entry of body.entry) {
                    const webhookEvent = entry.messaging[0];
                    if (webhookEvent.message) {
                        await this.handleMessage(webhookEvent);
                    }
                    else if (webhookEvent.postback) {
                        await this.handlePostback(webhookEvent);
                    }
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Facebook webhook error:', error);
            throw new common_1.HttpException('Webhook processing failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleMessage(event) {
        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const message = event.message;
        const integration = await this.integrationService.getIntegration(client_1.IntegrationPlatform.FACEBOOK);
        let senderName = 'Facebook User';
        try {
            const userInfoResponse = await fetch(`https://graph.facebook.com/${senderId}?fields=first_name,last_name&access_token=${integration.accessToken}`);
            const userInfo = await userInfoResponse.json();
            senderName = `${userInfo.first_name} ${userInfo.last_name}`;
        }
        catch (error) {
            console.error('Error fetching Facebook user info:', error);
        }
        let conversation = await this.conversationService.findAll({
            where: {
                platform: client_1.IntegrationPlatform.FACEBOOK,
                platformUserId: senderId,
                status: { in: ['ACTIVE', 'WAITING', 'ASSIGNED'] },
            },
            take: 1,
        });
        if (!conversation || conversation.length === 0) {
            const newConversation = await this.conversationService.createConversation({
                platform: client_1.IntegrationPlatform.FACEBOOK,
                platformUserId: senderId,
                platformUserName: senderName,
                customerName: senderName,
            });
            conversation = [{
                    ...newConversation,
                    messages: [],
                }];
            this.chatGateway.notifyNewConversation(newConversation);
        }
        const newMessage = await this.messageService.createMessage({
            conversationId: conversation[0].id,
            content: message.text || '[Attachment]',
            senderType: client_1.SupportSender.CUSTOMER,
            senderName,
            metadata: {
                attachments: message.attachments,
                mid: message.mid,
            },
        });
        this.chatGateway.server
            .to(`conversation_${conversation[0].id}`)
            .emit('new_message', newMessage);
    }
    async handlePostback(event) {
        console.log('Facebook postback received:', event.postback);
    }
};
exports.FacebookWebhookController = FacebookWebhookController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-hub-signature-256')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacebookWebhookController.prototype, "handleWebhook", null);
exports.FacebookWebhookController = FacebookWebhookController = __decorate([
    (0, common_1.Controller)('webhooks/facebook'),
    __metadata("design:paramtypes", [support_conversation_service_1.SupportConversationService,
        support_message_service_1.SupportMessageService,
        chat_integration_service_1.ChatIntegrationService,
        support_chat_gateway_1.SupportChatGateway])
], FacebookWebhookController);
//# sourceMappingURL=facebook-webhook.controller.js.map