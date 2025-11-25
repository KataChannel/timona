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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const real_time_notification_service_1 = require("../realtime/real-time-notification.service");
const push_notification_service_1 = require("./push-notification.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma, realTimeService, pushNotificationService) {
        this.prisma = prisma;
        this.realTimeService = realTimeService;
        this.pushNotificationService = pushNotificationService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createTaskAssignedNotification(taskId, assignedUserId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { user: true },
        });
        if (!task)
            return;
        return this.prisma.notification.create({
            data: {
                type: 'task_assigned',
                title: 'New Task Shared',
                message: `${task.user.username} shared a task "${task.title}" with you`,
                data: { taskId },
                user: { connect: { id: assignedUserId } },
            },
        });
    }
    async createTaskCompletedNotification(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                shares: {
                    where: { isActive: true },
                    include: { sharedWithUser: true },
                },
            },
        });
        if (!task)
            return;
        const notifications = task.shares.map(share => this.prisma.notification.create({
            data: {
                type: 'task_completed',
                title: 'Task Completed',
                message: `Task "${task.title}" has been completed`,
                data: { taskId },
                user: { connect: { id: share.sharedWith } },
            },
        }));
        return Promise.all(notifications);
    }
    async createTaskCommentNotification(taskId, commentAuthorId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                user: true,
                shares: {
                    where: { isActive: true },
                    include: { sharedWithUser: true },
                },
            },
        });
        if (!task)
            return;
        const notifyUsers = new Set();
        if (task.userId !== commentAuthorId) {
            notifyUsers.add(task.userId);
        }
        task.shares.forEach(share => {
            if (share.sharedWith && share.sharedWith !== commentAuthorId) {
                notifyUsers.add(share.sharedWith);
            }
        });
        const notifications = Array.from(notifyUsers).map(userId => this.prisma.notification.create({
            data: {
                type: 'task_comment',
                title: 'New Comment',
                message: `New comment on task "${task.title}"`,
                data: { taskId },
                user: { connect: { id: userId } },
            },
        }));
        return Promise.all(notifications);
    }
    async findByUserId(userId, limit = 20) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async markAsRead(notificationId, userId) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async create(input) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: input.userId,
                    title: input.title,
                    message: input.message,
                    type: input.type,
                    data: input.data || null,
                    taskId: input.taskId,
                    mentionedBy: input.mentionedBy,
                    isRead: false,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            });
            await this.realTimeService.notify({
                id: notification.id,
                type: `notification.${input.type.toLowerCase()}`,
                userId: input.userId,
                data: {
                    notificationId: notification.id,
                    title: input.title,
                    message: input.message,
                    type: input.type,
                    data: input.data,
                    template: {
                        title: input.title,
                        body: input.message,
                    },
                },
                timestamp: notification.createdAt,
                priority: input.type === 'ORDER' ? 'high' : 'medium',
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'push', enabled: true },
                    { type: 'email', enabled: input.type === 'ORDER' },
                ],
            });
            try {
                await this.pushNotificationService.sendToUser(input.userId, {
                    title: input.title,
                    message: input.message,
                    icon: this.getIconForNotificationType(input.type),
                    data: {
                        notificationId: notification.id,
                        type: input.type,
                        ...input.data,
                    },
                    url: this.getUrlForNotificationType(input.type, input.data),
                });
            }
            catch (pushError) {
                this.logger.warn(`Failed to send push notification: ${pushError.message}`);
            }
            this.logger.log(`Notification created for user ${input.userId}: ${input.title}`);
            return notification;
        }
        catch (error) {
            this.logger.error(`Error creating notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createOrderNotification(userId, guestEmail, orderNumber, orderTotal, orderData) {
        try {
            const formatPrice = (price) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(price);
            };
            if (userId) {
                await this.create({
                    userId,
                    title: '🎉 Đặt hàng thành công',
                    message: `Đơn hàng ${orderNumber} đã được tạo thành công với tổng giá trị ${formatPrice(orderTotal)}. Cảm ơn bạn đã đặt hàng!`,
                    type: 'ORDER',
                    data: {
                        orderNumber,
                        orderId: orderData.id,
                        orderTotal,
                        orderStatus: orderData.status,
                        itemCount: orderData.items?.length || 0,
                    },
                });
            }
            const admins = await this.prisma.user.findMany({
                where: {
                    roleType: 'ADMIN',
                    isActive: true,
                },
                select: {
                    id: true,
                },
            });
            for (const admin of admins) {
                await this.create({
                    userId: admin.id,
                    title: '🛍️ Đơn hàng mới',
                    message: `Có đơn hàng mới ${orderNumber} với giá trị ${formatPrice(orderTotal)}${userId ? '' : ` từ khách ${guestEmail || 'ẩn danh'}`}`,
                    type: 'ORDER',
                    data: {
                        orderNumber,
                        orderId: orderData.id,
                        orderTotal,
                        orderStatus: orderData.status,
                        customerId: userId || null,
                        guestEmail: guestEmail || null,
                        itemCount: orderData.items?.length || 0,
                        isNewOrder: true,
                    },
                });
            }
            this.logger.log(`Order notifications sent for order ${orderNumber}`);
        }
        catch (error) {
            this.logger.error(`Error creating order notification: ${error.message}`, error.stack);
        }
    }
    async getNotifications(filters) {
        const where = {
            userId: filters.userId,
        };
        if (filters.isRead !== undefined) {
            where.isRead = filters.isRead;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: filters.skip || 0,
                take: filters.take || 20,
                include: {
                    mentioner: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: {
                    userId: filters.userId,
                    isRead: false,
                },
            }),
        ]);
        return {
            notifications,
            total,
            unreadCount,
            hasMore: (filters.skip || 0) + notifications.length < total,
        };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
    async delete(notificationId, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async deleteAllRead(userId) {
        return this.prisma.notification.deleteMany({
            where: {
                userId,
                isRead: true,
            },
        });
    }
    getIconForNotificationType(type) {
        const iconMap = {
            ORDER: '/icons/icon-192x192.png',
            PROMOTION: '/icons/icon-192x192.png',
            SYSTEM: '/icons/icon-192x192.png',
            TASK: '/icons/icon-192x192.png',
            MENTION: '/icons/icon-192x192.png',
        };
        return iconMap[type] || '/icons/icon-192x192.png';
    }
    getUrlForNotificationType(type, data) {
        switch (type) {
            case 'ORDER':
                return data?.orderId ? `/orders/${data.orderId}` : '/orders';
            case 'TASK':
                return data?.taskId ? `/tasks/${data.taskId}` : '/tasks';
            case 'PROMOTION':
                return '/promotions';
            case 'SYSTEM':
                return '/';
            case 'MENTION':
                return data?.taskId ? `/tasks/${data.taskId}` : '/';
            default:
                return '/';
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => push_notification_service_1.PushNotificationService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        real_time_notification_service_1.RealTimeNotificationService,
        push_notification_service_1.PushNotificationService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map