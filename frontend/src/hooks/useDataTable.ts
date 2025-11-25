import { useState, useCallback, useMemo } from 'react';

/**
 * Generic Data Table Hook
 * 
 * Provides common functionality for data tables:
 * - Filtering
 * - Sorting
 * - Pagination
 * - Selection
 * - Search
 * 
 * @example
 * ```tsx
 * const table = useDataTable({
 *   initialFilters: { status: 'active' },
 *   initialSort: { field: 'createdAt', order: 'desc' },
 *   pageSize: 20
 * });
 * 
 * // Use in component
 * <input value={table.searchTerm} onChange={(e) => table.setSearchTerm(e.target.value)} />
 * <button onClick={() => table.toggleSort('name')}>Sort by Name</button>
 * ```
 */

export interface DataTableSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total?: number;
}

export interface UseDataTableOptions<T = any> {
  initialFilters?: T;
  initialSort?: DataTableSort;
  pageSize?: number;
  onFilterChange?: (filters: T) => void;
  onSortChange?: (sort: DataTableSort) => void;
  onPageChange?: (page: number) => void;
}

export interface UseDataTableReturn<T = any> {
  // Filters
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
  updateFilter: (key: keyof T, value: any) => void;
  resetFilters: () => void;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  
  // Sort
  sort: DataTableSort;
  setSort: React.Dispatch<React.SetStateAction<DataTableSort>>;
  toggleSort: (field: string) => void;
  
  // Pagination
  pagination: DataTablePagination;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Selection
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  toggleItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  allSelected: (ids: string[]) => boolean;
}

export function useDataTable<T = any>({
  initialFilters = {} as T,
  initialSort = { field: 'createdAt', order: 'desc' as const },
  pageSize = 20,
  onFilterChange,
  onSortChange,
  onPageChange,
}: UseDataTableOptions<T> = {}): UseDataTableReturn<T> {
  // Filters
  const [filters, setFilters] = useState<T>(initialFilters);
  
  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);
  
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  }, [initialFilters, onFilterChange]);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search term
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  });
  
  // Sort
  const [sort, setSort] = useState<DataTableSort>(initialSort);
  
  const toggleSort = useCallback((field: string) => {
    setSort(prev => {
      const newSort: DataTableSort = {
        field,
        order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
      };
      onSortChange?.(newSort);
      return newSort;
    });
  }, [onSortChange]);
  
  // Pagination
  const [pagination, setPagination] = useState<DataTablePagination>({
    page: 1,
    pageSize,
  });
  
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    onPageChange?.(page);
  }, [onPageChange]);
  
  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }));
  }, []);
  
  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);
  
  const prevPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);
  
  const canGoNext = useMemo(() => {
    if (!pagination.total) return true;
    return pagination.page * pagination.pageSize < pagination.total;
  }, [pagination]);
  
  const canGoPrev = useMemo(() => pagination.page > 1, [pagination.page]);
  
  // Selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);
  
  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(ids);
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  const isSelected = useCallback((id: string) => {
    return selectedItems.includes(id);
  }, [selectedItems]);
  
  const allSelected = useCallback((ids: string[]) => {
    return ids.length > 0 && ids.every(id => selectedItems.includes(id));
  }, [selectedItems]);
  
  return {
    // Filters
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    
    // Search
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    
    // Sort
    sort,
    setSort,
    toggleSort,
    
    // Pagination
    pagination,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    
    // Selection
    selectedItems,
    setSelectedItems,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
  };
}
