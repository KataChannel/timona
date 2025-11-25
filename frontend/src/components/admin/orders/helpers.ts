/**
 * Order Management Helper Functions
 * Chứa các utility functions cho order management
 */

import {
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from './types';

// ================================
// Currency Formatting
// ================================

/**
 * Format số tiền sang định dạng VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format số tiền ngắn gọn (K, M, B)
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B VND`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M VND`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K VND`;
  }
  return formatCurrency(amount);
};

// ================================
// Status Badge Config
// ================================

/**
 * Get Order Status Badge config
 */
export const getStatusConfig = (status: string) => {
  const orderStatus = status as OrderStatus;
  return {
    label: ORDER_STATUS_LABELS[orderStatus] || status,
    className: ORDER_STATUS_COLORS[orderStatus] || ORDER_STATUS_COLORS[OrderStatus.PENDING],
  };
};

/**
 * Get Payment Status Badge config
 */
export const getPaymentStatusConfig = (status: string) => {
  const paymentStatus = status as PaymentStatus;
  return {
    label: PAYMENT_STATUS_LABELS[paymentStatus] || status,
    className: PAYMENT_STATUS_COLORS[paymentStatus] || PAYMENT_STATUS_COLORS[PaymentStatus.PENDING],
  };
};

// ================================
// Order Number Formatting
// ================================

/**
 * Format order number với prefix
 */
export const formatOrderNumber = (orderNumber: string): string => {
  if (!orderNumber) return 'N/A';
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
};

// ================================
// Customer Name Formatting
// ================================

/**
 * Format tên khách hàng từ guest info hoặc shipping address
 */
export const formatCustomerName = (
  guestName?: string,
  shippingAddress?: any
): string => {
  // Try to get fullName from shippingAddress JSON
  if (shippingAddress?.fullName) {
    return shippingAddress.fullName;
  }
  if (guestName) {
    return guestName;
  }
  return 'Khách vãng lai';
};

// ================================
// Order Items Summary
// ================================

/**
 * Tính tổng số lượng sản phẩm trong đơn hàng
 */
export const getTotalItems = (items: Array<{ quantity: number }>): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Format số lượng sản phẩm
 */
export const formatItemCount = (count: number): string => {
  return `${count} sản phẩm${count > 1 ? '' : ''}`;
};

// ================================
// Address Formatting
// ================================

/**
 * Format địa chỉ đầy đủ
 */
export const formatFullAddress = (address?: {
  streetAddress?: string;
  ward?: string;
  district?: string;
  city?: string;
}): string => {
  if (!address) return 'N/A';

  const parts = [
    address.streetAddress,
    address.ward,
    address.district,
    address.city,
  ].filter(Boolean);

  return parts.join(', ') || 'N/A';
};

// ================================
// Validation
// ================================

/**
 * Kiểm tra order có thể cập nhật trạng thái không
 */
export const canUpdateStatus = (currentStatus: OrderStatus): boolean => {
  return ![
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ].includes(currentStatus);
};

/**
 * Kiểm tra order có thể hủy không
 */
export const canCancelOrder = (currentStatus: OrderStatus): boolean => {
  return [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
  ].includes(currentStatus);
};

/**
 * Kiểm tra order có thể hoàn tiền không
 */
export const canRefundOrder = (
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus
): boolean => {
  return (
    paymentStatus === PaymentStatus.PAID &&
    [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(orderStatus)
  );
};

// ================================
// Search & Filter Helpers
// ================================

/**
 * Normalize search term
 */
export const normalizeSearchTerm = (term: string): string => {
  return term.trim().toLowerCase();
};

/**
 * Check if order matches search term
 */
export const matchesSearchTerm = (
  order: {
    orderNumber: string;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    shippingAddress?: any;
  },
  searchTerm: string
): boolean => {
  const normalized = normalizeSearchTerm(searchTerm);
  if (!normalized) return true;

  const searchableFields = [
    order.orderNumber,
    order.guestEmail,
    order.guestName,
    order.guestPhone,
    order.shippingAddress?.fullName,
    order.shippingAddress?.phone,
  ]
    .filter(Boolean)
    .map((field) => normalizeSearchTerm(field as string));

  return searchableFields.some((field) => field.includes(normalized));
};

// ================================
// Export Excel Helpers
// ================================

/**
 * Prepare data for Excel export
 */
export const prepareOrdersForExport = (orders: any[]) => {
  return orders.map((order) => ({
    'Mã đơn': order.orderNumber,
    'Khách hàng': formatCustomerName(order.guestName, order.shippingAddress),
    'Email': order.guestEmail || 'N/A',
    'Số điện thoại': order.guestPhone || order.shippingAddress?.phone || 'N/A',
    'Trạng thái': ORDER_STATUS_LABELS[order.status as OrderStatus],
    'Thanh toán': PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus],
    'Tổng tiền': order.total,
    'Số sản phẩm': order.items?.length || 0,
    'Ngày tạo': new Date(order.createdAt).toLocaleString('vi-VN'),
  }));
};
