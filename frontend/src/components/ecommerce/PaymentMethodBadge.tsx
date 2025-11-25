import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  CreditCard, 
  Building2,
  Wallet,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PaymentMethod } from '@/types/order.types';

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const methodConfig: Record<PaymentMethod, {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  className: string;
  icon: any;
}> = {
  CASH_ON_DELIVERY: {
    label: 'Thanh toán khi nhận hàng',
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: Banknote,
  },
  BANK_TRANSFER: {
    label: 'Chuyển khoản ngân hàng',
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Building2,
  },
  CREDIT_CARD: {
    label: 'Thẻ tín dụng/ghi nợ',
    variant: 'outline',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CreditCard,
  },
  MOMO: {
    label: 'Ví MoMo',
    variant: 'outline',
    className: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: Wallet,
  },
  ZALOPAY: {
    label: 'Ví ZaloPay',
    variant: 'outline',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Smartphone,
  },
  VNPAY: {
    label: 'Ví VNPay',
    variant: 'outline',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: CreditCard,
  },
};

export function PaymentMethodBadge({ 
  method, 
  size = 'md', 
  showIcon = true,
  className 
}: PaymentMethodBadgeProps) {
  const config = methodConfig[method];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium',
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        {showIcon && <Icon className={iconSizes[size]} />}
        <span>{config.label}</span>
      </span>
    </Badge>
  );
}
