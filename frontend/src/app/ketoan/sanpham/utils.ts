export const formatPrice = (price: number | null): string => {
  if (price === null) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price));
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('vi-VN');
};
