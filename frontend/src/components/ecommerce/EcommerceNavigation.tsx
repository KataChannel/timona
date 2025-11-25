'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Package, MapPin, User, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';

const accountMenuItems = [
  {
    icon: User,
    label: 'Thông tin tài khoản',
    href: '/tai-khoan',
    description: 'Quản lý thông tin cá nhân',
  },
  {
    icon: Package,
    label: 'Đơn hàng của tôi',
    href: '/don-hang',
    description: 'Theo dõi đơn hàng',
  },
  {
    icon: MapPin,
    label: 'Địa chỉ giao hàng',
    href: '/dia-chi',
    description: 'Quản lý địa chỉ',
  },
  {
    icon: CreditCard,
    label: 'Phương thức thanh toán',
    href: '/phuong-thuc-thanh-toan',
    description: 'Quản lý thanh toán',
  },
];

export function EcommerceNavigation() {
  const pathname = usePathname();

  return (
    <Card className="overflow-hidden">
      <nav className="bg-white">
        {/* Desktop: Vertical Menu */}
        <div className="hidden lg:block">
          <div className="divide-y">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-green-600 bg-green-50 border-l-4 border-green-600'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 border-l-4 border-transparent'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile: Horizontal Scrollable Tabs */}
        <div className="lg:hidden border-b">
          <div className="flex overflow-x-auto scrollbar-hide">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 min-w-[80px] px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </Card>
  );
}
