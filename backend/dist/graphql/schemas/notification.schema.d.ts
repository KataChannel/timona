export declare class MentionerType {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}
export declare class NotificationType {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    data?: any;
    taskId?: string;
    mentionedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    mentioner?: MentionerType;
}
export declare class NotificationListResponse {
    notifications: NotificationType[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
}
export declare class MarkNotificationAsReadInput {
    notificationId: string;
}
export declare class DeleteNotificationInput {
    notificationId: string;
}
