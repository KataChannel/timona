import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAGES } from '@/graphql/queries/pages';
import { Page } from '@/types/page-builder';

// Define PageTemplate type (subset of Page used as template)
export interface PageTemplate extends Omit<Page, 'id'> {
  id?: string;
  name?: string;
  category?: string;
  tags?: string[];
  isTemplate?: boolean;
  previewImage?: string;
}

interface TemplateCache {
  data: PageTemplate[];
  timestamp: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache
const templateCache = new Map<string, TemplateCache>();

/**
 * Hook for managing page templates with caching and lazy loading
 * 
 * Features:
 * - In-memory caching with TTL
 * - Lazy loading support
 * - Automatic cache invalidation
 * - Prefetching capabilities
 */
export const usePageTemplates = (options?: {
  category?: string;
  lazy?: boolean;
  skipCache?: boolean;
}) => {
  const { category, lazy = false, skipCache = false } = options || {};
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(!lazy);
  const hasLoadedRef = useRef(false);

  const cacheKey = `templates-${category || 'all'}`;

  // GraphQL query - skip if lazy loading and not triggered
  const { data, loading, error, refetch } = useQuery(GET_PAGES, {
    variables: { 
      filters: { 
        ...(category ? { category } : {}),
        isTemplate: true 
      }
    },
    skip: lazy && !hasLoadedRef.current,
    errorPolicy: 'all',
  });

  // Check cache and load data
  useEffect(() => {
    if (!skipCache && !hasLoadedRef.current) {
      const cached = templateCache.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        // Use cached data
        setTemplates(cached.data);
        setIsLoading(false);
        return;
      }
    }

    // Load from GraphQL if not lazy or already triggered
    if (!lazy || hasLoadedRef.current) {
      if (!loading && data?.getPages?.items) {
        const templateData = data.getPages.items as PageTemplate[];
        setTemplates(templateData);
        
        // Update cache
        if (!skipCache) {
          templateCache.set(cacheKey, {
            data: templateData,
            timestamp: Date.now(),
          });
        }
      }
      setIsLoading(loading);
    }
  }, [data, loading, lazy, cacheKey, skipCache]);

  // Manual load function for lazy loading
  const load = useCallback(async () => {
    if (hasLoadedRef.current) return templates;

    setIsLoading(true);
    hasLoadedRef.current = true;

    try {
      const result = await refetch();
      const templateData = (result.data?.getPages?.items || []) as PageTemplate[];
      setTemplates(templateData);
      
      // Update cache
      if (!skipCache) {
        templateCache.set(cacheKey, {
          data: templateData,
          timestamp: Date.now(),
        });
      }
      
      return templateData;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refetch, cacheKey, skipCache, templates]);

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    templateCache.delete(cacheKey);
    hasLoadedRef.current = false;
  }, [cacheKey]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    templateCache.clear();
  }, []);

  // Prefetch templates
  const prefetch = useCallback(async () => {
    if (!hasLoadedRef.current) {
      await load();
    }
  }, [load]);

  return {
    templates,
    isLoading,
    error,
    load,
    refetch,
    invalidateCache,
    clearAllCache,
    prefetch,
    isCached: templateCache.has(cacheKey),
  };
};

/**
 * Hook for prefetching templates in the background
 * Useful for improving perceived performance
 */
export const usePrefetchTemplates = (categories?: string[]) => {
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetch = useCallback(async () => {
    const categoriesToPrefetch = categories || ['all'];

    for (const category of categoriesToPrefetch) {
      const cacheKey = `templates-${category}`;
      
      if (prefetchedRef.current.has(cacheKey)) {
        continue; // Already prefetched
      }

      // Check if already in cache
      const cached = templateCache.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        prefetchedRef.current.add(cacheKey);
        continue; // Already cached and fresh
      }

      // Prefetch in background
      // This would require the actual GraphQL client instance
      // For now, we'll mark it as a placeholder
      prefetchedRef.current.add(cacheKey);
    }
  }, [categories]);

  useEffect(() => {
    // Prefetch on mount after a short delay
    const timer = setTimeout(prefetch, 1000);
    return () => clearTimeout(timer);
  }, [prefetch]);

  return { prefetch };
};

/**
 * Hook for template search with debouncing
 */
export const useTemplateSearch = (allTemplates: PageTemplate[], debounceMs = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<PageTemplate[]>(allTemplates);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((term: string) => {
    setSearchTerm(term);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce search
    debounceTimer.current = setTimeout(() => {
      if (!term.trim()) {
        setFilteredTemplates(allTemplates);
        return;
      }

      const lowerTerm = term.toLowerCase();
      const filtered = allTemplates.filter((template) => {
        return (
          template.name?.toLowerCase().includes(lowerTerm) ||
          template.title?.toLowerCase().includes(lowerTerm) ||
          template.seoDescription?.toLowerCase().includes(lowerTerm) ||
          template.category?.toLowerCase().includes(lowerTerm) ||
          template.tags?.some((tag: string) => tag.toLowerCase().includes(lowerTerm))
        );
      });

      setFilteredTemplates(filtered);
    }, debounceMs);
  }, [allTemplates, debounceMs]);

  // Update filtered templates when allTemplates changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(allTemplates);
    } else {
      search(searchTerm);
    }
  }, [allTemplates]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    searchTerm,
    filteredTemplates,
    search,
    clearSearch: () => search(''),
  };
};

/**
 * Utility: Get cache statistics
 */
export const getTemplateCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalCached: templateCache.size,
    fresh: 0,
    stale: 0,
    cacheKeys: [] as string[],
  };

  templateCache.forEach((cache, key) => {
    stats.cacheKeys.push(key);
    if ((now - cache.timestamp) < CACHE_DURATION) {
      stats.fresh++;
    } else {
      stats.stale++;
    }
  });

  return stats;
};

export default usePageTemplates;
