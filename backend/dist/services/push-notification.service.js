"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PushNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const webPush = __importStar(require("web-push"));
const prisma_service_1 = require("../prisma/prisma.service");
let PushNotificationService = PushNotificationService_1 = class PushNotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PushNotificationService_1.name);
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@rausach.com';
        if (!vapidPublicKey || !vapidPrivateKey) {
            this.logger.error('VAPID keys not configured. Push notifications will not work. ' +
                'Generate keys with: bunx web-push generate-vapid-keys');
            return;
        }
        webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        this.logger.log('Push notification service initialized with VAPID keys');
    }
    async saveSubscription(userId, subscription) {
        try {
            const existing = await this.prisma.pushSubscription.findUnique({
                where: { endpoint: subscription.endpoint },
            });
            if (existing) {
                await this.prisma.pushSubscription.update({
                    where: { endpoint: subscription.endpoint },
                    data: {
                        userId,
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                        updatedAt: new Date(),
                    },
                });
                this.logger.log(`Updated push subscription for user ${userId}`);
            }
            else {
                await this.prisma.pushSubscription.create({
                    data: {
                        userId,
                        endpoint: subscription.endpoint,
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                    },
                });
                this.logger.log(`Created push subscription for user ${userId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to save push subscription: ${error.message}`);
            throw error;
        }
    }
    async removeSubscription(endpoint) {
        try {
            await this.prisma.pushSubscription.delete({
                where: { endpoint },
            });
            this.logger.log(`Removed push subscription: ${endpoint}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove push subscription: ${error.message}`);
        }
    }
    async sendToUser(userId, payload) {
        try {
            const subscriptions = await this.prisma.pushSubscription.findMany({
                where: { userId },
            });
            if (subscriptions.length === 0) {
                this.logger.debug(`No push subscriptions found for user ${userId}`);
                return { sent: 0, failed: 0 };
            }
            const results = await Promise.allSettled(subscriptions.map(sub => this.sendPushNotification(sub, payload)));
            const sent = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            this.logger.log(`Sent push notification to user ${userId}: ${sent} sent, ${failed} failed`);
            return { sent, failed };
        }
        catch (error) {
            this.logger.error(`Failed to send push notification to user: ${error.message}`);
            return { sent: 0, failed: 0 };
        }
    }
    async sendToUsers(userIds, payload) {
        try {
            const results = await Promise.allSettled(userIds.map(userId => this.sendToUser(userId, payload)));
            const totalSent = results
                .filter(r => r.status === 'fulfilled')
                .reduce((sum, r) => sum + r.value.sent, 0);
            const totalFailed = results
                .filter(r => r.status === 'fulfilled')
                .reduce((sum, r) => sum + r.value.failed, 0);
            this.logger.log(`Sent push notifications to ${userIds.length} users: ${totalSent} sent, ${totalFailed} failed`);
            return { sent: totalSent, failed: totalFailed };
        }
        catch (error) {
            this.logger.error(`Failed to send push notifications to users: ${error.message}`);
            return { sent: 0, failed: 0 };
        }
    }
    async sendPushNotification(subscription, payload) {
        try {
            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            };
            const notificationPayload = JSON.stringify({
                title: payload.title,
                message: payload.message,
                icon: payload.icon || '/icons/icon-192x192.png',
                badge: payload.badge || '/icons/badge-72x72.png',
                data: {
                    ...payload.data,
                    url: payload.url || '/',
                    timestamp: Date.now(),
                },
            });
            await webPush.sendNotification(pushSubscription, notificationPayload);
        }
        catch (error) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                this.logger.warn(`Push subscription expired, removing: ${subscription.endpoint}`);
                await this.removeSubscription(subscription.endpoint);
            }
            else {
                this.logger.error(`Failed to send push notification: ${error.message}`);
            }
            throw error;
        }
    }
    getPublicKey() {
        return process.env.VAPID_PUBLIC_KEY || '';
    }
    async testNotification(userId) {
        await this.sendToUser(userId, {
            title: 'Test Push Notification',
            message: 'Hệ thống push notification đang hoạt động tốt! 🎉',
            url: '/',
        });
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = PushNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map