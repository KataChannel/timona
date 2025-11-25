import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  PackageCheck, 
  Truck, 
  PackageOpen,
  CircleCheck,
  XCircle,
  RotateCcw,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type OrderStatus } from '@/types/order.types';

// Re-export OrderStatus for convenience
export type { OrderStatus };

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon: any;
}> = {
  PENDING: {
    label: 'Chờ xác nhận',
    variant: 'outline',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    variant: 'outline',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Package,
  },
  PACKAGING: {
    label: 'Đang đóng gói',
    variant: 'outline',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: PackageOpen,
  },
  READY_TO_SHIP: {
    label: 'Sẵn sàng giao',
    variant: 'outline',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: PackageCheck,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CircleCheck,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CircleCheck,
  },
  CANCELLED: {
    label: 'Đã hủy',
    variant: 'destructive',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  RETURNED: {
    label: 'Đã hoàn trả',
    variant: 'outline',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: RotateCcw,
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    variant: 'secondary',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: DollarSign,
  },
};

export function OrderStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className 
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
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
