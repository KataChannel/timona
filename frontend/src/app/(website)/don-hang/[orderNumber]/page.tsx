'use client';

import { Suspense } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Package, Truck, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/ecommerce/OrderStatusBadge';
import { PaymentMethodBadge } from '@/components/ecommerce/PaymentMethodBadge';
import { OrderTimeline } from '@/components/ecommerce/OrderTimeline';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderSummaryCard } from '@/components/ecommerce/OrderSummaryCard';
import { OrderItemPreview } from '@/components/ecommerce/OrderItemPreview';
import { ShippingAddressCard } from '@/components/ecommerce/ShippingAddressCard';
import { type OrderDetail, type ShippingMethod } from '@/types/order.types';
import { GET_ORDER_DETAIL } from '@/graphql/ecommerce.queries';

/**
 * OrderDetailContent Component
 * 
 * Refactored order detail page following Clean Architecture principles
 * Mobile-First responsive design with extracted components
 * Clean separation of concerns and reusable components
 */
function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const { data, loading, error } = useQuery<{ getOrderByNumber: OrderDetail }>(
    GET_ORDER_DETAIL,
    {
      variables: { orderNumber },
      skip: !orderNumber,
    }
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data?.getOrderByNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-8 pb-8 px-4 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-red-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Đơn hàng #{orderNumber} không tồn tại hoặc đã bị xóa.
            </p>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/don-hang">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = data.getOrderByNumber;

  // Shipping method label mapping
  const getShippingMethodLabel = (method: ShippingMethod): string => {
    const labels: Record<ShippingMethod, string> = {
      STANDARD: 'Giao hàng tiêu chuẩn',
      EXPRESS: 'Giao hàng nhanh',
      SAME_DAY: 'Giao trong ngày',
    };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        {/* Header - Mobile First */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/don-hang')}
            className="-ml-2 mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm">Quay lại</span>
          </Button>

          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
                  #{order.orderNumber}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
              <div className="flex-shrink-0">
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Single Column Layout */}
        <div className="space-y-3 sm:space-y-4">
          {/* Order Summary Card - Using extracted component */}
          <OrderSummaryCard
            subtotal={order.subtotal}
            shippingFee={order.shippingFee}
            tax={order.tax}
            discount={order.discount}
            total={order.total}
          />

          {/* Tracking Timeline - Mobile Optimized */}
          {order.tracking?.events && order.tracking.events.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                  Theo dõi đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <OrderTimeline events={order.tracking.events} />
              </CardContent>
            </Card>
          )}

          {/* Order Items - Using extracted component */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Sản phẩm
                <span className="text-sm font-normal text-gray-500">
                  ({order.items.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <OrderItemPreview
                      productName={item.productName}
                      variantName={item.variantName}
                      sku={item.sku}
                      thumbnail={item.thumbnail}
                      quantity={item.quantity}
                      price={item.price}
                      subtotal={item.subtotal}
                      size="md"
                      showPrice={true}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Shipping Info - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Payment Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Phương thức</p>
                  <PaymentMethodBadge method={order.paymentMethod} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Trạng thái</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs sm:text-sm font-medium ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.paymentStatus === 'PAID'
                      ? 'Đã thanh toán'
                      : 'Chưa thanh toán'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500 mb-1.5">Phương thức</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium">
                  {getShippingMethodLabel(order.shippingMethod)}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Address - Using extracted component */}
          <ShippingAddressCard address={order.shippingAddress} />

          {/* Customer Note */}
          {order.customerNote && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ghi chú
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {order.customerNote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions - Mobile First */}
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full" variant="outline" size="sm">
              <Link href={`/theo-doi-don-hang?order=${order.orderNumber}`}>
                <Truck className="h-4 w-4 mr-2" />
                Theo dõi vận chuyển
              </Link>
            </Button>
            {order.status === 'PENDING' && (
              <Button variant="destructive" className="w-full" size="sm">
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * OrderDetailPage Component
 * 
 * Main order detail page with Suspense wrapper
 * Follows Mobile-First responsive design principles
 */
export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-40 mb-6" />
            <div className="space-y-3 sm:space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
