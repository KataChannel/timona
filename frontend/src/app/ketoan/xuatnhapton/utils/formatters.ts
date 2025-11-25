/**
 * Format number as Vietnamese currency (VND)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date to ISO format (YYYY-MM-DD) for input[type="date"]
 */
export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get default date range (last 30 days)
 */
export const getDefaultDateRange = (): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    startDate: formatDateISO(startDate),
    endDate: formatDateISO(endDate),
  };
};

/**
 * Parse Vietnamese date string (DD/MM/YYYY) to Date
 */
export const parseVietnameseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  } catch (error) {
    return null;
  }
};
