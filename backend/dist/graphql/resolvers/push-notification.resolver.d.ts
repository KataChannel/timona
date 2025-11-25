import { PushNotificationService } from '../../services/push-notification.service';
export declare class PushNotificationResolver {
    private readonly pushNotificationService;
    constructor(pushNotificationService: PushNotificationService);
    getVapidPublicKey(): string;
    subscribeToPush(endpoint: string, p256dh: string, auth: string, context: any): Promise<boolean>;
    unsubscribeFromPush(endpoint: string): Promise<boolean>;
    testPushNotification(context: any): Promise<boolean>;
}
