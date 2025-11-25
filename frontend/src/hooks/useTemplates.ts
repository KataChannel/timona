/**
 * PageBuilder Template System - React Hook
 * Phase 5.1: Template Data Layer
 * 
 * Hook for managing template state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTemplate, TemplateFilter, TemplateCategory } from '@/types/template';
import {
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  duplicateTemplate,
  importTemplate,
  downloadTemplate,
  initializeStorage,
} from '@/lib/templateStore';
import { DEFAULT_TEMPLATES } from '@/lib/templateDefaults';

export interface UseTemplatesResult {
  // State
  templates: PageTemplate[];
  filteredTemplates: PageTemplate[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filter: TemplateFilter;
  setFilter: (filter: Partial<TemplateFilter>) => void;
  resetFilter: () => void;

  // Operations
  addTemplate: (template: PageTemplate) => Promise<boolean>;
  updateTemplate: (template: PageTemplate) => Promise<boolean>;
  removeTemplate: (id: string) => Promise<boolean>;
  duplicate: (id: string, newName?: string) => Promise<PageTemplate | null>;
  importFromJSON: (jsonString: string) => Promise<{ success: boolean; template?: PageTemplate; error?: string }>;
  exportTemplate: (template: PageTemplate) => void;
  refresh: () => void;

  // Utilities
  getTemplateById: (id: string) => PageTemplate | undefined;
  getTemplatesByCategory: (category: TemplateCategory) => PageTemplate[];
}

const DEFAULT_FILTER: TemplateFilter = {
  category: 'all',
  search: '',
  tags: [],
  sortBy: 'date',
  sortOrder: 'desc',
};

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [filter, setFilterState] = useState<TemplateFilter>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize with defaults if needed
      initializeStorage(DEFAULT_TEMPLATES);

      // Load all templates
      const loaded = getAllTemplates();
      setTemplates(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter templates based on current filter
  const filteredTemplates = useCallback(() => {
    let result = [...templates];

    // Filter by category
    if (filter.category && filter.category !== 'all') {
      result = result.filter(t => t.category === filter.category);
    }

    // Filter by search
    if (filter.search && filter.search.trim() !== '') {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter(t => filter.tags!.some(tag => t.tags?.includes(tag)));
    }

    // Sort
    if (filter.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (filter.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
        }

        return filter.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [templates, filter])();

  // Add template
  const addTemplate = useCallback(async (template: PageTemplate): Promise<boolean> => {
    try {
      const success = saveTemplate(template);
      if (success) {
        loadTemplates();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
      return false;
    }
  }, [loadTemplates]);

  // Update template
  const updateTemplate = useCallback(async (template: PageTemplate): Promise<boolean> => {
    try {
      const success = saveTemplate(template);
      if (success) {
        loadTemplates();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      return false;
    }
  }, [loadTemplates]);

  // Remove template
  const removeTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = deleteTemplate(id);
      if (success) {
        loadTemplates();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    }
  }, [loadTemplates]);

  // Duplicate template
  const duplicate = useCallback(async (id: string, newName?: string): Promise<PageTemplate | null> => {
    try {
      const duplicated = duplicateTemplate(id, newName);
      if (duplicated) {
        loadTemplates();
      }
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
      return null;
    }
  }, [loadTemplates]);

  // Import from JSON
  const importFromJSON = useCallback(async (jsonString: string) => {
    try {
      const result = importTemplate(jsonString);
      if (result.success) {
        loadTemplates();
      }
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to import template',
      };
    }
  }, [loadTemplates]);

  // Export template
  const exportTemplateWrapper = useCallback((template: PageTemplate) => {
    try {
      downloadTemplate(template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export template');
    }
  }, []);

  // Set filter
  const setFilter = useCallback((newFilter: Partial<TemplateFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Reset filter
  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  // Get template by ID
  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: TemplateCategory) => {
    if (category === 'all') {
      return templates;
    }
    return templates.filter(t => t.category === category);
  }, [templates]);

  return {
    // State
    templates,
    filteredTemplates,
    isLoading,
    error,

    // Filters
    filter,
    setFilter,
    resetFilter,

    // Operations
    addTemplate,
    updateTemplate,
    removeTemplate: removeTemplate,
    duplicate,
    importFromJSON,
    exportTemplate: exportTemplateWrapper,
    refresh: loadTemplates,

    // Utilities
    getTemplateById,
    getTemplatesByCategory,
  };
}
