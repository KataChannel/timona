import { useMemo } from 'react';
import { InventoryRow, SortField, SortDirection } from '../types';

interface UseInventoryFilterProps {
  rows: InventoryRow[];
  searchTerm: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

/**
 * Hook to filter and sort inventory rows
 * Returns filtered rows and search metadata for performance optimization
 */
export const useInventoryFilter = ({
  rows,
  searchTerm,
  sortField,
  sortDirection,
}: UseInventoryFilterProps): InventoryRow[] => {
  return useMemo(() => {
    const startTime = performance.now();
    let filtered = [...rows];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(row =>
        row.productName?.toLowerCase().includes(term) ||
        row.productCode?.toLowerCase().includes(term) ||
        row.unit?.toLowerCase().includes(term)
      );
      
      const endTime = performance.now();
      console.log(`🔍 Search completed in ${(endTime - startTime).toFixed(2)}ms - Found ${filtered.length}/${rows.length} records`);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'productName':
          aVal = (a.productName || '').toLowerCase();
          bVal = (b.productName || '').toLowerCase();
          break;
        case 'closingQuantity':
          aVal = a.closingQuantity || 0;
          bVal = b.closingQuantity || 0;
          break;
        case 'closingAmount':
          aVal = a.closingAmount || 0;
          bVal = b.closingAmount || 0;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [rows, searchTerm, sortField, sortDirection]);
};
