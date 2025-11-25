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
exports.NotificationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const notification_service_1 = require("../../services/notification.service");
const notification_schema_1 = require("../../graphql/schemas/notification.schema");
let NotificationResolver = class NotificationResolver {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotifications(isRead, type, skip, take, context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.notificationService.getNotifications({
            userId,
            isRead,
            type,
            skip,
            take,
        });
    }
    async getUnreadNotificationsCount(context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.notificationService.getUnreadCount(userId);
    }
    async markNotificationAsRead(input, context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.notificationService.markAsRead(input.notificationId, userId);
    }
    async markAllNotificationsAsRead(context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        await this.notificationService.markAllAsRead(userId);
        return true;
    }
    async deleteNotification(input, context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        await this.notificationService.delete(input.notificationId, userId);
        return true;
    }
    async deleteAllReadNotifications(context) {
        const userId = context?.req?.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        await this.notificationService.deleteAllRead(userId);
        return true;
    }
};
exports.NotificationResolver = NotificationResolver;
__decorate([
    (0, graphql_1.Query)(() => notification_schema_1.NotificationListResponse),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('isRead', { type: () => Boolean, nullable: true })),
    __param(1, (0, graphql_1.Args)('type', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __param(4, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getNotifications", null);
__decorate([
    (0, graphql_1.Query)(() => Number),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getUnreadNotificationsCount", null);
__decorate([
    (0, graphql_1.Mutation)(() => notification_schema_1.NotificationType),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_schema_1.MarkNotificationAsReadInput, Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markNotificationAsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_schema_1.DeleteNotificationInput, Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "deleteNotification", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "deleteAllReadNotifications", null);
exports.NotificationResolver = NotificationResolver = __decorate([
    (0, graphql_1.Resolver)(() => notification_schema_1.NotificationType),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationResolver);
//# sourceMappingURL=notification.resolver.js.map