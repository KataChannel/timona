'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { LIST_ORDERS, GET_ORDER_STATS, UPDATE_ORDER_STATUS } from '@/components/admin/orders/queries';
import { OrderFilterInput } from '@/components/admin/orders/types';
import OrderStatsCards from '@/components/admin/orders/OrderStatsCards';
import OrderSearchFiltersBar from '@/components/admin/orders/OrderSearchFiltersBar';
import OrderMobileCards from '@/components/admin/orders/OrderMobileCards';
import OrderDesktopTable from '@/components/admin/orders/OrderDesktopTable';
import OrderLoadingState from '@/components/admin/orders/OrderLoadingState';
import OrderEmptyState from '@/components/admin/orders/OrderEmptyState';
import OrderDetailDialog from '@/components/admin/orders/OrderDetailDialog';
import { OrderFilterDialog } from '@/components/admin/orders/OrderFilterDialog';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilterInput>({});

  const { data: statsData, loading: statsLoading } = useQuery(GET_ORDER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data, loading, error, refetch } = useQuery(LIST_ORDERS, {
    variables: {
      filter: { ...filters, searchTerm: searchTerm || undefined },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      toast.success('Cập nhật trạng thái thành công');
      refetch();
    },
    onError: (error) => toast.error(`Lỗi: ${error.message}`),
  });

  const orders = data?.listOrders?.orders || [];
  const stats = statsData?.getOrderStatistics || null;
  const hasFilters = searchTerm.length > 0 || Object.keys(filters).length > 0;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ variables: { input: { orderId, status: newStatus } } });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters as OrderFilterInput);
    setFilterDialogOpen(false);
    refetch();
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Tất cả đơn hàng từ khách hàng website</p>
      </div>

      <OrderStatsCards stats={stats} loading={statsLoading} />

      <OrderSearchFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => setFilterDialogOpen(true)}
        onExportClick={() => toast.info('Tính năng xuất Excel đang phát triển')}
      />

      {loading && <OrderLoadingState />}

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-medium">Lỗi: {error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <OrderEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <OrderMobileCards orders={orders} onViewDetail={setSelectedOrderId} onStatusChange={handleStatusChange} />
              <OrderDesktopTable orders={orders} onViewDetail={setSelectedOrderId} onStatusChange={handleStatusChange} />
            </>
          )}
        </>
      )}

      {selectedOrderId && (
        <OrderDetailDialog
          order={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
        />
      )}

      <OrderFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
