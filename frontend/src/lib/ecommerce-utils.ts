/**
 * E-Commerce Integration Utilities
 * Helpers để liên kết các features E-commerce
 */

import { ApolloClient } from '@apollo/client';
import { GET_CART } from '@/graphql/ecommerce.queries';

/**
 * Refresh cart data globally
 * Dùng sau khi add/remove/update cart
 */
export async function refreshCart(client: ApolloClient<any>) {
  try {
    await client.refetchQueries({
      include: [GET_CART],
    });
  } catch (error) {
    console.error('Failed to refresh cart:', error);
  }
}

/**
 * Format order number for display
 * Example: ORD-20251106-ABC123
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.toUpperCase();
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    CONFIRMED: 'blue',
    PROCESSING: 'indigo',
    PACKAGING: 'purple',
    READY_TO_SHIP: 'cyan',
    SHIPPING: 'blue',
    DELIVERED: 'green',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RETURNED: 'orange',
    REFUNDED: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: string): boolean {
  return ['PENDING', 'CONFIRMED'].includes(status);
}

/**
 * Calculate estimated delivery date
 */
export function getEstimatedDelivery(shippingMethod: string): string {
  const now = new Date();
  let daysToAdd = 3; // Default: Standard shipping

  switch (shippingMethod) {
    case 'EXPRESS':
      daysToAdd = 1;
      break;
    case 'SAME_DAY':
      daysToAdd = 0;
      break;
    case 'STANDARD':
    default:
      daysToAdd = 3;
      break;
  }

  const estimatedDate = new Date(now);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

  return estimatedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Validate phone number (Vietnam format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Share product on social media
 */
export function shareProduct(product: any, platform: 'facebook' | 'twitter' | 'copy') {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `${product.name} - Giá chỉ ${product.price.toLocaleString('vi-VN')}đ`;

  switch (platform) {
    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      );
      break;
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
      break;
    case 'copy':
      navigator.clipboard.writeText(url);
      break;
  }
}

/**
 * Track product view (analytics)
 */
export function trackProductView(productId: string, productName: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'view_item', {
      items: [
        {
          id: productId,
          name: productName,
        },
      ],
    });
  }
}

/**
 * Track add to cart (analytics)
 */
export function trackAddToCart(product: any, quantity: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'add_to_cart', {
      items: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
        },
      ],
    });
  }
}

/**
 * Track purchase (analytics)
 */
export function trackPurchase(order: any) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: order.orderNumber,
      value: order.total,
      currency: 'VND',
      items: order.items.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

/**
 * Format shipping address
 */
export function formatShippingAddress(address: any): string {
  const parts = [
    address.address,
    address.ward,
    address.district,
    address.province || address.city,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Get shipping method label
 */
export function getShippingMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Giao hàng tiêu chuẩn (3-5 ngày)',
    EXPRESS: 'Giao hàng nhanh (1-2 ngày)',
    SAME_DAY: 'Giao trong ngày',
    PICKUP: 'Tự đến lấy',
  };
  return labels[method] || method;
}

/**
 * Get payment method icon
 */
export function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    CASH_ON_DELIVERY: '💵',
    BANK_TRANSFER: '🏦',
    CREDIT_CARD: '💳',
    MOMO: '📱',
    ZALOPAY: '📱',
    VNPAY: '💳',
  };
  return icons[method] || '💳';
}

/**
 * Calculate loyalty points from order
 */
export function calculateLoyaltyPoints(orderTotal: number): number {
  // 1 point per 10,000 VND
  return Math.floor(orderTotal / 10000);
}

/**
 * Check if free shipping eligible
 */
export function isFreeShippingEligible(cartTotal: number): boolean {
  const FREE_SHIPPING_THRESHOLD = 500000; // 500,000 VND
  return cartTotal >= FREE_SHIPPING_THRESHOLD;
}

/**
 * Get remaining amount for free shipping
 */
export function getRemainingForFreeShipping(cartTotal: number): number {
  const FREE_SHIPPING_THRESHOLD = 500000;
  return Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
}
