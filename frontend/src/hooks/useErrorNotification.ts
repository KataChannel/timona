'use client';

import { useCallback } from 'react';

export interface ErrorNotification {
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: string;
  timestamp?: Date;
}

// Store for error notifications (can be replaced with toast/notification library)
let errorListeners: ((error: ErrorNotification) => void)[] = [];

export const useErrorNotification = () => {
  const notify = useCallback((error: ErrorNotification) => {
    const notification: ErrorNotification = {
      ...error,
      timestamp: new Date(),
    };
    
    console.error('[API Error]', {
      message: error.message,
      type: error.type,
      details: error.details,
      timestamp: notification.timestamp,
    });

    // Trigger listeners
    errorListeners.forEach(listener => listener(notification));
  }, []);

  const subscribe = useCallback((listener: (error: ErrorNotification) => void) => {
    errorListeners.push(listener);
    return () => {
      errorListeners = errorListeners.filter(l => l !== listener);
    };
  }, []);

  return { notify, subscribe };
};

export const parseGraphQLError = (error: any): ErrorNotification => {
  let message = 'Có lỗi xảy ra';
  let details = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
    details = error.stack || '';
  } else if (error?.graphQLErrors?.length > 0) {
    const gqlError = error.graphQLErrors[0];
    message = gqlError.message || 'GraphQL Error';
    details = JSON.stringify({
      path: gqlError.path,
      extensions: gqlError.extensions,
    }, null, 2);
  } else if (error?.networkError) {
    message = 'Lỗi kết nối mạng';
    details = error.networkError.message || 'Không thể kết nối đến server';
  }

  return {
    message,
    details,
    type: 'error',
  };
};
