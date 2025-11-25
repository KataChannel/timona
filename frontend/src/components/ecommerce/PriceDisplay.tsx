import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCurrency?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  originalPrice,
  size = 'md',
  showCurrency = true,
  className,
}: PriceDisplayProps) {
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: {
      price: 'text-sm',
      original: 'text-xs',
      currency: 'text-xs',
      badge: 'text-[10px] px-1 py-0.5',
    },
    md: {
      price: 'text-base',
      original: 'text-sm',
      currency: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5',
    },
    lg: {
      price: 'text-lg',
      original: 'text-base',
      currency: 'text-base',
      badge: 'text-xs px-2 py-1',
    },
    xl: {
      price: 'text-2xl',
      original: 'text-lg',
      currency: 'text-lg',
      badge: 'text-sm px-2 py-1',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Current Price */}
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-bold',
            hasDiscount ? 'text-red-600' : 'text-gray-900',
            classes.price
          )}
        >
          {formatPrice(price)}
        </span>
        {showCurrency && (
          <span
            className={cn(
              'font-medium',
              hasDiscount ? 'text-red-600' : 'text-gray-600',
              classes.currency
            )}
          >
            ₫
          </span>
        )}
      </div>

      {/* Original Price & Discount Badge */}
      {hasDiscount && (
        <>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-gray-500 line-through font-normal',
                classes.original
              )}
            >
              {formatPrice(originalPrice)}
            </span>
            {showCurrency && (
              <span className={cn('text-gray-500', classes.currency)}>₫</span>
            )}
          </div>
          <span
            className={cn(
              'bg-red-100 text-red-700 font-semibold rounded',
              classes.badge
            )}
          >
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
