'use client';

import { useState, useCallback } from 'react';

/**
 * Shared hook for managing category expansion state
 * Used by SavedBlocksLibrary, TemplatesLibrary, ElementsLibrary
 */

export interface UseCategoryToggleOptions {
  defaultExpanded?: boolean;
  initialState?: Record<string, boolean>;
}

export interface UseCategoryToggleResult {
  expandedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  expandAll: (categories: string[]) => void;
  collapseAll: () => void;
  setExpandedCategories: (state: Record<string, boolean>) => void;
  isExpanded: (category: string) => boolean;
}

export function useCategoryToggle(
  options: UseCategoryToggleOptions = {}
): UseCategoryToggleResult {
  const { defaultExpanded = false, initialState = {} } = options;

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    initialState
  );

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const expandAll = useCallback((categories: string[]) => {
    setExpandedCategories(
      categories.reduce(
        (acc, cat) => ({
          ...acc,
          [cat]: true,
        }),
        {}
      )
    );
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedCategories({});
  }, []);

  const isExpanded = useCallback(
    (category: string) => {
      return expandedCategories[category] ?? defaultExpanded;
    },
    [expandedCategories, defaultExpanded]
  );

  return {
    expandedCategories,
    toggleCategory,
    expandAll,
    collapseAll,
    setExpandedCategories,
    isExpanded,
  };
}
