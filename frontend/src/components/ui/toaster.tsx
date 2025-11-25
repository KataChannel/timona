'use client';

import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-4 sm:right-4 sm:flex-col sm:max-w-[420px] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all',
            'animate-in slide-in-from-top-full duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
            {
              'bg-white border-gray-200': toast.type === 'info',
              'bg-green-50 border-green-200': toast.type === 'success',
              'bg-red-50 border-red-200': toast.type === 'error',
              'bg-yellow-50 border-yellow-200': toast.type === 'warning',
            }
          )}
          style={{
            marginBottom: '0.5rem',
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {toast.type === 'info' && (
              <Info className="h-5 w-5 text-blue-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 grid gap-1">
            <div
              className={cn('text-sm font-semibold', {
                'text-gray-900': toast.type === 'info',
                'text-green-900': toast.type === 'success',
                'text-red-900': toast.type === 'error',
                'text-yellow-900': toast.type === 'warning',
              })}
            >
              {toast.title}
            </div>
            {toast.description && (
              <div
                className={cn('text-sm', {
                  'text-gray-600': toast.type === 'info',
                  'text-green-700': toast.type === 'success',
                  'text-red-700': toast.type === 'error',
                  'text-yellow-700': toast.type === 'warning',
                })}
              >
                {toast.description}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => dismiss(toast.id)}
            className={cn(
              'absolute right-2 top-2 rounded-md p-1 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 opacity-70',
              {
                'text-gray-500 hover:text-gray-700 focus:ring-gray-400':
                  toast.type === 'info',
                'text-green-700 hover:text-green-900 focus:ring-green-400':
                  toast.type === 'success',
                'text-red-700 hover:text-red-900 focus:ring-red-400':
                  toast.type === 'error',
                'text-yellow-700 hover:text-yellow-900 focus:ring-yellow-400':
                  toast.type === 'warning',
              }
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
