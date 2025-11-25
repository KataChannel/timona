import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PushNotificationService, PushSubscriptionData } from '../../services/push-notification.service';

@Resolver()
export class PushNotificationResolver {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  getVapidPublicKey(): string {
    return this.pushNotificationService.getPublicKey();
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async subscribeToPush(
    @Args('endpoint') endpoint: string,
    @Args('p256dh') p256dh: string,
    @Args('auth') auth: string,
    @Context() context: any,
  ): Promise<boolean> {
    try {
      const userId = context.req.user.userId;
      
      const subscription: PushSubscriptionData = {
        endpoint,
        keys: {
          p256dh,
          auth,
        },
      };

      await this.pushNotificationService.saveSubscription(userId, subscription);
      return true;
    } catch (error) {
      console.error('Failed to save push subscription:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unsubscribeFromPush(
    @Args('endpoint') endpoint: string,
  ): Promise<boolean> {
    try {
      await this.pushNotificationService.removeSubscription(endpoint);
      return true;
    } catch (error) {
      console.error('Failed to remove push subscription:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async testPushNotification(
    @Context() context: any,
  ): Promise<boolean> {
    try {
      const userId = context.req.user.userId;
      await this.pushNotificationService.testNotification(userId);
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }
}
