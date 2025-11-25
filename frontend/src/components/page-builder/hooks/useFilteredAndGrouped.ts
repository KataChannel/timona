'use client';

import { useMemo } from 'react';

/**
 * Shared hook for filtering and grouping items
 * Used by SavedBlocksLibrary, TemplatesLibrary, ElementsLibrary
 */

export interface FilteredAndGroupedResult<T> {
  groupedItems: Record<string, T[]>;
  itemCount: number;
  groupCount: number;
  isEmpty: boolean;
}

interface UseFilteredAndGroupedOptions {
  searchFields?: string[];
  groupByField?: string;
  caseSensitive?: boolean;
}

export function useFilteredAndGrouped<
  T extends Record<string, any> = any
>(
  items: T[] | undefined | null,
  searchQuery: string = '',
  options: UseFilteredAndGroupedOptions = {}
): FilteredAndGroupedResult<T> {
  const {
    searchFields = ['name', 'description'],
    groupByField = 'category',
    caseSensitive = false,
  } = options;

  return useMemo(() => {
    if (!items || items.length === 0) {
      return {
        groupedItems: {},
        itemCount: 0,
        groupCount: 0,
        isEmpty: true,
      };
    }

    // Step 1: Filter items based on search query
    const filteredItems = items.filter((item) => {
      if (!searchQuery) return true;

      const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();

      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          const fieldValue = caseSensitive ? value : value.toLowerCase();
          return fieldValue.includes(query);
        }
        if (Array.isArray(value)) {
          return value.some((v) => {
            const str = typeof v === 'string' ? v : String(v);
            const fieldValue = caseSensitive ? str : str.toLowerCase();
            return fieldValue.includes(query);
          });
        }
        return false;
      });
    });

    // Step 2: Group items by field
    const grouped = filteredItems.reduce(
      (acc, item) => {
        const group = String(item[groupByField] || 'Other');
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );

    // Sort groups and items within groups
    const sortedGroups = Object.keys(grouped).sort();
    const sortedGrouped = sortedGroups.reduce(
      (acc, key) => {
        acc[key] = grouped[key];
        return acc;
      },
      {} as Record<string, T[]>
    );

    return {
      groupedItems: sortedGrouped,
      itemCount: filteredItems.length,
      groupCount: Object.keys(sortedGrouped).length,
      isEmpty: filteredItems.length === 0,
    };
  }, [items, searchQuery, searchFields, groupByField, caseSensitive]);
}
