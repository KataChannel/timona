import { Injectable, Logger } from '@nestjs/common';
import { AdvancedCacheService } from '../common/services/advanced-cache.service';
import { PerformanceMetricsService } from '../common/services/performance-metrics.service';

export interface NotificationEvent {
  id: string;
  type: string;
  userId: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'websocket' | 'email' | 'push' | 'sms';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface NotificationSubscription {
  userId: string;
  socketId: string;
  types: string[];
  filters: Record<string, any>;
  createdAt: Date;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  body: string;
  icon?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  url?: string;
}

@Injectable()
export class RealTimeNotificationService {
  private readonly logger = new Logger(RealTimeNotificationService.name);
  
  // In-memory notification subscriptions
  private subscriptions = new Map<string, NotificationSubscription[]>();
  
  // Notification queue for offline users
  private offlineQueue = new Map<string, NotificationEvent[]>();
  
  // Notification templates
  private templates = new Map<string, NotificationTemplate>();

  constructor(
    private cacheService: AdvancedCacheService,
    private metricsService: PerformanceMetricsService,
  ) {
    this.initializeTemplates();
  }

  async subscribe(userId: string, types: string[], socketId: string, filters: Record<string, any> = {}): Promise<void> {
    try {
      const subscription: NotificationSubscription = {
        userId,
        socketId,
        types,
        filters,
        createdAt: new Date(),
      };

      if (!this.subscriptions.has(userId)) {
        this.subscriptions.set(userId, []);
      }

      const userSubscriptions = this.subscriptions.get(userId)!;
      
      // Remove existing subscription for this socket
      const existingIndex = userSubscriptions.findIndex(s => s.socketId === socketId);
      if (existingIndex !== -1) {
        userSubscriptions.splice(existingIndex, 1);
      }
      
      userSubscriptions.push(subscription);

      // Cache subscription
      await this.cacheService.set(
        `notification:subscription:${userId}:${socketId}`,
        subscription,
        { layer: 'L2_MEDIUM', ttl: 3600 }
      );

      // Send queued notifications
      await this.processOfflineQueue(userId);

      this.logger.debug(`User ${userId} subscribed to notifications: ${types.join(', ')}`);
    } catch (error) {
      this.logger.error(`Error subscribing to notifications: ${error.message}`);
      throw error;
    }
  }

  async unsubscribe(userId: string, socketId: string): Promise<void> {
    try {
      const userSubscriptions = this.subscriptions.get(userId);
      if (userSubscriptions) {
        const filteredSubscriptions = userSubscriptions.filter(s => s.socketId !== socketId);
        
        if (filteredSubscriptions.length === 0) {
          this.subscriptions.delete(userId);
        } else {
          this.subscriptions.set(userId, filteredSubscriptions);
        }
      }

      // Remove from cache
      await this.cacheService.delete(
        `notification:subscription:${userId}:${socketId}`,
        { layer: 'L2_MEDIUM' }
      );

      this.logger.debug(`User ${userId} unsubscribed socket ${socketId}`);
    } catch (error) {
      this.logger.error(`Error unsubscribing: ${error.message}`);
    }
  }

  async notify(event: Partial<NotificationEvent>): Promise<void> {
    try {
      const fullEvent: NotificationEvent = {
        id: event.id || this.generateEventId(),
        type: event.type!,
        userId: event.userId!,
        data: event.data || {},
        timestamp: event.timestamp || new Date(),
        priority: event.priority || 'medium',
        channels: event.channels || [{ type: 'websocket', enabled: true }],
        metadata: event.metadata,
      };

      // Track notification metrics
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

      // Send via WebSocket if user is online
      const sent = await this.sendWebSocketNotification(fullEvent);
      
      if (!sent) {
        // Queue for offline delivery
        await this.queueOfflineNotification(fullEvent);
      }

      // Handle other notification channels
      await this.processOtherChannels(fullEvent);

      // Cache notification for history
      await this.cacheNotification(fullEvent);

      this.logger.debug(`Notification sent: ${fullEvent.type} to user ${fullEvent.userId}`);
    } catch (error) {
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

  async broadcastToTask(taskId: string, event: Partial<NotificationEvent>, excludeUserId?: string): Promise<void> {
    try {
      // Get task participants
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
    } catch (error) {
      this.logger.error(`Error broadcasting to task: ${error.message}`);
    }
  }

  async notifyTaskUpdate(taskId: string, updateType: string, data: any, excludeUserId?: string): Promise<void> {
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

  async notifyTaskComment(taskId: string, comment: any, authorId: string): Promise<void> {
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

  async notifyTaskAssignment(taskId: string, assigneeId: string, assignerId: string): Promise<void> {
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

  async getNotificationHistory(userId: string, limit: number = 50, offset: number = 0): Promise<NotificationEvent[]> {
    try {
      const cached = await this.cacheService.get<NotificationEvent[]>(
        `notification:history:${userId}`,
        { layer: 'L3_SLOW' }
      );

      if (cached) {
        return cached.slice(offset, offset + limit);
      }

      // In a real implementation, load from database
      return [];
    } catch (error) {
      this.logger.error(`Error getting notification history: ${error.message}`);
      return [];
    }
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    try {
      for (const id of notificationIds) {
        await this.cacheService.set(
          `notification:read:${userId}:${id}`,
          { readAt: new Date() },
          { layer: 'L2_MEDIUM', ttl: 86400 * 30 } // 30 days
        );
      }

      this.metricsService.recordMetric({
        name: 'notifications.read.total',
        value: notificationIds.length,
        timestamp: Date.now(),
        unit: 'count',
        tags: { userId },
      });

      this.logger.debug(`Marked ${notificationIds.length} notifications as read for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error marking notifications as read: ${error.message}`);
    }
  }

  private async sendWebSocketNotification(event: NotificationEvent): Promise<boolean> {
    const userSubscriptions = this.subscriptions.get(event.userId);
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return false;
    }

    let sent = false;
    
    for (const subscription of userSubscriptions) {
      // Check if user is subscribed to this notification type
      if (!subscription.types.includes(event.type) && !subscription.types.includes('*')) {
        continue;
      }

      // Apply filters
      if (!this.matchesFilters(event, subscription.filters)) {
        continue;
      }

      try {
        // Emit to socket - this would be handled by the gateway
        // For now, just mark as sent
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
      } catch (error) {
        this.logger.error(`Error sending WebSocket notification: ${error.message}`);
      }
    }

    return sent;
  }

  private async queueOfflineNotification(event: NotificationEvent): Promise<void> {
    if (!this.offlineQueue.has(event.userId)) {
      this.offlineQueue.set(event.userId, []);
    }

    const queue = this.offlineQueue.get(event.userId)!;
    queue.push(event);

    // Limit queue size
    if (queue.length > 100) {
      queue.shift();
    }

    // Cache offline queue
    await this.cacheService.set(
      `notification:offline:${event.userId}`,
      queue,
      { layer: 'L3_SLOW', ttl: 86400 * 7 } // 7 days
    );

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

  private async processOfflineQueue(userId: string): Promise<void> {
    try {
      const queue = this.offlineQueue.get(userId);
      if (!queue || queue.length === 0) {
        return;
      }

      // Send queued notifications
      for (const event of queue) {
        await this.sendWebSocketNotification(event);
      }

      // Clear queue
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
    } catch (error) {
      this.logger.error(`Error processing offline queue: ${error.message}`);
    }
  }

  private async processOtherChannels(event: NotificationEvent): Promise<void> {
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

  private async sendEmailNotification(event: NotificationEvent): Promise<void> {
    // In a real implementation, integrate with email service
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

  private async sendPushNotification(event: NotificationEvent): Promise<void> {
    // In a real implementation, integrate with push notification service
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

  private async sendSmsNotification(event: NotificationEvent): Promise<void> {
    // In a real implementation, integrate with SMS service
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

  private async cacheNotification(event: NotificationEvent): Promise<void> {
    // Add to user's notification history
    const historyKey = `notification:history:${event.userId}`;
    const existing = (await this.cacheService.get<NotificationEvent[]>(historyKey, { layer: 'L3_SLOW' })) || [];
    
    existing.unshift(event);
    
    // Keep last 1000 notifications
    if (existing.length > 1000) {
      existing.splice(1000);
    }

    await this.cacheService.set(historyKey, existing, { layer: 'L3_SLOW', ttl: 86400 * 30 });
  }

  private matchesFilters(event: NotificationEvent, filters: Record<string, any>): boolean {
    // Simple filter matching - expand based on needs
    for (const [key, value] of Object.entries(filters)) {
      if (event.data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private generateEventId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async getTaskParticipants(taskId: string): Promise<string[]> {
    // In a real implementation, query database for task participants
    // For now, return empty array
    return [];
  }

  private initializeTemplates(): void {
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
}