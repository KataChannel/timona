'use client';

import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrderEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * OrderEmptyState Component
 * 
 * Display empty state when no orders found
 * Mobile-First responsive design with icon, message, and CTA
 * Customizable text and action button
 * 
 * @param title - Empty state title (default: "Chưa có đơn hàng nào")
 * @param description - Empty state description
 * @param actionLabel - CTA button label (default: "Mua sắm ngay")
 * @param actionHref - CTA button link (default: "/san-pham")
 * @param className - Additional CSS classes
 */
export function OrderEmptyState({
  title = 'Chưa có đơn hàng nào',
  description = 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm để trải nghiệm dịch vụ của chúng tôi!',
  actionLabel = 'Mua sắm ngay',
  actionHref = '/san-pham',
  className,
}: OrderEmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        {/* Icon - Mobile First */}
        <div className="relative mb-4 sm:mb-6">
          <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
          <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 absolute -bottom-1 -right-1" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md">
          {description}
        </p>

        {/* CTA Button - Full width on mobile */}
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={actionHref}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {actionLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
