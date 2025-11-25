'use client';

import { Suspense, useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderTimeline, type OrderTrackingEvent } from '@/components/ecommerce/OrderTimeline';
import { OrderStatusBadge, type OrderStatus } from '@/components/ecommerce/OrderStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const TRACK_ORDER = gql`
  query TrackOrder($orderNumber: String!) {
    getOrderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      createdAt
      confirmedAt
      shippedAt
      deliveredAt
      tracking {
        id
        status
        carrier
        trackingNumber
        trackingUrl
        estimatedDelivery
        actualDelivery
        events {
          id
          status
          description
          location
          eventTime
        }
      }
      items {
        id
        productName
        thumbnail
        quantity
        price
      }
      shippingAddress
    }
  }
`;

interface TrackingInfo {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  tracking?: {
    id: string;
    status: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    events: OrderTrackingEvent[];
  };
  items: Array<{
    id: string;
    productName: string;
    thumbnail?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: any;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order');
  
  const [orderNumber, setOrderNumber] = useState(orderParam || '');
  const [searchValue, setSearchValue] = useState(orderParam || '');

  const { data, loading, error } = useQuery<{ getOrderByNumber: TrackingInfo }>(
    TRACK_ORDER,
    {
      variables: { orderNumber },
      skip: !orderNumber,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNumber(searchValue);
  };

  const orderInfo = data?.getOrderByNumber;
  const trackingInfo = orderInfo?.tracking;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Page Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Truck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Theo dõi đơn hàng
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Nhập mã đơn hàng để kiểm tra tình trạng vận chuyển
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Mã đơn hàng</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="VD: ORD-20240101-ABC123"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Tra cứu
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Bạn có thể tìm mã đơn hàng trong email xác nhận hoặc trang{' '}
                <Link href="/don-hang" className="text-primary hover:underline">
                  Đơn hàng của tôi
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && orderNumber && (
        <Card className="border-red-200">
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-gray-600">
              Không tìm thấy thông tin vận chuyển cho mã đơn hàng{' '}
              <strong>{orderNumber}</strong>. Vui lòng kiểm tra lại mã đơn hàng.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tracking Results */}
      {orderInfo && !loading && (
        <div className="space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg">
                  Đơn hàng #{orderInfo.orderNumber}
                </CardTitle>
                <OrderStatusBadge status={orderInfo.status as OrderStatus} size="lg" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {trackingInfo?.events && trackingInfo.events.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vị trí hiện tại</p>
                    <p className="text-sm font-medium text-gray-900">
                      📍 {trackingInfo.events[0]?.location || 'Đang cập nhật'}
                    </p>
                  </div>
                )}
                {trackingInfo?.estimatedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Dự kiến giao hàng
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      🕐 {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping Provider Info */}
              {trackingInfo && (trackingInfo.carrier || trackingInfo.trackingNumber) && (
                <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                  {trackingInfo.carrier && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        Đơn vị vận chuyển
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {trackingInfo.carrier}
                      </p>
                    </div>
                  )}
                  {trackingInfo.trackingNumber && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Mã vận đơn</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">
                        {trackingInfo.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          {trackingInfo?.events && trackingInfo.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch sử vận chuyển</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop: Horizontal Timeline */}
                <div className="hidden lg:block">
                  <OrderTimeline
                    events={trackingInfo.events}
                    orientation="horizontal"
                  />
                </div>
                {/* Mobile: Vertical Timeline */}
                <div className="lg:hidden">
                  <OrderTimeline
                    events={trackingInfo.events}
                    orientation="vertical"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/don-hang/${orderInfo.orderNumber}`}>
                    <Package className="h-4 w-4 mr-2" />
                    Xem chi tiết đơn hàng
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSearchValue('');
                    setOrderNumber('');
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tra cứu đơn khác
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!orderNumber && !loading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sẵn sàng theo dõi đơn hàng
            </h3>
            <p className="text-gray-600">
              Nhập mã đơn hàng ở trên để bắt đầu tra cứu
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mx-auto mb-6" />
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
