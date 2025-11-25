/**
 * Order Management Constants & Types
 * Chứa tất cả constants, enums, types, interfaces cho order management
 */

// ================================
// Order Status Enum
// ================================
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.REFUNDED]: 'Đã hoàn tiền',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 hover:bg-green-100',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800 hover:bg-green-100',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 hover:bg-red-100',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

// ================================
// Payment Status Enum
// ================================
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ thanh toán',
  [PaymentStatus.PROCESSING]: 'Đang xử lý',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800 hover:bg-green-100',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800 hover:bg-red-100',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

// ================================
// TypeScript Interfaces
// ================================

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId?: string;
  productName: string;
  thumbnail?: string;
  sku?: string;
  variantName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  shippingMethod?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress?: any; // JSON field
  items: OrderItem[];
}

export interface OrderStatistics {
  success: boolean;
  message: string;
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
}

export interface OrderFilterInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderListResponse {
  errors?: string[];
  message?: string;
  orders: Order[];
  total: number;
  hasMore: boolean;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  order: Order;
}

// ================================
// Pagination
// ================================
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export const DEFAULT_PAGINATION: PaginationInput = {
  page: 1,
  limit: 50,
};
