'use client';

import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

export function usePushNotifications() {
  const { requestNotificationPermission, showNotification, capabilities } = usePWA();

  useEffect(() => {
    // Kiểm tra nếu đã có permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      // Auto-request permission khi user vào website (optional - có thể bỏ để request khi user thao tác)
      // requestNotificationPermission();
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        console.log('Push notification permission granted');
        return true;
      } else {
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
      return false;
    }
  };

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!capabilities.hasNotificationSupport) {
      console.warn('Push notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      await showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    requestPermission,
    sendNotification,
    isSupported: capabilities.hasNotificationSupport,
    permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  };
}
