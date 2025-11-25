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
var ChatbotController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const common_1 = require("@nestjs/common");
const chatbot_service_1 = require("./chatbot.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatbotController = ChatbotController_1 = class ChatbotController {
    constructor(chatbotService) {
        this.chatbotService = chatbotService;
        this.logger = new common_1.Logger(ChatbotController_1.name);
    }
    async createChatbot(req, createChatbotDto) {
        this.logger.debug(`Request user object: ${JSON.stringify(req.user)}`);
        this.logger.debug(`User sub: ${req.user?.sub}`);
        this.logger.debug(`User id: ${req.user?.id}`);
        const userId = req.user?.sub || req.user?.id;
        if (!userId) {
            this.logger.error('No userId found in request');
            throw new Error('User ID not found in request');
        }
        return this.chatbotService.createChatbot(userId, createChatbotDto);
    }
    async getUserChatbots(req) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.getUserChatbots(userId);
    }
    async getChatbotById(req, id) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.getChatbotById(userId, id);
    }
    async updateChatbot(req, id, updateChatbotDto) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.updateChatbot(userId, id, updateChatbotDto);
    }
    async deleteChatbot(req, id) {
        const userId = req.user?.sub || req.user?.id;
        await this.chatbotService.deleteChatbot(userId, id);
        return { message: 'Chatbot deleted successfully' };
    }
    async sendMessage(req, id, sendMessageDto) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.sendMessage(userId, id, sendMessageDto);
    }
    async getChatbotConversations(req, id) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.getChatbotConversations(userId, id);
    }
    async getConversation(req, id) {
        const userId = req.user?.sub || req.user?.id;
        return this.chatbotService.getConversation(userId, id);
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "createChatbot", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getUserChatbots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getChatbotById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "updateChatbot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "deleteChatbot", null);
__decorate([
    (0, common_1.Post)(':id/message'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(':id/conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getChatbotConversations", null);
__decorate([
    (0, common_1.Get)('conversation/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getConversation", null);
exports.ChatbotController = ChatbotController = ChatbotController_1 = __decorate([
    (0, common_1.Controller)('chatbot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map