/**
 * Order Statistics Cards Component
 * Hiển thị thống kê đơn hàng (tổng, doanh thu, chờ xử lý, hoàn thành)
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from './helpers';
import { OrderStatistics } from './types';

interface OrderStatsCardsProps {
  stats: OrderStatistics | null;
  loading?: boolean;
}

export default function OrderStatsCards({ stats, loading }: OrderStatsCardsProps) {
  const displayValue = (value: number | undefined, formatter?: (v: number) => string) => {
    if (loading) return '...';
    if (value === undefined || value === null) return '0';
    return formatter ? formatter(value) : value.toString();
  };

  // Parse byStatus JSON to get individual counts
  const byStatus = stats?.byStatus || {};
  const pendingCount = byStatus?.PENDING || 0;
  const completedCount = byStatus?.COMPLETED || byStatus?.DELIVERED || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tổng đơn hàng */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayValue(stats?.totalOrders)}
          </div>
          <p className="text-xs text-muted-foreground">Tất cả đơn hàng</p>
        </CardContent>
      </Card>

      {/* Tổng doanh thu */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayValue(stats?.totalRevenue, formatCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">Tổng giá trị</p>
        </CardContent>
      </Card>

      {/* Chờ xử lý */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayValue(pendingCount)}
          </div>
          <p className="text-xs text-muted-foreground">Đơn hàng mới</p>
        </CardContent>
      </Card>

      {/* Hoàn thành */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {displayValue(completedCount)}
          </div>
          <p className="text-xs text-muted-foreground">Giao hàng thành công</p>
        </CardContent>
      </Card>
    </div>
  );
}
