import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NotificationService } from '../../services/notification.service';
import {
  NotificationType,
  NotificationListResponse,
  MarkNotificationAsReadInput,
  DeleteNotificationInput,
} from '../../graphql/schemas/notification.schema';

@Resolver(() => NotificationType)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Lấy danh sách notifications của user hiện tại
   */
  @Query(() => NotificationListResponse)
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Args('isRead', { type: () => Boolean, nullable: true }) isRead?: boolean,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Context() context?: any,
  ) {
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

  /**
   * Đếm số notification chưa đọc
   */
  @Query(() => Number)
  @UseGuards(JwtAuthGuard)
  async getUnreadNotificationsCount(@Context() context?: any) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.notificationService.getUnreadCount(userId);
  }

  /**
   * Đánh dấu notification đã đọc
   */
  @Mutation(() => NotificationType)
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(
    @Args('input') input: MarkNotificationAsReadInput,
    @Context() context?: any,
  ) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.notificationService.markAsRead(input.notificationId, userId);
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@Context() context?: any) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.notificationService.markAllAsRead(userId);
    return true;
  }

  /**
   * Xóa notification
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Args('input') input: DeleteNotificationInput,
    @Context() context?: any,
  ) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.notificationService.delete(input.notificationId, userId);
    return true;
  }

  /**
   * Xóa tất cả notifications đã đọc
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteAllReadNotifications(@Context() context?: any) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.notificationService.deleteAllRead(userId);
    return true;
  }
}
