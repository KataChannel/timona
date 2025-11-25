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
var RealTimeNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeNotificationService = void 0;
const common_1 = require("@nestjs/common");
const advanced_cache_service_1 = require("../common/services/advanced-cache.service");
const performance_metrics_service_1 = require("../common/services/performance-metrics.service");
let RealTimeNotificationService = RealTimeNotificationService_1 = class RealTimeNotificationService {
    constructor(cacheService, metricsService) {
        this.cacheService = cacheService;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(RealTimeNotificationService_1.name);
        this.subscriptions = new Map();
        this.offlineQueue = new Map();
        this.templates = new Map();
        this.initializeTemplates();
    }
    async subscribe(userId, types, socketId, filters = {}) {
        try {
            const subscription = {
                userId,
                socketId,
                types,
                filters,
                createdAt: new Date(),
            };
            if (!this.subscriptions.has(userId)) {
                this.subscriptions.set(userId, []);
            }
            const userSubscriptions = this.subscriptions.get(userId);
            const existingIndex = userSubscriptions.findIndex(s => s.socketId === socketId);
            if (existingIndex !== -1) {
                userSubscriptions.splice(existingIndex, 1);
            }
            userSubscriptions.push(subscription);
            await this.cacheService.set(`notification:subscription:${userId}:${socketId}`, subscription, { layer: 'L2_MEDIUM', ttl: 3600 });
            await this.processOfflineQueue(userId);
            this.logger.debug(`User ${userId} subscribed to notifications: ${types.join(', ')}`);
        }
        catch (error) {
            this.logger.error(`Error subscribing to notifications: ${error.message}`);
            throw error;
        }
    }
    async unsubscribe(userId, socketId) {
        try {
            const userSubscriptions = this.subscriptions.get(userId);
            if (userSubscriptions) {
                const filteredSubscriptions = userSubscriptions.filter(s => s.socketId !== socketId);
                if (filteredSubscriptions.length === 0) {
                    this.subscriptions.delete(userId);
                }
                else {
                    this.subscriptions.set(userId, filteredSubscriptions);
                }
            }
            await this.cacheService.delete(`notification:subscription:${userId}:${socketId}`, { layer: 'L2_MEDIUM' });
            this.logger.debug(`User ${userId} unsubscribed socket ${socketId}`);
        }
        catch (error) {
            this.logger.error(`Error unsubscribing: ${error.message}`);
        }
    }
    async notify(event) {
        try {
            const fullEvent = {
                id: event.id || this.generateEventId(),
                type: event.type,
                userId: event.userId,
                data: event.data || {},
                timestamp: event.timestamp || new Date(),
                priority: event.priority || 'medium',
                channels: event.channels || [{ type: 'websocket', enabled: true }],
                metadata: event.metadata,
            };
            this.metricsService.recordMetric({
                name: 'notifications.sent.total',
                value: 1,
                timestamp: Date.now(),
                unit: 'count',
                tags: {
                    type: fullEvent.type,
                    priority: fullEvent.priority,
                },
            });
            const sent = await this.sendWebSocketNotification(fullEvent);
            if (!sent) {
                await this.queueOfflineNotification(fullEvent);
            }
            await this.processOtherChannels(fullEvent);
            await this.cacheNotification(fullEvent);
            this.logger.debug(`Notification sent: ${fullEvent.type} to user ${fullEvent.userId}`);
        }
        catch (error) {
            this.logger.error(`Error sending notification: ${error.message}`);
            this.metricsService.recordMetric({
                name: 'notifications.errors.total',
                value: 1,
                timestamp: Date.now(),
                unit: 'count',
                tags: {
                    type: event.type || 'unknown',
                    error: error.message,
                },
            });
        }
    }
    async broadcastToTask(taskId, event, excludeUserId) {
        try {
            const participants = await this.getTaskParticipants(taskId);
            for (const userId of participants) {
                if (excludeUserId && userId === excludeUserId) {
                    continue;
                }
                await this.notify({
                    ...event,
                    userId,
                    metadata: {
                        ...event.metadata,
                        taskId,
                        broadcast: true,
                    },
                });
            }
            this.logger.debug(`Broadcasted notification to task ${taskId} participants`);
        }
        catch (error) {
            this.logger.error(`Error broadcasting to task: ${error.message}`);
        }
    }
    async notifyTaskUpdate(taskId, updateType, data, excludeUserId) {
        const template = this.templates.get('task.updated');
        await this.broadcastToTask(taskId, {
            type: 'task.updated',
            data: {
                taskId,
                updateType,
                changes: data,
                template: template ? {
                    title: template.title.replace('{{taskId}}', taskId),
                    body: template.body.replace('{{updateType}}', updateType),
                } : undefined,
            },
            priority: 'medium',
            channels: [
                { type: 'websocket', enabled: true },
                { type: 'push', enabled: true },
            ],
        }, excludeUserId);
    }
    async notifyTaskComment(taskId, comment, authorId) {
        const template = this.templates.get('task.comment');
        await this.broadcastToTask(taskId, {
            type: 'task.comment',
            data: {
                taskId,
                comment,
                authorId,
                template: template ? {
                    title: template.title.replace('{{taskId}}', taskId),
                    body: template.body.replace('{{author}}', comment.authorName || 'Someone'),
                } : undefined,
            },
            priority: 'medium',
            channels: [
                { type: 'websocket', enabled: true },
                { type: 'push', enabled: true },
            ],
        }, authorId);
    }
    async notifyTaskAssignment(taskId, assigneeId, assignerId) {
        const template = this.templates.get('task.assigned');
        await this.notify({
            type: 'task.assigned',
            userId: assigneeId,
            data: {
                taskId,
                assignerId,
                template: template ? {
                    title: template.title.replace('{{taskId}}', taskId),
                    body: template.body,
                } : undefined,
            },
            priority: 'high',
            channels: [
                { type: 'websocket', enabled: true },
                { type: 'email', enabled: true },
                { type: 'push', enabled: true },
            ],
        });
    }
    async getNotificationHistory(userId, limit = 50, offset = 0) {
        try {
            const cached = await this.cacheService.get(`notification:history:${userId}`, { layer: 'L3_SLOW' });
            if (cached) {
                return cached.slice(offset, offset + limit);
            }
            return [];
        }
        catch (error) {
            this.logger.error(`Error getting notification history: ${error.message}`);
            return [];
        }
    }
    async markAsRead(userId, notificationIds) {
        try {
            for (const id of notificationIds) {
                await this.cacheService.set(`notification:read:${userId}:${id}`, { readAt: new Date() }, { layer: 'L2_MEDIUM', ttl: 86400 * 30 });
            }
            this.metricsService.recordMetric({
                name: 'notifications.read.total',
                value: notificationIds.length,
                timestamp: Date.now(),
                unit: 'count',
                tags: { userId },
            });
            this.logger.debug(`Marked ${notificationIds.length} notifications as read for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error marking notifications as read: ${error.message}`);
        }
    }
    async sendWebSocketNotification(event) {
        const userSubscriptions = this.subscriptions.get(event.userId);
        if (!userSubscriptions || userSubscriptions.length === 0) {
            return false;
        }
        let sent = false;
        for (const subscription of userSubscriptions) {
            if (!subscription.types.includes(event.type) && !subscription.types.includes('*')) {
                continue;
            }
            if (!this.matchesFilters(event, subscription.filters)) {
                continue;
            }
            try {
                sent = true;
                this.metricsService.recordMetric({
                    name: 'notifications.websocket.sent',
                    value: 1,
                    timestamp: Date.now(),
                    unit: 'count',
                    tags: {
                        type: event.type,
                        userId: event.userId,
                    },
                });
            }
            catch (error) {
                this.logger.error(`Error sending WebSocket notification: ${error.message}`);
            }
        }
        return sent;
    }
    async queueOfflineNotification(event) {
        if (!this.offlineQueue.has(event.userId)) {
            this.offlineQueue.set(event.userId, []);
        }
        const queue = this.offlineQueue.get(event.userId);
        queue.push(event);
        if (queue.length > 100) {
            queue.shift();
        }
        await this.cacheService.set(`notification:offline:${event.userId}`, queue, { layer: 'L3_SLOW', ttl: 86400 * 7 });
        this.metricsService.recordMetric({
            name: 'notifications.queued.total',
            value: 1,
            timestamp: Date.now(),
            unit: 'count',
            tags: {
                userId: event.userId,
                type: event.type,
            },
        });
    }
    async processOfflineQueue(userId) {
        try {
            const queue = this.offlineQueue.get(userId);
            if (!queue || queue.length === 0) {
                return;
            }
            for (const event of queue) {
                await this.sendWebSocketNotification(event);
            }
            this.offlineQueue.delete(userId);
            await this.cacheService.delete(`notification:offline:${userId}`, { layer: 'L3_SLOW' });
            this.metricsService.recordMetric({
                name: 'notifications.queue.processed',
                value: queue.length,
                timestamp: Date.now(),
                unit: 'count',
                tags: { userId },
            });
            this.logger.debug(`Processed ${queue.length} offline notifications for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error processing offline queue: ${error.message}`);
        }
    }
    async processOtherChannels(event) {
        for (const channel of event.channels) {
            if (!channel.enabled || channel.type === 'websocket') {
                continue;
            }
            switch (channel.type) {
                case 'email':
                    await this.sendEmailNotification(event);
                    break;
                case 'push':
                    await this.sendPushNotification(event);
                    break;
                case 'sms':
                    await this.sendSmsNotification(event);
                    break;
            }
        }
    }
    async sendEmailNotification(event) {
        this.logger.debug(`Would send email notification: ${event.type} to user ${event.userId}`);
        this.metricsService.recordMetric({
            name: 'notifications.email.sent',
            value: 1,
            timestamp: Date.now(),
            unit: 'count',
            tags: {
                type: event.type,
                userId: event.userId,
            },
        });
    }
    async sendPushNotification(event) {
        this.logger.debug(`Would send push notification: ${event.type} to user ${event.userId}`);
        this.metricsService.recordMetric({
            name: 'notifications.push.sent',
            value: 1,
            timestamp: Date.now(),
            unit: 'count',
            tags: {
                type: event.type,
                userId: event.userId,
            },
        });
    }
    async sendSmsNotification(event) {
        this.logger.debug(`Would send SMS notification: ${event.type} to user ${event.userId}`);
        this.metricsService.recordMetric({
            name: 'notifications.sms.sent',
            value: 1,
            timestamp: Date.now(),
            unit: 'count',
            tags: {
                type: event.type,
                userId: event.userId,
            },
        });
    }
    async cacheNotification(event) {
        const historyKey = `notification:history:${event.userId}`;
        const existing = (await this.cacheService.get(historyKey, { layer: 'L3_SLOW' })) || [];
        existing.unshift(event);
        if (existing.length > 1000) {
            existing.splice(1000);
        }
        await this.cacheService.set(historyKey, existing, { layer: 'L3_SLOW', ttl: 86400 * 30 });
    }
    matchesFilters(event, filters) {
        for (const [key, value] of Object.entries(filters)) {
            if (event.data[key] !== value) {
                return false;
            }
        }
        return true;
    }
    generateEventId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
    async getTaskParticipants(taskId) {
        return [];
    }
    initializeTemplates() {
        this.templates.set('task.updated', {
            type: 'task.updated',
            title: 'Task {{taskId}} Updated',
            body: 'Task has been {{updateType}}',
            icon: '📝',
        });
        this.templates.set('task.comment', {
            type: 'task.comment',
            title: 'New Comment on Task {{taskId}}',
            body: '{{author}} added a comment',
            icon: '💬',
            actions: [
                { action: 'view', title: 'View Task', url: '/tasks/{{taskId}}' },
                { action: 'reply', title: 'Reply' },
            ],
        });
        this.templates.set('task.assigned', {
            type: 'task.assigned',
            title: 'You have been assigned to Task {{taskId}}',
            body: 'A new task has been assigned to you',
            icon: '👤',
            actions: [
                { action: 'view', title: 'View Task', url: '/tasks/{{taskId}}' },
                { action: 'accept', title: 'Accept' },
            ],
        });
        this.templates.set('task.due_soon', {
            type: 'task.due_soon',
            title: 'Task Due Soon',
            body: 'Task {{taskId}} is due in {{timeRemaining}}',
            icon: '⏰',
            actions: [
                { action: 'view', title: 'View Task', url: '/tasks/{{taskId}}' },
            ],
        });
        this.templates.set('collaboration.user_joined', {
            type: 'collaboration.user_joined',
            title: 'User Joined Collaboration',
            body: '{{userName}} is now editing the task',
            icon: '👥',
        });
    }
};
exports.RealTimeNotificationService = RealTimeNotificationService;
exports.RealTimeNotificationService = RealTimeNotificationService = RealTimeNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService,
        performance_metrics_service_1.PerformanceMetricsService])
], RealTimeNotificationService);
//# sourceMappingURL=real-time-notification.service.js.map