'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export type TrackingEventType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PROCESSING_STARTED'
  | 'PACKAGING_STARTED'
  | 'READY_TO_SHIP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderTrackingEvent {
  id: string;
  type: TrackingEventType;
  status: string;
  description?: string;
  location?: string;
  timestamp: string | Date;
}

interface OrderTimelineProps {
  events: OrderTrackingEvent[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const eventLabels: Record<TrackingEventType, string> = {
  ORDER_CREATED: 'Đơn hàng đã tạo',
  ORDER_CONFIRMED: 'Đã xác nhận',
  PAYMENT_RECEIVED: 'Đã thanh toán',
  PROCESSING_STARTED: 'Bắt đầu xử lý',
  PACKAGING_STARTED: 'Đang đóng gói',
  READY_TO_SHIP: 'Sẵn sàng giao',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export function OrderTimeline({ 
  events, 
  orientation = 'vertical',
  className 
}: OrderTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (orientation === 'horizontal') {
    return (
      <div className={cn('w-full overflow-x-auto', className)}>
        <div className="flex items-start gap-4 min-w-max pb-4">
          {sortedEvents.map((event, index) => {
            const isLast = index === sortedEvents.length - 1;
            const isCancelled = event.type === 'CANCELLED';
            
            return (
              <div key={event.id} className="flex items-start gap-2">
                <div className="flex flex-col items-center min-w-[120px]">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white',
                      isCancelled
                        ? 'border-red-500 text-red-500'
                        : index === 0
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    )}
                  >
                    {index === 0 && !isCancelled ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Circle className="w-3 h-3 fill-current" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isCancelled
                          ? 'text-red-600'
                          : index === 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      )}
                    >
                      {eventLabels[event.type] || event.status}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(event.timestamp), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.timestamp), 'HH:mm', { locale: vi })}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'h-0.5 w-12 mt-5',
                      index === 0 ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical orientation (default, mobile-first)
  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-0">
        {sortedEvents.map((event, index) => {
          const isLast = index === sortedEvents.length - 1;
          const isCancelled = event.type === 'CANCELLED';

          return (
            <div key={event.id} className="flex gap-4">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white flex-shrink-0',
                    isCancelled
                      ? 'border-red-500 text-red-500'
                      : index === 0
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  )}
                >
                  {index === 0 && !isCancelled ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Circle className="w-3 h-3 fill-current" />
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[60px]',
                      index === 0 ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              {/* Content column */}
              <div className="flex-1 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'text-sm font-medium',
                        isCancelled
                          ? 'text-red-600'
                          : index === 0
                          ? 'text-green-600'
                          : 'text-gray-900'
                      )}
                    >
                      {eventLabels[event.type] || event.status}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end text-xs text-gray-500 flex-shrink-0">
                    <time>
                      {format(new Date(event.timestamp), 'dd/MM/yyyy', { locale: vi })}
                    </time>
                    <time className="mt-0.5">
                      {format(new Date(event.timestamp), 'HH:mm', { locale: vi })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
