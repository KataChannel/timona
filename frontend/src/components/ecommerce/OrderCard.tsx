'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Package, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/ecommerce/OrderStatusBadge';
import { PaymentMethodBadge } from '@/components/ecommerce/PaymentMethodBadge';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { OrderItemPreview } from '@/components/ecommerce/OrderItemPreview';
import { type OrderListItem } from '@/types/order.types';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: OrderListItem;
  maxItemsPreview?: number;
  className?: string;
}

/**
 * OrderCard Component
 * 
 * Display individual order in list view
 * Mobile-First responsive card with order summary
 * Shows order number, status, items preview, payment, total
 * 
 * @param order - Order data
 * @param maxItemsPreview - Maximum items to show in preview (default: 2)
 * @param className - Additional CSS classes
 */
export function OrderCard({
  order,
  maxItemsPreview = 2,
  className,
}: OrderCardProps) {
  const previewItems = order.items.slice(0, maxItemsPreview);
  const remainingCount = order.items.length - maxItemsPreview;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4 sm:p-5">
        {/* Card Header - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <Link
              href={`/don-hang/${order.orderNumber}`}
              className="text-sm sm:text-base font-semibold text-primary hover:underline"
            >
              #{order.orderNumber}
            </Link>
            <span className="text-xs sm:text-sm text-gray-500">
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>

        {/* Items Preview - Mobile Optimized */}
        <div className="space-y-3 mb-4">
          {previewItems.map((item) => (
            <OrderItemPreview
              key={item.id}
              productName={item.productName}
              variantName={item.variantName}
              sku={item.sku}
              thumbnail={item.thumbnail}
              quantity={item.quantity}
              price={item.price}
              size="sm"
              showPrice={false}
            />
          ))}

          {remainingCount > 0 && (
            <div className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              <span>và {remainingCount} sản phẩm khác</span>
            </div>
          )}
        </div>

        {/* Payment & Total - Mobile Stacked */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              Thanh toán:
            </span>
            <PaymentMethodBadge method={order.paymentMethod} size="sm" />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Tổng:
              </span>
              <PriceDisplay
                price={order.total}
                size="lg"
                className="font-bold text-primary"
              />
            </div>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <Link href={`/don-hang/${order.orderNumber}`}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Xem chi tiết</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
