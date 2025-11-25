/**
 * Order Types - Shared interfaces for Order Management
 * Following Clean Architecture principles
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKAGING'
  | 'READY_TO_SHIP'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'MOMO'
  | 'ZALOPAY'
  | 'VNPAY';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'FAILED';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export interface ShippingAddress {
  name?: string;
  fullName?: string;
  phone: string;
  email?: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  province?: string;
  postalCode?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type TrackingEventType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PROCESSING_STARTED'
  | 'PACKAGING_STARTED'
  | 'READY_TO_SHIP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderTrackingEvent {
  id: string;
  type: TrackingEventType;
  status: string;
  description?: string;
  location?: string;
  timestamp: string | Date;
}

export interface OrderTracking {
  id: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: OrderTrackingEvent[];
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  customerNote?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | string; // Can be JSON string from API
  billingAddress?: ShippingAddress | string;
  tracking?: OrderTracking;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderFilters {
  searchQuery: string;
  statusFilter: string;
}

export interface OrderFilterOptions {
  value: string;
  label: string;
  count?: number;
}

export const ORDER_STATUS_OPTIONS: OrderFilterOptions[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'PACKAGING', label: 'Đang đóng gói' },
  { value: 'READY_TO_SHIP', label: 'Sẵn sàng giao' },
  { value: 'SHIPPING', label: 'Đang giao hàng' },
  { value: 'DELIVERED', label: 'Đã giao hàng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'RETURNED', label: 'Đã hoàn trả' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];
