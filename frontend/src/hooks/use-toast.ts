import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface ToastState {
  toasts: Toast[];
}

let globalToastState: ToastState = {
  toasts: []
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

let toastCount = 0;

export function useToast() {
  const [state, setState] = useState(globalToastState);

  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      ...options,
      duration: options.duration ?? 5000
    };

    globalToastState = {
      ...globalToastState,
      toasts: [...globalToastState.toasts, newToast]
    };

    emitChange();

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        globalToastState = {
          ...globalToastState,
          toasts: globalToastState.toasts.filter(t => t.id !== id)
        };
        emitChange();
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((toastId: string) => {
    globalToastState = {
      ...globalToastState,
      toasts: globalToastState.toasts.filter(t => t.id !== toastId)
    };
    emitChange();
  }, []);

  const dismissAll = useCallback(() => {
    globalToastState = {
      ...globalToastState,
      toasts: []
    };
    emitChange();
  }, []);

  // Subscribe to global state changes
  React.useEffect(() => {
    const unsubscribe = subscribe(() => {
      setState(globalToastState);
    });
    return unsubscribe;
  }, [subscribe]);

  return {
    ...state,
    toast,
    dismiss,
    dismissAll
  };
}

// Global toast function for convenience
export const toast = (options: Omit<Toast, 'id'>) => {
  const id = (++toastCount).toString();
  const newToast: Toast = {
    id,
    ...options,
    duration: options.duration ?? 5000
  };

  globalToastState = {
    ...globalToastState,
    toasts: [...globalToastState.toasts, newToast]
  };

  emitChange();

  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      globalToastState = {
        ...globalToastState,
        toasts: globalToastState.toasts.filter(t => t.id !== id)
      };
      emitChange();
    }, newToast.duration);
  }

  return id;
};

// Export React for the useEffect
import React from 'react';