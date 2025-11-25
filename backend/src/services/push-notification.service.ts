import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';
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

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private readonly prisma: PrismaService) {
    // Configure VAPID details
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@rausach.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.error(
        'VAPID keys not configured. Push notifications will not work. ' +
        'Generate keys with: bunx web-push generate-vapid-keys'
      );
      return;
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    this.logger.log('Push notification service initialized with VAPID keys');
  }

  /**
   * Save push subscription to database
   */
  async saveSubscription(
    userId: string,
    subscription: PushSubscriptionData,
  ): Promise<void> {
    try {
      // Check if subscription already exists
      const existing = await this.prisma.pushSubscription.findUnique({
        where: { endpoint: subscription.endpoint },
      });

      if (existing) {
        // Update existing subscription
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
      } else {
        // Create new subscription
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
    } catch (error) {
      this.logger.error(`Failed to save push subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove push subscription from database
   */
  async removeSubscription(endpoint: string): Promise<void> {
    try {
      await this.prisma.pushSubscription.delete({
        where: { endpoint },
      });
      this.logger.log(`Removed push subscription: ${endpoint}`);
    } catch (error) {
      this.logger.error(`Failed to remove push subscription: ${error.message}`);
    }
  }

  /**
   * Send push notification to specific user
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    try {
      // Get all subscriptions for user
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
      });

      if (subscriptions.length === 0) {
        this.logger.debug(`No push subscriptions found for user ${userId}`);
        return { sent: 0, failed: 0 };
      }

      // Send to all devices
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendPushNotification(sub, payload)),
      );

      // Count results
      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(
        `Sent push notification to user ${userId}: ${sent} sent, ${failed} failed`,
      );

      return { sent, failed };
    } catch (error) {
      this.logger.error(`Failed to send push notification to user: ${error.message}`);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => this.sendToUser(userId, payload)),
      );

      const totalSent = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r as any).value.sent, 0);

      const totalFailed = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r as any).value.failed, 0);

      this.logger.log(
        `Sent push notifications to ${userIds.length} users: ${totalSent} sent, ${totalFailed} failed`,
      );

      return { sent: totalSent, failed: totalFailed };
    } catch (error) {
      this.logger.error(`Failed to send push notifications to users: ${error.message}`);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send push notification to specific subscription
   */
  private async sendPushNotification(
    subscription: any,
    payload: PushNotificationPayload,
  ): Promise<void> {
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
    } catch (error) {
      // Handle expired subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        this.logger.warn(
          `Push subscription expired, removing: ${subscription.endpoint}`,
        );
        await this.removeSubscription(subscription.endpoint);
      } else {
        this.logger.error(
          `Failed to send push notification: ${error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Get VAPID public key for frontend
   */
  getPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  }

  /**
   * Test push notification
   */
  async testNotification(userId: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Test Push Notification',
      message: 'Hệ thống push notification đang hoạt động tốt! 🎉',
      url: '/',
    });
  }
}
