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
exports.SupportChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const support_message_service_1 = require("../services/support-message.service");
const support_conversation_service_1 = require("../services/support-conversation.service");
const ai_assistant_service_1 = require("../services/ai-assistant.service");
let SupportChatGateway = class SupportChatGateway {
    constructor(supportMessageService, supportConversationService, aiAssistantService) {
        this.supportMessageService = supportMessageService;
        this.supportConversationService = supportConversationService;
        this.aiAssistantService = aiAssistantService;
        this.activeConnections = new Map();
    }
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        this.activeConnections.delete(client.id);
    }
    async handleJoinConversation(data, client) {
        const { conversationId, userId } = data;
        client.join(`conversation_${conversationId}`);
        this.activeConnections.set(client.id, conversationId);
        if (userId) {
            await this.supportMessageService.markConversationMessagesAsRead(conversationId, userId);
        }
        return { event: 'joined', conversationId };
    }
    async handleLeaveConversation(data, client) {
        const { conversationId } = data;
        client.leave(`conversation_${conversationId}`);
        this.activeConnections.delete(client.id);
        return { event: 'left', conversationId };
    }
    async handleSendMessage(data, client) {
        const message = await this.supportMessageService.createMessage(data);
        this.server
            .to(`conversation_${data.conversationId}`)
            .emit('new_message', message);
        if (data.senderType === 'CUSTOMER') {
            try {
                const aiResponse = await this.aiAssistantService.generateResponse(data.content, { conversationHistory: [] });
                this.server
                    .to(`conversation_${data.conversationId}`)
                    .emit('ai_suggestion', {
                    conversationId: data.conversationId,
                    suggestion: aiResponse.response,
                    confidence: aiResponse.confidence,
                    suggestions: aiResponse.suggestions,
                });
            }
            catch (error) {
                console.error('AI suggestion error:', error);
            }
        }
        return { success: true, message };
    }
    handleTypingStart(data, client) {
        client.broadcast
            .to(`conversation_${data.conversationId}`)
            .emit('user_typing', data);
    }
    handleTypingStop(data, client) {
        client.broadcast
            .to(`conversation_${data.conversationId}`)
            .emit('user_stopped_typing', data);
    }
    async handleMarkAsRead(data) {
        await this.supportMessageService.markAsRead(data.messageId);
        return { success: true };
    }
    notifyNewConversation(conversation) {
        this.server.emit('new_conversation', conversation);
    }
    notifyConversationStatusChange(conversationId, status) {
        this.server
            .to(`conversation_${conversationId}`)
            .emit('conversation_status_changed', { conversationId, status });
    }
    notifyAgentAssignment(conversationId, agent) {
        this.server
            .to(`conversation_${conversationId}`)
            .emit('agent_assigned', { conversationId, agent });
    }
};
exports.SupportChatGateway = SupportChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SupportChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SupportChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SupportChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SupportChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SupportChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SupportChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_as_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportChatGateway.prototype, "handleMarkAsRead", null);
exports.SupportChatGateway = SupportChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/support-chat',
    }),
    __metadata("design:paramtypes", [support_message_service_1.SupportMessageService,
        support_conversation_service_1.SupportConversationService,
        ai_assistant_service_1.AIAssistantService])
], SupportChatGateway);
//# sourceMappingURL=support-chat.gateway.js.map