/**
 * Order Desktop Table Component
 * Hiển thị danh sách đơn hàng dạng table cho desktop
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { formatCurrency, formatCustomerName, getPaymentStatusConfig } from './helpers';
import { Order } from './types';

interface OrderDesktopTableProps {
  orders: Order[];
  onViewDetail: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPrint?: (orderId: string) => void;
  onEmail?: (orderId: string) => void;
}

export default function OrderDesktopTable({
  orders,
  onViewDetail,
  onStatusChange,
  onPrint,
  onEmail,
}: OrderDesktopTableProps) {
  return (
    <div className="hidden lg:block">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                const customerName = formatCustomerName(order.guestName, order.shippingAddress);

                return (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    {/* Order Number */}
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>

                    {/* Customer Info */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.guestEmail || 'N/A'}
                        </p>
                      </div>
                    </TableCell>

                    {/* Order Status (Combobox) */}
                    <TableCell>
                      <OrderStatusCombobox
                        value={order.status}
                        onChange={(newStatus: string) => onStatusChange(order.id, newStatus)}
                      />
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <Badge variant="secondary" className={paymentConfig.className}>
                        {paymentConfig.label}
                      </Badge>
                    </TableCell>

                    {/* Items Count */}
                    <TableCell>{order.items?.length || 0} sản phẩm</TableCell>

                    {/* Total Amount */}
                    <TableCell className="font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
