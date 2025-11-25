'use client';

import { gql, useQuery } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, CreditCard, Truck, User, Phone, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { toast } from 'sonner';

// ============================================================================
// GraphQL Query
// ============================================================================

const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($orderId: ID!) {
    getOrder(orderId: $orderId) {
      id
      orderNumber
      status
      paymentStatus
      paymentMethod
      shippingMethod
      subtotal
      shippingFee
      tax
      discount
      total
      customerNote
      internalNote
      createdAt
      confirmedAt
      shippedAt
      deliveredAt
      cancelledAt
      userId
      guestEmail
      guestName
      guestPhone
      shippingAddress
      billingAddress
      items {
        id
        productName
        variantName
        sku
        thumbnail
        quantity
        price
        subtotal
      }
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
    }
  }
`;

// ============================================================================
// Status Configs
// ============================================================================

const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
};

// ============================================================================
// Component
// ============================================================================

interface OrderDetailDialogProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (orderId: string, status: string) => void;
}

export function OrderDetailDialog({ order: orderProp, open, onOpenChange, onStatusUpdate }: OrderDetailDialogProps) {
  // If order object passed directly, use it; otherwise fetch by ID
  const shouldFetch = orderProp && typeof orderProp === 'string';
  
  const { data, loading } = useQuery(GET_ORDER_DETAIL, {
    variables: { orderId: orderProp },
    skip: !shouldFetch || !open,
    fetchPolicy: 'cache-and-network',
  });

  const order = shouldFetch ? data?.getOrder : orderProp;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 gap-0 flex flex-col max-h-[90vh] max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Đang tải đơn hàng</DialogTitle>
          </VisuallyHidden>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  // Parse addresses (they might be JSON strings)
  let shippingAddr: any = {};
  let billingAddr: any = {};
  
  try {
    shippingAddr = typeof order.shippingAddress === 'string' 
      ? JSON.parse(order.shippingAddress) 
      : order.shippingAddress || {};
  } catch (e) {
    shippingAddr = {};
  }

  try {
    billingAddr = typeof order.billingAddress === 'string'
      ? JSON.parse(order.billingAddress)
      : order.billingAddress || {};
  } catch (e) {
    billingAddr = {};
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 flex flex-col max-h-[90vh] max-w-4xl">
        {/* HEADER - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                Đơn hàng #{order.orderNumber}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Đặt hàng {formatDate(order.createdAt)}
              </DialogDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
              <Badge className={paymentConfig?.color}>{paymentConfig?.label}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-1 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Tên</p>
                      <p className="font-medium truncate">
                        {order.guestName || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-1 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm truncate">
                        {order.guestEmail || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {order.guestPhone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-1 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{order.guestPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {shippingAddr && Object.keys(shippingAddr).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{shippingAddr.fullName}</p>
                    <p>{shippingAddr.phone}</p>
                    <p className="text-gray-600">{shippingAddr.address}</p>
                    <p className="text-gray-600">
                      {[shippingAddr.ward, shippingAddr.district, shippingAddr.city]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Sản phẩm ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.productName}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                        )}
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                        <p className="font-semibold text-blue-600 text-sm">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Tổng kết đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuế:</span>
                      <span className="font-medium">{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <Badge variant="outline">{order.paymentMethod}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phương thức vận chuyển:</span>
                    <Badge variant="outline">{order.shippingMethod}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Info */}
            {order.tracking && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Theo dõi vận chuyển
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.tracking.carrier && (
                    <div>
                      <p className="text-xs text-gray-500">Đơn vị vận chuyển</p>
                      <p className="font-medium">{order.tracking.carrier}</p>
                    </div>
                  )}
                  {order.tracking.trackingNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Mã vận đơn</p>
                      <p className="font-mono font-medium">{order.tracking.trackingNumber}</p>
                    </div>
                  )}
                  {order.tracking.events && order.tracking.events.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-gray-500 font-semibold">Lịch sử vận chuyển</p>
                      <div className="space-y-2">
                        {order.tracking.events.map((event: any) => (
                          <div
                            key={event.id}
                            className="flex gap-3 p-2 border-l-2 border-blue-500 pl-3 text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{event.description}</p>
                              {event.location && (
                                <p className="text-xs text-gray-500">{event.location}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(event.eventTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {(order.customerNote || order.internalNote) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.customerNote && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Ghi chú từ khách hàng:</p>
                      <p className="text-sm mt-1">{order.customerNote}</p>
                    </div>
                  )}
                  {order.internalNote && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Ghi chú nội bộ:</p>
                      <p className="text-sm mt-1">{order.internalNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Lịch sử đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạo đơn:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.confirmedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xác nhận:</span>
                      <span>{formatDate(order.confirmedAt)}</span>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giao hàng:</span>
                      <span>{formatDate(order.shippedAt)}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã giao:</span>
                      <span>{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex justify-between text-red-600">
                      <span>Đã hủy:</span>
                      <span>{formatDate(order.cancelledAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* FOOTER - Fixed */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Đóng
            </Button>
            {onStatusUpdate && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
              <Button
                onClick={() => {
                  // Implement status update logic here
                  toast.info('Tính năng cập nhật trạng thái');
                }}
                className="flex-1 sm:flex-none"
              >
                Cập nhật trạng thái
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailDialog;
