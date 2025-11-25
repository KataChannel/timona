import { PrismaService } from '../prisma/prisma.service';
export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
export interface PushNotificationPayload {
    title: string;
    message: string;
    icon?: string;
    badge?: string;
    data?: any;
    url?: string;
}
export declare class PushNotificationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    saveSubscription(userId: string, subscription: PushSubscriptionData): Promise<void>;
    removeSubscription(endpoint: string): Promise<void>;
    sendToUser(userId: string, payload: PushNotificationPayload): Promise<{
        sent: number;
        failed: number;
    }>;
    sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<{
        sent: number;
        failed: number;
    }>;
    private sendPushNotification;
    getPublicKey(): string;
    testNotification(userId: string): Promise<void>;
}
