'use client';

import { useState, useMemo } from 'react';
import { type OrderListItem } from '@/types/order.types';

interface UseOrderFiltersProps {
  orders: OrderListItem[];
}

interface UseOrderFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  openStatusCombobox: boolean;
  setOpenStatusCombobox: (open: boolean) => void;
  filteredOrders: OrderListItem[];
}

/**
 * useOrderFilters Hook
 * 
 * Custom hook for order filtering logic
 * Separates concerns: UI components vs business logic
 * Provides state management and filtering functionality
 * 
 * @param orders - Array of orders to filter
 * @returns Filter state and filtered orders
 */
export function useOrderFilters({
  orders,
}: UseOrderFiltersProps): UseOrderFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openStatusCombobox, setOpenStatusCombobox] = useState(false);

  // Memoized filtered orders for performance
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by search query (order number or product name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        // Search in order number
        if (order.orderNumber.toLowerCase().includes(query)) {
          return true;
        }

        // Search in product names
        return order.items.some((item) =>
          item.productName.toLowerCase().includes(query)
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchQuery, statusFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    openStatusCombobox,
    setOpenStatusCombobox,
    filteredOrders,
  };
}
