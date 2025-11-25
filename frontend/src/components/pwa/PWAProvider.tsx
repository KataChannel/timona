'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineStatus } from './OfflineStatus';
import { usePWA } from '../../hooks/usePWA';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  pendingActions: number;
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const PWAContext = createContext<PWAContextType | null>(null);

interface PWAProviderProps {
  children: React.ReactNode;
  enableAutoPrompt?: boolean;
  enableOfflineStatus?: boolean;
  installPromptDelay?: number;
  offlineStatusPosition?: 'top' | 'bottom';
  className?: string;
}

export function PWAProvider({
  children,
  enableAutoPrompt = true,
  enableOfflineStatus = true,
  installPromptDelay = 10000,
  offlineStatusPosition = 'top',
  className = ''
}: PWAProviderProps) {
  // Fix SSR issue by checking if window is available
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [pendingActions, setPendingActions] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const { capabilities, install, showNotification } = usePWA();

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor pending actions (simplified for context)
  useEffect(() => {
    // This would typically integrate with your offline service
    // For now, we'll just simulate it
    const updatePendingActions = () => {
      // In a real implementation, this would check IndexedDB
      setPendingActions(0);
    };

    updatePendingActions();
    const interval = setInterval(updatePendingActions, 5000);
    return () => clearInterval(interval);
  }, []);

  // PWA Installation prompt management
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!capabilities.canInstall || capabilities.isStandalone) {
      return;
    }

    // Check if user has dismissed the prompt recently
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const cooldownPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (Date.now() - dismissedTime < cooldownPeriod) {
        return;
      }
    }

    if (enableAutoPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, installPromptDelay);

      return () => clearTimeout(timer);
    }
  }, [capabilities.canInstall, capabilities.isStandalone, enableAutoPrompt, installPromptDelay]);

  // Register service worker and handle updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // console.log('Service Worker registered successfully:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'SYNC_COMPLETE':
            setPendingActions(data.remainingActions);
            if (data.successCount > 0) {
              showNotification('Sync Complete', {
                body: `${data.successCount} item${data.successCount !== 1 ? 's' : ''} synced successfully`,
                tag: 'sync-complete'
              });
            }
            break;
            
          case 'SYNC_ERROR':
            console.error('Sync error:', data.error);
            break;
            
          case 'CACHE_UPDATED':
            // Cache has been updated, potentially show refresh prompt
            break;
        }
      });
    }
  }, [showNotification]);

  const showUpdateNotification = async () => {
    if (capabilities.hasNotificationSupport) {
      await showNotification('Update Available', {
        body: 'A new version of the app is available. Refresh to update.',
        tag: 'app-update'
      });
    }
  };

  const contextValue: PWAContextType = {
    isOnline,
    isInstalled: capabilities.isStandalone,
    canInstall: capabilities.canInstall,
    pendingActions,
    showInstallPrompt: () => setShowPrompt(true),
    hideInstallPrompt: () => setShowPrompt(false),
    requestNotificationPermission: async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return await Notification.requestPermission();
      }
      return 'denied';
    }
  };

  return (
    <PWAContext.Provider value={contextValue}>
      <div className={className}>
        {children}
        
        {/* PWA Install Prompt */}
        {enableAutoPrompt && showPrompt && (
          <PWAInstallPrompt 
            showDelay={0} // Already handled by provider
          />
        )}
        
        {/* Offline Status Indicator */}
        {enableOfflineStatus && (
          <OfflineStatus 
            position={offlineStatusPosition}
            showSyncStatus={true}
          />
        )}
      </div>
    </PWAContext.Provider>
  );
}

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}

// Higher-order component for PWA-aware components
export function withPWA<T extends object>(Component: React.ComponentType<T>) {
  return function PWAWrappedComponent(props: T) {
    const pwaContext = usePWAContext();
    
    return (
      <Component 
        {...props} 
        pwa={pwaContext}
      />
    );
  };
}

// PWA-aware hooks
export function usePWANetworkStatus() {
  const { isOnline } = usePWAContext();
  return { isOnline, isOffline: !isOnline };
}

export function usePWAInstallation() {
  const { 
    isInstalled, 
    canInstall, 
    showInstallPrompt 
  } = usePWAContext();
  
  return {
    isInstalled,
    canInstall,
    showInstallPrompt,
    installationStatus: isInstalled ? 'installed' : canInstall ? 'available' : 'unavailable'
  };
}

export function usePWASync() {
  const { pendingActions, isOnline } = usePWAContext();
  
  const triggerSync = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as any).sync.register('background-sync');
      }).catch(console.error);
    }
  };

  return {
    pendingActions,
    hasPendingActions: pendingActions > 0,
    canSync: isOnline,
    triggerSync
  };
}