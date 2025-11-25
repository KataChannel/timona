/**
 * Order Loading State Component
 * Hiển thị loading spinner khi đang tải dữ liệu
 */

'use client';

import React from 'react';

export default function OrderLoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      </div>
    </div>
  );
}
