'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { usePWA } from '@/hooks/usePWA';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  DELETE_NOTIFICATION,
} from '@/graphql/notification.queries';
import {
  GET_VAPID_PUBLIC_KEY,
  SUBSCRIBE_TO_PUSH,
} from '@/graphql/push-notification.queries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { subscribeToPush, requestNotificationPermission, capabilities } = usePWA();
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Query VAPID public key
  const { data: vapidData } = useQuery(GET_VAPID_PUBLIC_KEY, {
    skip: !isAuthenticated,
  });

  // Mutation to save push subscription
  const [savePushSubscription] = useMutation(SUBSCRIBE_TO_PUSH);

  // Auto-setup push notifications when user authenticated
  useEffect(() => {
    if (!isAuthenticated || !vapidData?.getVapidPublicKey || pushSubscribed) {
      return;
    }

    const setupPushNotifications = async () => {
      try {
        // Request permission sau 2 giây để không làm phiền user ngay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Request notification permission
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }

        // Subscribe to push service
        const subscription = await subscribeToPush(vapidData.getVapidPublicKey);
        if (!subscription) {
          console.log('Failed to subscribe to push notifications');
          return;
        }

        // Save subscription to backend
        const subscriptionJson = subscription.toJSON();
        await savePushSubscription({
          variables: {
            endpoint: subscription.endpoint,
            p256dh: subscriptionJson.keys?.p256dh || '',
            auth: subscriptionJson.keys?.auth || '',
          },
        });

        setPushSubscribed(true);
        console.log('Push notifications enabled successfully');
      } catch (error) {
        console.error('Failed to setup push notifications:', error);
      }
    };

    setupPushNotifications();
  }, [isAuthenticated, vapidData, pushSubscribed, subscribeToPush, requestNotificationPermission, savePushSubscription]);

  // Query unread count
  const { data: countData } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    skip: !isAuthenticated,
    pollInterval: 30000, // Poll every 30 seconds
  });

  // Query notifications when dropdown opens
  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { skip: 0, take: 20 },
    skip: !isAuthenticated || !isOpen,
    fetchPolicy: 'network-only',
  });

  // Mutations
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [GET_UNREAD_NOTIFICATIONS_COUNT, GET_NOTIFICATIONS],
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
    refetchQueries: [GET_UNREAD_NOTIFICATIONS_COUNT, GET_NOTIFICATIONS],
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    refetchQueries: [GET_UNREAD_NOTIFICATIONS_COUNT, GET_NOTIFICATIONS],
  });

  if (!isAuthenticated) {
    return null;
  }

  const unreadCount = countData?.getUnreadNotificationsCount || 0;
  const notifications = data?.getNotifications?.notifications || [];

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({
        variables: {
          input: { notificationId },
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({
        variables: {
          input: { notificationId },
        },
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return '🛍️';
      case 'PROMOTION':
        return '🎁';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] sm:w-[420px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-base">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-4 w-4 mr-1" />
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Chưa có thông báo nào
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors relative group',
                    !notification.isRead && 'bg-blue-50/50'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to notifications page if exists
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
