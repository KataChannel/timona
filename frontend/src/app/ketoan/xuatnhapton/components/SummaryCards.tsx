import React from 'react';
import { InventorySummary } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowDownCircle, ArrowUpCircle, Archive, ListOrdered, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  summary: InventorySummary;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-1" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {/* Total Records */}
      <Card className="border-l-4 border-l-slate-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Bản Ghi</CardTitle>
          <ListOrdered className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalRecords)}</div>
          <p className="text-xs text-muted-foreground">{formatNumber(summary.totalProducts)} sản phẩm</p>
        </CardContent>
      </Card>
      
      {/* Opening Inventory */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tồn Đầu Kỳ</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalOpeningQuantity)}</div>
          <p className="text-xs text-indigo-600">{formatCurrency(summary.totalOpeningAmount)}</p>
        </CardContent>
      </Card>
      
      {/* Import Summary */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Nhập</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalImportQuantity)}</div>
          <p className="text-xs text-green-600">{formatCurrency(summary.totalImportAmount)}</p>
        </CardContent>
      </Card>
      
      {/* Export Summary */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Xuất</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalExportQuantity)}</div>
          <p className="text-xs text-orange-600" title="Giá vốn">
            Vốn: {formatCurrency(summary.totalExportAmount)}
          </p>
          <p className="text-xs text-orange-800 font-medium" title="Doanh thu bán">
            Bán: {formatCurrency(summary.totalExportSaleAmount)}
          </p>
        </CardContent>
      </Card>
      
      {/* Closing Inventory */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tồn Cuối Kỳ</CardTitle>
          <Archive className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalClosingQuantity)}</div>
          <p className="text-xs text-purple-600">{formatCurrency(summary.totalClosingAmount)}</p>
        </CardContent>
      </Card>
      
      {/* Total Products */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sản Phẩm</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(summary.totalProducts)}</div>
          <p className="text-xs text-muted-foreground">Unique SKU</p>
        </CardContent>
      </Card>
    </div>
  );
};
