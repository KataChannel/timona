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
exports.ChatIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ChatIntegrationService = class ChatIntegrationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getIntegration(platform) {
        return this.prisma.chatIntegration.findUnique({
            where: { platform },
        });
    }
    async getAllIntegrations() {
        return this.prisma.chatIntegration.findMany();
    }
    async createOrUpdate(data) {
        return this.prisma.chatIntegration.upsert({
            where: { platform: data.platform },
            create: data,
            update: data,
        });
    }
    async verifyWebhook(platform) {
        return this.prisma.chatIntegration.update({
            where: { platform },
            data: { webhookVerified: true },
        });
    }
    async updateSyncStatus(platform, status, error) {
        return this.prisma.chatIntegration.update({
            where: { platform },
            data: {
                lastSyncAt: new Date(),
                syncStatus: status,
                errorLog: error,
            },
        });
    }
    async sendZaloMessage(userId, message) {
        const integration = await this.getIntegration(client_1.IntegrationPlatform.ZALO);
        if (!integration?.isEnabled || !integration.accessToken) {
            throw new Error('Zalo integration not configured');
        }
        try {
            const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': integration.accessToken,
                },
                body: JSON.stringify({
                    recipient: {
                        user_id: userId,
                    },
                    message: {
                        text: message,
                    },
                }),
            });
            return await response.json();
        }
        catch (error) {
            await this.updateSyncStatus(client_1.IntegrationPlatform.ZALO, 'failed', error.message);
            throw error;
        }
    }
    async sendFacebookMessage(recipientId, message) {
        const integration = await this.getIntegration(client_1.IntegrationPlatform.FACEBOOK);
        if (!integration?.isEnabled || !integration.accessToken) {
            throw new Error('Facebook integration not configured');
        }
        try {
            const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${integration.accessToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient: {
                        id: recipientId,
                    },
                    message: {
                        text: message,
                    },
                }),
            });
            return await response.json();
        }
        catch (error) {
            await this.updateSyncStatus(client_1.IntegrationPlatform.FACEBOOK, 'failed', error.message);
            throw error;
        }
    }
};
exports.ChatIntegrationService = ChatIntegrationService;
exports.ChatIntegrationService = ChatIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatIntegrationService);
//# sourceMappingURL=chat-integration.service.js.map