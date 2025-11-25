'use client';

import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItemPreviewProps {
  productName: string;
  variantName?: string;
  sku?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  size?: 'sm' | 'md' | 'lg';
  showPrice?: boolean;
  className?: string;
}

/**
 * OrderItemPreview Component
 * 
 * Reusable product preview for orders (list and detail views)
 * Mobile-First responsive design with image, name, variant, quantity
 * Supports different sizes and optional price display
 * 
 * @param productName - Product name
 * @param variantName - Product variant name (optional)
 * @param sku - Product SKU (optional)
 * @param thumbnail - Product image URL (optional)
 * @param quantity - Item quantity
 * @param price - Unit price
 * @param subtotal - Item subtotal (optional)
 * @param size - Component size variant
 * @param showPrice - Whether to show price information
 * @param className - Additional CSS classes
 */
export function OrderItemPreview({
  productName,
  variantName,
  sku,
  thumbnail,
  quantity,
  price,
  subtotal,
  size = 'md',
  showPrice = true,
  className,
}: OrderItemPreviewProps) {
  const sizeClasses = {
    sm: {
      image: 'w-12 h-12',
      icon: 'w-6 h-6',
      name: 'text-xs',
      variant: 'text-xs',
      quantity: 'text-xs',
    },
    md: {
      image: 'w-16 h-16 sm:w-20 sm:h-20',
      icon: 'w-8 h-8 sm:w-10 sm:h-10',
      name: 'text-sm sm:text-base',
      variant: 'text-xs',
      quantity: 'text-xs sm:text-sm',
    },
    lg: {
      image: 'w-20 h-20 sm:w-24 sm:h-24',
      icon: 'w-10 h-10 sm:w-12 sm:h-12',
      name: 'text-base sm:text-lg',
      variant: 'text-sm',
      quantity: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex gap-3', className)}>
      {/* Product Image - Mobile First */}
      <div
        className={cn(
          'relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden',
          sizes.image
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package
            className={cn(
              'text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              sizes.icon
            )}
          />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'font-medium text-gray-900 line-clamp-2 mb-0.5',
            sizes.name
          )}
        >
          {productName}
        </h4>

        {variantName && (
          <p className={cn('text-gray-500 mb-0.5', sizes.variant)}>
            {variantName}
          </p>
        )}

        {sku && (
          <p className={cn('text-gray-400 mb-1', sizes.variant)}>
            SKU: {sku}
          </p>
        )}

        {/* Price & Quantity */}
        {showPrice && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('text-gray-900 font-medium', sizes.quantity)}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(price)}
            </span>
            <span className="text-gray-400">×</span>
            <span className={cn('text-gray-600', sizes.quantity)}>
              {quantity}
            </span>
            {subtotal && (
              <>
                <span className="text-gray-400">=</span>
                <span
                  className={cn('text-primary font-semibold', sizes.quantity)}
                >
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(subtotal)}
                </span>
              </>
            )}
          </div>
        )}

        {!showPrice && (
          <p className={cn('text-gray-600 mt-1', sizes.quantity)}>
            Số lượng: {quantity}
          </p>
        )}
      </div>
    </div>
  );
}
