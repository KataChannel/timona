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
exports.PushNotificationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const push_notification_service_1 = require("../../services/push-notification.service");
let PushNotificationResolver = class PushNotificationResolver {
    constructor(pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }
    getVapidPublicKey() {
        return this.pushNotificationService.getPublicKey();
    }
    async subscribeToPush(endpoint, p256dh, auth, context) {
        try {
            const userId = context.req.user.userId;
            const subscription = {
                endpoint,
                keys: {
                    p256dh,
                    auth,
                },
            };
            await this.pushNotificationService.saveSubscription(userId, subscription);
            return true;
        }
        catch (error) {
            console.error('Failed to save push subscription:', error);
            return false;
        }
    }
    async unsubscribeFromPush(endpoint) {
        try {
            await this.pushNotificationService.removeSubscription(endpoint);
            return true;
        }
        catch (error) {
            console.error('Failed to remove push subscription:', error);
            return false;
        }
    }
    async testPushNotification(context) {
        try {
            const userId = context.req.user.userId;
            await this.pushNotificationService.testNotification(userId);
            return true;
        }
        catch (error) {
            console.error('Failed to send test notification:', error);
            return false;
        }
    }
};
exports.PushNotificationResolver = PushNotificationResolver;
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], PushNotificationResolver.prototype, "getVapidPublicKey", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('endpoint')),
    __param(1, (0, graphql_1.Args)('p256dh')),
    __param(2, (0, graphql_1.Args)('auth')),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PushNotificationResolver.prototype, "subscribeToPush", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('endpoint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PushNotificationResolver.prototype, "unsubscribeFromPush", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PushNotificationResolver.prototype, "testPushNotification", null);
exports.PushNotificationResolver = PushNotificationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [push_notification_service_1.PushNotificationService])
], PushNotificationResolver);
//# sourceMappingURL=push-notification.resolver.js.map