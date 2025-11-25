'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  isStandalone: boolean;
  canInstall: boolean;
  hasNotificationSupport: boolean;
  hasBackgroundSync: boolean;
  hasPushSupport: boolean;
  isOnline: boolean;
  serviceWorkerReady: boolean;
}

export interface PWAHookReturn {
  capabilities: PWACapabilities;
  installPrompt: PWAInstallPrompt | null;
  install: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  subscribeToPush: (vapidPublicKey: string) => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<boolean>;
  getPushSubscription: () => Promise<PushSubscription | null>;
  registerBackgroundSync: (tag: string) => Promise<void>;
  clearCache: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
}

export function usePWA(): PWAHookReturn {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isStandalone: false,
    canInstall: false,
    hasNotificationSupport: false,
    hasBackgroundSync: false,
    hasPushSupport: false,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    serviceWorkerReady: false,
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize PWA capabilities
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const updateCapabilities = () => {
      setCapabilities(prev => ({
        ...prev,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true,
        canInstall: installPrompt !== null,
        hasNotificationSupport: 'Notification' in window,
        hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        hasPushSupport: 'serviceWorker' in navigator && 'PushManager' in window,
        isOnline: navigator.onLine,
      }));
    };

    updateCapabilities();

    // Listen for online/offline changes
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [installPrompt]);

  // Register service worker
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // console.log('Service Worker registered successfully:', registration);
          setServiceWorkerRegistration(registration);
          setCapabilities(prev => ({ ...prev, serviceWorkerReady: true }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_SUCCESS') {
              // Handle successful background sync
              console.log('Background sync completed:', event.data.action);
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Install PWA
  const install = useCallback(async () => {
    if (!installPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('PWA installation accepted');
        setInstallPrompt(null);
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      throw error;
    }
  }, [installPrompt]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  // Show notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    if (serviceWorkerRegistration) {
      // Use service worker for better reliability
      await serviceWorkerRegistration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }, [serviceWorkerRegistration]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidPublicKey: string): Promise<PushSubscription | null> => {
    if (!serviceWorkerRegistration) {
      throw new Error('Service worker not registered');
    }

    if (!capabilities.hasPushSupport) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Request notification permission first
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check if already subscribed
      let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Already subscribed to push notifications');
        return subscription;
      }

      // Subscribe to push service
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      });

      console.log('Subscribed to push notifications:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [serviceWorkerRegistration, capabilities.hasPushSupport, requestNotificationPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return result;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [serviceWorkerRegistration]);

  // Get current push subscription
  const getPushSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    if (!serviceWorkerRegistration) {
      return null;
    }

    try {
      return await serviceWorkerRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }, [serviceWorkerRegistration]);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!serviceWorkerRegistration || !capabilities.hasBackgroundSync) {
      throw new Error('Background sync not supported');
    }

    try {
      // Type assertion for background sync API
      const registration = serviceWorkerRegistration as any;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }, [serviceWorkerRegistration, capabilities.hasBackgroundSync]);

  // Clear all caches
  const clearCache = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    }

    // Also send message to service worker
    if (serviceWorkerRegistration?.active) {
      serviceWorkerRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }, [serviceWorkerRegistration]);

  // Update app
  const updateApp = useCallback(async () => {
    if (typeof window === 'undefined' || !serviceWorkerRegistration) {
      throw new Error('Service worker not registered or not in browser environment');
    }

    const newWorker = serviceWorkerRegistration.waiting || serviceWorkerRegistration.installing;
    
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for the new service worker to take control
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve();
        });
      });

      // Reload the page
      window.location.reload();
    }
  }, [serviceWorkerRegistration]);

  return {
    capabilities,
    installPrompt,
    install,
    requestNotificationPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush,
    getPushSubscription,
    registerBackgroundSync,
    clearCache,
    updateAvailable,
    updateApp,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Utility functions for PWA features

export const checkPWASupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'serviceWorker' in navigator &&
    'caches' in window &&
    'indexedDB' in window
  );
};

export const isRunningStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

export const getInstallPromptDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Show install prompt after user has been active for some time
  const lastPromptTime = localStorage.getItem('pwa-last-prompt');
  const minDelay = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  if (lastPromptTime) {
    const timeSinceLastPrompt = Date.now() - parseInt(lastPromptTime);
    return Math.max(0, minDelay - timeSinceLastPrompt);
  }
  
  return 0;
};

export const shouldShowInstallPrompt = (): boolean => {
  return (
    !isRunningStandalone() &&
    getInstallPromptDelay() === 0 &&
    checkPWASupport()
  );
};