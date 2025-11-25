import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealTimeNotificationService } from '../realtime/real-time-notification.service';
import { PushNotificationService } from './push-notification.service';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'SYSTEM' | 'PROMOTION' | 'TASK' | 'MENTION';
  data?: any;
  taskId?: string;
  mentionedBy?: string;
}

export interface NotificationFilters {
  userId: string;
  isRead?: boolean;
  type?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realTimeService: RealTimeNotificationService,
    @Inject(forwardRef(() => PushNotificationService))
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async createTaskAssignedNotification(taskId: string, assignedUserId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { user: true },
    });

    if (!task) return;

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

  async createTaskCompletedNotification(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        shares: {
          where: { isActive: true },
          include: { sharedWithUser: true },
        },
      },
    });

    if (!task) return;

    // Notify all collaborators about task completion
    const notifications = task.shares.map(share => 
      this.prisma.notification.create({
        data: {
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed`,
          data: { taskId },
          user: { connect: { id: share.sharedWith! } },
        },
      })
    );

    return Promise.all(notifications);
  }

  async createTaskCommentNotification(taskId: string, commentAuthorId: string) {
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

    if (!task) return;

    const notifyUsers = new Set<string>();
    
    // Notify task owner
    if (task.userId !== commentAuthorId) {
      notifyUsers.add(task.userId);
    }
    
    // Notify collaborators
    task.shares.forEach(share => {
      if (share.sharedWith && share.sharedWith !== commentAuthorId) {
        notifyUsers.add(share.sharedWith);
      }
    });

    const notifications = Array.from(notifyUsers).map(userId => 
      this.prisma.notification.create({
        data: {
          type: 'task_comment',
          title: 'New Comment',
          message: `New comment on task "${task.title}"`,
          data: { taskId },
          user: { connect: { id: userId } },
        },
      })
    );

    return Promise.all(notifications);
  }

  async findByUserId(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Tạo notification chung
   */
  async create(input: CreateNotificationInput) {
    try {
      // Lưu notification vào database
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

      // Gửi real-time notification qua websocket
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
          { type: 'email', enabled: input.type === 'ORDER' }, // Email chỉ cho ORDER
        ],
      });

      // Gửi push notification
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
      } catch (pushError) {
        // Don't fail notification creation if push fails
        this.logger.warn(`Failed to send push notification: ${pushError.message}`);
      }

      this.logger.log(`Notification created for user ${input.userId}: ${input.title}`);

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Tạo notification khi đặt hàng thành công
   */
  async createOrderNotification(
    userId: string | undefined,
    guestEmail: string | undefined,
    orderNumber: string,
    orderTotal: number,
    orderData: any,
  ) {
    try {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price);
      };

      // Notification cho customer (nếu có userId)
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

      // Notification cho admin (lấy danh sách admin từ DB)
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
    } catch (error) {
      this.logger.error(`Error creating order notification: ${error.message}`, error.stack);
      // Không throw error để không ảnh hưởng đến flow tạo order
    }
  }

  /**
   * Lấy danh sách notifications của user
   */
  async getNotifications(filters: NotificationFilters) {
    const where: any = {
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

  /**
   * Đếm số notification chưa đọc
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Xóa notification
   */
  async delete(notificationId: string, userId: string) {
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

  /**
   * Xóa tất cả notifications đã đọc
   */
  async deleteAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  }

  /**
   * Helper: Get icon for notification type
   */
  private getIconForNotificationType(type: string): string {
    const iconMap: Record<string, string> = {
      ORDER: '/icons/icon-192x192.png',
      PROMOTION: '/icons/icon-192x192.png',
      SYSTEM: '/icons/icon-192x192.png',
      TASK: '/icons/icon-192x192.png',
      MENTION: '/icons/icon-192x192.png',
    };
    return iconMap[type] || '/icons/icon-192x192.png';
  }

  /**
   * Helper: Get URL for notification type
   */
  private getUrlForNotificationType(type: string, data: any): string {
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
}
