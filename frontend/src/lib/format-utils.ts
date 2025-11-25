/**
 * Format utilities for Page Builder
 */

export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price));
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString('vi-VN');
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};
