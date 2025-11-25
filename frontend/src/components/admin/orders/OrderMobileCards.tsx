/**
 * Order Mobile Cards Component
 * Hiển thị danh sách đơn hàng dạng cards cho mobile
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Printer, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { OrderStatusCombobox } from './OrderStatusCombobox';
import { formatCurrency, getPaymentStatusConfig } from './helpers';
import { Order } from './types';

interface OrderMobileCardsProps {
  orders: Order[];
  onViewDetail: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPrint?: (orderId: string) => void;
  onEmail?: (orderId: string) => void;
}

export default function OrderMobileCards({
  orders,
  onViewDetail,
  onStatusChange,
  onPrint,
  onEmail,
}: OrderMobileCardsProps) {
  return (
    <div className="lg:hidden space-y-4">
      {orders.map((order) => {
        const paymentConfig = getPaymentStatusConfig(order.paymentStatus);

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header: Order Number & Actions */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-base">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.guestEmail || order.guestName || 'Khách vãng lai'}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(order.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {onPrint && (
                      <DropdownMenuItem onClick={() => onPrint(order.id)}>
                        <Printer className="mr-2 h-4 w-4" />
                        In đơn hàng
                      </DropdownMenuItem>
                    )}
                    {onEmail && (
                      <DropdownMenuItem onClick={() => onEmail(order.id)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Gửi email
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Order Details */}
              <div className="space-y-2 mb-3">
                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trạng thái:</span>
                  <OrderStatusCombobox
                    value={order.status}
                    onChange={(newStatus: string) => onStatusChange(order.id, newStatus)}
                  />
                </div>

                {/* Payment Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Thanh toán:</span>
                  <Badge variant="secondary" className={paymentConfig.className}>
                    {paymentConfig.label}
                  </Badge>
                </div>

                {/* Items Count */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Số lượng:</span>
                  <span className="font-medium">{order.items?.length || 0} sản phẩm</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                  <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                </div>

                {/* Created At */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Thời gian:</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
