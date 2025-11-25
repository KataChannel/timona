'use client';

import { Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EcommerceNavigation } from '@/components/ecommerce/EcommerceNavigation';
import { OrderFilters } from '@/components/ecommerce/OrderFilters';
import { OrderCard } from '@/components/ecommerce/OrderCard';
import { OrderEmptyState } from '@/components/ecommerce/OrderEmptyState';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { type OrderListItem } from '@/types/order.types';
import { GET_USER_ORDERS } from '@/graphql/ecommerce.queries';
import { mockOrders, USE_MOCK_DATA } from '@/lib/mockOrderData';

/**
 * OrderListContent Component
 * 
 * Refactored order list page following Clean Architecture principles
 * Mobile-First responsive design with extracted components
 * Clean separation of concerns: UI, logic, and data fetching
 */
function OrderListContent() {
  // GraphQL query for orders
  const { data, loading, error } = useQuery(GET_USER_ORDERS, {
    variables: {
      skip: 0,
      take: 50,
    },
    fetchPolicy: 'cache-and-network',
    skip: USE_MOCK_DATA, // Skip query if using mock data
  });

  // Debug logging
  console.log('Orders Query Result:', { data, loading, error, USE_MOCK_DATA });

  // Transform API data to OrderListItem format or use mock data
  const orders: OrderListItem[] = USE_MOCK_DATA 
    ? mockOrders 
    : (data?.getMyOrders?.orders || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total || 0,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        items: (order.items || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || '',
          variantName: item.variantName,
          sku: item.sku,
          thumbnail: item.thumbnail,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal || (item.price * item.quantity),
        })),
      }));

  const total = USE_MOCK_DATA ? mockOrders.length : (data?.getMyOrders?.total || 0);

  // Custom hook for filtering logic
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    openStatusCombobox,
    setOpenStatusCombobox,
    filteredOrders,
  } = useOrderFilters({ orders });

  // Loading state (skip if using mock data)
  if (!USE_MOCK_DATA && loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-32 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state (skip if using mock data)
  if (!USE_MOCK_DATA && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <p className="text-sm text-red-600 mb-4">
            Có lỗi xảy ra khi tải danh sách đơn hàng. Vui lòng thử lại sau.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Error: {error.message}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            size="sm" 
            className="w-full"
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Đơn hàng của tôi
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Quản lý và theo dõi đơn hàng của bạn ({total} đơn)
              </p>
            </div>
            {USE_MOCK_DATA && (
              <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden mb-4">
          <EcommerceNavigation />
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <EcommerceNavigation />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Filters */}
            <OrderFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              openStatusCombobox={openStatusCombobox}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onComboboxOpenChange={setOpenStatusCombobox}
              className="mb-4 sm:mb-6"
            />

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <>
                <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  Hiển thị {filteredOrders.length} đơn hàng
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} maxItemsPreview={2} />
                  ))}
                </div>
              </>
            ) : (
              <OrderEmptyState
                title={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'Không tìm thấy đơn hàng'
                    : 'Chưa có đơn hàng nào'
                }
                description={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'Không có đơn hàng nào phù hợp với bộ lọc của bạn. Hãy thử tìm kiếm hoặc chọn bộ lọc khác.'
                    : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm để trải nghiệm dịch vụ của chúng tôi!'
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * OrderListPage Component
 * 
 * Main order list page with Suspense wrapper
 * Follows Mobile-First responsive design principles
 */
export default function OrderListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-32 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <OrderListContent />
    </Suspense>
  );
}
