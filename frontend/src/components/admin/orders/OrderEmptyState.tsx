/**
 * Order Empty State Component
 * Hiển thị khi không có đơn hàng
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface OrderEmptyStateProps {
  hasFilters: boolean;
}

export default function OrderEmptyState({ hasFilters }: OrderEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Không có đơn hàng nào</p>
        <p className="text-muted-foreground">
          {hasFilters
            ? 'Thử điều chỉnh bộ lọc hoặc tìm kiếm'
            : 'Đơn hàng sẽ hiển thị ở đây khi có khách đặt hàng'}
        </p>
      </CardContent>
    </Card>
  );
}
