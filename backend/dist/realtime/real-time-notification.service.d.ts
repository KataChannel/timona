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
export declare class RealTimeNotificationService {
    private cacheService;
    private metricsService;
    private readonly logger;
    private subscriptions;
    private offlineQueue;
    private templates;
    constructor(cacheService: AdvancedCacheService, metricsService: PerformanceMetricsService);
    subscribe(userId: string, types: string[], socketId: string, filters?: Record<string, any>): Promise<void>;
    unsubscribe(userId: string, socketId: string): Promise<void>;
    notify(event: Partial<NotificationEvent>): Promise<void>;
    broadcastToTask(taskId: string, event: Partial<NotificationEvent>, excludeUserId?: string): Promise<void>;
    notifyTaskUpdate(taskId: string, updateType: string, data: any, excludeUserId?: string): Promise<void>;
    notifyTaskComment(taskId: string, comment: any, authorId: string): Promise<void>;
    notifyTaskAssignment(taskId: string, assigneeId: string, assignerId: string): Promise<void>;
    getNotificationHistory(userId: string, limit?: number, offset?: number): Promise<NotificationEvent[]>;
    markAsRead(userId: string, notificationIds: string[]): Promise<void>;
    private sendWebSocketNotification;
    private queueOfflineNotification;
    private processOfflineQueue;
    private processOtherChannels;
    private sendEmailNotification;
    private sendPushNotification;
    private sendSmsNotification;
    private cacheNotification;
    private matchesFilters;
    private generateEventId;
    private getTaskParticipants;
    private initializeTemplates;
}
