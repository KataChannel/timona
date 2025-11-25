/**
 * Menu Feature - Custom Hook
 * Clean Architecture - Application Layer
 */

'use client';

import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_PUBLIC_MENUS, GET_HEADER_MENUS } from '@/graphql/menu.queries';
import { MenuItem, MenuType, MenuFilter } from '../types/menu.types';

interface UseMenuOptions {
  type?: MenuType;
  filter?: MenuFilter;
  includeChildren?: boolean;
  isPublic?: boolean;
}

interface UseMenuResult {
  menus: MenuItem[];
  loading: boolean;
  error: any;
  tree: MenuItem[];
  flatList: MenuItem[];
  getMenuById: (id: string) => MenuItem | undefined;
  getMenuBySlug: (slug: string) => MenuItem | undefined;
  getChildrenOf: (parentId: string) => MenuItem[];
}

/**
 * Hook để quản lý menu với caching và optimization
 */
export function useMenu(options: UseMenuOptions = {}): UseMenuResult {
  const {
    type,
    filter = {},
    includeChildren = true,
    isPublic = true,
  } = options;

  // Query selection based on public/private
  const query = isPublic ? GET_PUBLIC_MENUS : GET_HEADER_MENUS;

  const { data, loading, error } = useQuery(query, {
    variables: {
      type,
      isActive: filter.isActive ?? true,
      isVisible: filter.isVisible ?? true,
      includeChildren,
      orderBy: { order: 'asc' },
    },
    skip: !isPublic && !type, // Skip if not public and no type specified
  });

  // Parse menu data
  const menus = useMemo<MenuItem[]>(() => {
    if (!data) return [];
    
    const menuData = isPublic ? data.publicMenus : data.headerMenus;
    
    if (typeof menuData === 'string') {
      try {
        return JSON.parse(menuData);
      } catch {
        return [];
      }
    }
    
    return Array.isArray(menuData) ? menuData : [];
  }, [data, isPublic]);

  // Build tree structure
  const tree = useMemo<MenuItem[]>(() => {
    if (!includeChildren) return menus;
    
    const rootMenus = menus.filter(m => !m.parentId);
    return rootMenus.map(menu => buildMenuTree(menu, menus));
  }, [menus, includeChildren]);

  // Flatten tree for easy access
  const flatList = useMemo<MenuItem[]>(() => {
    return flattenMenuTree(tree);
  }, [tree]);

  // Helper functions
  const getMenuById = (id: string): MenuItem | undefined => {
    return flatList.find(m => m.id === id);
  };

  const getMenuBySlug = (slug: string): MenuItem | undefined => {
    return flatList.find(m => m.slug === slug);
  };

  const getChildrenOf = (parentId: string): MenuItem[] => {
    return menus.filter(m => m.parentId === parentId);
  };

  return {
    menus,
    loading,
    error,
    tree,
    flatList,
    getMenuById,
    getMenuBySlug,
    getChildrenOf,
  };
}

/**
 * Build hierarchical tree from flat menu list
 */
function buildMenuTree(menu: MenuItem, allMenus: MenuItem[]): MenuItem {
  const children = allMenus
    .filter(m => m.parentId === menu.id)
    .map(child => buildMenuTree(child, allMenus))
    .sort((a, b) => a.order - b.order);

  return {
    ...menu,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Flatten tree structure to list
 */
function flattenMenuTree(tree: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  
  function traverse(items: MenuItem[]) {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }
  
  traverse(tree);
  return result;
}

/**
 * Hook for specific menu type (convenience wrapper)
 */
export function useHeaderMenu() {
  return useMenu({ type: MenuType.HEADER, isPublic: true });
}

export function useFooterMenu() {
  return useMenu({ type: MenuType.FOOTER, isPublic: true });
}

export function useSidebarMenu() {
  return useMenu({ type: MenuType.SIDEBAR, isPublic: false });
}

export function useMobileMenu() {
  return useMenu({ type: MenuType.MOBILE, isPublic: true });
}
