'use client';

import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { offlineDataService } from '../../services/offlineDataService';

interface OfflineStatusProps {
  className?: string;
  position?: 'top' | 'bottom';
  showSyncStatus?: boolean;
}

export function OfflineStatus({ 
  className = '', 
  position = 'top',
  showSyncStatus = true 
}: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [pendingActions, setPendingActions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const { capabilities } = usePWA();

  // Monitor online status
  useEffect(() => {
    // Set initial online status on client mount
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor pending actions and sync status
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const actions = await offlineDataService.getPendingActions();
        setPendingActions(actions.length);
        
        const syncStatus = await offlineDataService.getSyncStatus();
        setIsSyncing(false); // We'll handle syncing state separately
        if (syncStatus.lastSync > 0) {
          setLastSyncTime(new Date(syncStatus.lastSync));
        }
      } catch (error) {
        console.error('Failed to get offline status:', error);
      }
    };

    updateStatus();

    // Poll for status updates
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions > 0 && !isSyncing) {
      // Trigger background sync through service worker
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return (registration as any).sync.register('background-sync');
        }).catch(console.error);
      }
    }
  }, [isOnline, pendingActions, isSyncing]);

  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4'
  };

  // Don't show anything if online and no pending actions
  if (isOnline && pendingActions === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className={`
      fixed ${positionClasses[position]} right-4 z-40
      ${className}
    `}>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="
          bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-2
          shadow-lg backdrop-blur-sm
          animate-in slide-in-from-right-4 duration-300
        ">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-800">
                You're offline
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Changes will sync when you're back online
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      {showSyncStatus && (isSyncing || pendingActions > 0) && (
        <div className="
          bg-blue-50 border border-blue-200 rounded-lg px-4 py-3
          shadow-lg backdrop-blur-sm
          animate-in slide-in-from-right-4 duration-300
        ">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isSyncing ? (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">
                    {pendingActions}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {isSyncing ? (
                <>
                  <p className="text-sm font-medium text-blue-800">
                    Syncing changes...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {pendingActions} action{pendingActions !== 1 ? 's' : ''} pending
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-orange-800">
                    {pendingActions} change{pendingActions !== 1 ? 's' : ''} pending
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {isOnline ? 'Will sync automatically' : 'Waiting for connection'}
                  </p>
                </>
              )}
            </div>

            {/* Manual sync button */}
            {isOnline && pendingActions > 0 && !isSyncing && (
              <button
                onClick={() => {
                  // Trigger manual sync through service worker
                  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                    navigator.serviceWorker.ready.then(registration => {
                      return (registration as any).sync.register('background-sync');
                    }).catch(console.error);
                  }
                }}
                className="
                  text-blue-600 hover:text-blue-700 focus:outline-none
                  transition-colors duration-200
                "
                title="Sync now"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Last sync time */}
      {showSyncStatus && isOnline && lastSyncTime && pendingActions === 0 && (
        <div className="
          bg-green-50 border border-green-200 rounded-lg px-4 py-2 mt-2
          shadow-lg backdrop-blur-sm
          animate-in slide-in-from-right-4 duration-300
        ">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600">
                Last sync: {formatSyncTime(lastSyncTime)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Format sync time for display
function formatSyncTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Compact offline indicator for mobile
export function CompactOfflineStatus({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updatePendingActions = async () => {
      try {
        const actions = await offlineDataService.getPendingActions();
        setPendingActions(actions.length);
      } catch (error) {
        console.error('Failed to get pending actions:', error);
      }
    };

    updatePendingActions();
    const interval = setInterval(updatePendingActions, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && pendingActions === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!isOnline && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-xs text-yellow-600 font-medium">Offline</span>
        </div>
      )}
      
      {pendingActions > 0 && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full" />
          <span className="text-xs text-orange-600 font-medium">
            {pendingActions} pending
          </span>
        </div>
      )}
    </div>
  );
}