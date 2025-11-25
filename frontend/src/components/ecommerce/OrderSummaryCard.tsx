'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { cn } from '@/lib/utils';

interface OrderSummaryCardProps {
  subtotal: number;
  shippingFee: number;
  tax?: number;
  discount?: number;
  total: number;
  className?: string;
}

/**
 * OrderSummaryCard Component
 * 
 * Display order financial summary
 * Mobile-First responsive card with subtotal, fees, discounts, and total
 * Reusable for order detail and checkout pages
 * 
 * @param subtotal - Order subtotal before fees
 * @param shippingFee - Shipping fee amount
 * @param tax - Tax amount (optional)
 * @param discount - Discount amount (optional)
 * @param total - Final total amount
 * @param className - Additional CSS classes
 */
export function OrderSummaryCard({
  subtotal,
  shippingFee,
  tax = 0,
  discount = 0,
  total,
  className,
}: OrderSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Tổng đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Tạm tính</span>
          <PriceDisplay price={subtotal} size="sm" />
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Phí vận chuyển</span>
          <PriceDisplay price={shippingFee} size="sm" />
        </div>

        {/* Tax (if applicable) */}
        {tax > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Thuế VAT</span>
            <PriceDisplay price={tax} size="sm" />
          </div>
        )}

        {/* Discount (if applicable) */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Giảm giá</span>
            <span className="text-red-600 font-medium">
              -<PriceDisplay price={discount} size="sm" />
            </span>
          </div>
        )}

        {/* Separator */}
        <Separator className="my-2" />

        {/* Total - Emphasized */}
        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold text-base sm:text-lg">Tổng cộng</span>
          <PriceDisplay
            price={total}
            size="lg"
            className="font-bold text-primary text-lg sm:text-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}
