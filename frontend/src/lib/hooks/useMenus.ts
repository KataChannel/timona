/**
 * Custom hooks for Menu operations using Universal Dynamic Query System
 * FIXED VERSION - Using direct Apollo imports to avoid circular dependencies
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { DYNAMIC_FIND_MANY, DYNAMIC_CREATE, DYNAMIC_UPDATE, DYNAMIC_DELETE } from '../graphql/universal-dynamic-queries';
import { UPDATE_MENU_ADMIN, CREATE_MENU_ADMIN, DELETE_MENU_ADMIN } from '@/graphql/menu.queries';
import {
  buildMenuFindManyInput,
  buildMenuFindUniqueInput,
  buildMenuCreateInput,
  buildMenuUpdateInput,
  buildMenuDeleteInput,
  buildMenuCountInput,
  buildMenuTree,
  getMenusByTypeWhere,
  getActiveMenusWhere,
  getPublicMenusWhere,
  getRootMenusWhere,
  DEFAULT_MENU_SELECT,
  type Menu,
  type MenuTreeNode,
} from '../graphql/menu-dynamic-queries';

// ==================== QUERY HOOKS ====================

/**
 * Hook to get all menus with filters
 */
export function useMenus(params?: {
  where?: any;
  orderBy?: any;
  pagination?: { page: number; limit: number };
  select?: any;
}) {
  const input = buildMenuFindManyInput({
    where: params?.where || getActiveMenusWhere(),
    select: params?.select || DEFAULT_MENU_SELECT,
    orderBy: params?.orderBy,
    pagination: params?.pagination,
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const menus = useMemo(() => {
    try {
      const result = data?.dynamicFindMany?.data;
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn('Error extracting menus data:', err);
      return [];
    }
  }, [data]);

  return {
    menus,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's accessible menus based on roles/permissions
 */
export function useMyMenus(type?: string) {
  const where = type ? getMenusByTypeWhere(type) : getActiveMenusWhere();
  
  const input = buildMenuFindManyInput({
    where,
    select: DEFAULT_MENU_SELECT,
    orderBy: { order: 'asc', level: 'asc' },
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const menus = useMemo(() => {
    try {
      const result = data?.dynamicFindMany?.data;
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.warn('Error extracting menus data:', err);
      return [];
    }
  }, [data]);

  return {
    menus,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get sidebar menus for authenticated users
 * Builds tree structure from flat array and transforms to NavigationItem format
 */
export function useAdminMenus() {
  const input = buildMenuFindManyInput({
    where: getMenusByTypeWhere('SIDEBAR'),
    select: DEFAULT_MENU_SELECT,
    orderBy: { order: 'asc', level: 'asc' },
  });
  
  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input },
    fetchPolicy: 'cache-first',  // FIX: Prevent cache-and-network double fetches
    errorPolicy: 'all',
  });
  
  const transformMenu = useCallback((menu: MenuTreeNode): any => {
    if (!menu) return null;

    try {
      // Determine href priority: externalUrl > route > url > path > /slug
      const href = menu.externalUrl || menu.route || menu.url || menu.path || `/${menu.slug}`;
      const isExternal = !!menu.externalUrl;
      
      // Ensure we have a name - fallback to slug if title is missing
      const name = menu.title || menu.slug || 'Menu';
      
      return {
        title: menu.title,
        name: name,  // Always have a name for display
        href: href,
        icon: menu.icon || undefined,
        requiredRoles: menu.requiredRoles || undefined,
        requiredPermissions: menu.requiredPermissions || undefined,
        isPublic: menu.isPublic,
        children: menu.children?.map(transformMenu).filter(Boolean) || undefined,
        badge: menu.badge || undefined,
        badgeColor: menu.badgeColor || undefined,
        target: menu.target || 'SELF',
        metadata: {
          id: menu.id,
          type: menu.type,
          order: menu.order,
          level: menu.level,
          isProtected: menu.isProtected,
          isActive: menu.isActive,
          isVisible: menu.isVisible,
          isPublic: menu.isPublic,
          slug: menu.slug,
          description: menu.description,
          iconType: menu.iconType,
          cssClass: menu.cssClass,
          customData: menu.customData,
          externalUrl: menu.externalUrl,
          isExternal: isExternal,
          ...menu.metadata,
        },
      };
    } catch (err) {
      console.warn('Error transforming menu:', err, menu);
      return null;
    }
  }, []);

  const menus = useMemo(() => {
    try {
      const result = data?.dynamicFindMany?.data as Menu[] | undefined;
      if (!result || !Array.isArray(result)) return [];
      
      // Build tree from flat array
      const tree = buildMenuTree(result);
      
      // Transform to sidebar format
      return tree.map(transformMenu).filter(Boolean);
    } catch (err) {
      console.error('Error transforming menus:', err);
      return [];
    }
  }, [data, transformMenu]);
  
  return {
    menus,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get public sidebar menus (no authentication required)
 */
export function usePublicSidebarMenus() {
  const input = buildMenuFindManyInput({
    where: {
      ...getPublicMenusWhere(),
      type: 'SIDEBAR',
    },
    select: DEFAULT_MENU_SELECT,
    orderBy: { order: 'asc', level: 'asc' },
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const menus = useMemo(() => {
    try {
      const result = data?.dynamicFindMany?.data as Menu[] | undefined;
      if (!result || !Array.isArray(result)) return [];
      return buildMenuTree(result);
    } catch (err) {
      console.warn('Error building menu tree:', err);
      return [];
    }
  }, [data]);
  
  return {
    menus,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get menu tree structure
 */
export function useMenuTree(type?: string, parentId?: string) {
  const where = parentId
    ? { parentId, isActive: true, isVisible: true }
    : getRootMenusWhere(type);

  const input = buildMenuFindManyInput({
    where,
    select: DEFAULT_MENU_SELECT,
    orderBy: { order: 'asc', level: 'asc' },
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const tree = useMemo(() => {
    try {
      const result = data?.dynamicFindMany?.data as Menu[] | undefined;
      if (!result || !Array.isArray(result)) return [];
      return buildMenuTree(result);
    } catch (err) {
      console.warn('Error building menu tree:', err);
      return [];
    }
  }, [data]);

  return {
    tree,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get single menu by ID
 */
export function useMenu(id: string) {
  const input = buildMenuFindUniqueInput({
    where: { id },
    select: DEFAULT_MENU_SELECT,
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input: { ...input, pagination: { limit: 1 } } },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return {
    menu: data?.dynamicFindMany?.data?.[0],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get single menu by slug
 */
export function useMenuBySlug(slug: string) {
  const input = buildMenuFindUniqueInput({
    where: { slug },
    select: DEFAULT_MENU_SELECT,
  });

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input: { ...input, pagination: { limit: 1 } } },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return {
    menu: data?.dynamicFindMany?.data?.[0],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to count menus
 */
export function useMenuCount(where?: any) {
  const input = buildMenuCountInput(where);

  const { data, loading, error, refetch } = useQuery(DYNAMIC_FIND_MANY, {
    variables: { input: { model: 'menu', where } },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return {
    count: data?.dynamicFindMany?.data?.length || 0,
    loading,
    error,
    refetch,
  };
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create menu
 */
export function useCreateMenu() {
  const [mutate, { data, loading, error }] = useMutation(CREATE_MENU_ADMIN, {
    errorPolicy: 'all',
  });

  const createMenu = useCallback(
    async (menuData: Partial<Menu>) => {
      try {
        return await mutate({ 
          variables: { 
            input: menuData 
          } 
        });
      } catch (err) {
        console.error('Error creating menu:', err);
        throw err;
      }
    },
    [mutate]
  );

  return {
    createMenu,
    data: data?.createMenu,
    loading,
    error,
  };
}

/**
 * Hook to update menu
 */
export function useUpdateMenu() {
  const [mutate, { data, loading, error }] = useMutation(UPDATE_MENU_ADMIN, {
    errorPolicy: 'all',
  });

  const updateMenu = useCallback(
    async (id: string, menuData: Partial<Menu>) => {
      try {
        return await mutate({ 
          variables: { 
            id,
            input: menuData 
          } 
        });
      } catch (err) {
        console.error('Error updating menu:', err);
        throw err;
      }
    },
    [mutate]
  );

  return {
    updateMenu,
    data: data?.updateMenu,
    loading,
    error,
  };
}

/**
 * Hook to delete menu
 */
export function useDeleteMenu() {
  const [mutate, { data, loading, error }] = useMutation(DELETE_MENU_ADMIN, {
    errorPolicy: 'all',
  });

  const deleteMenu = useCallback(
    async (id: string) => {
      try {
        return await mutate({ 
          variables: { 
            id 
          } 
        });
      } catch (err) {
        console.error('Error deleting menu:', err);
        throw err;
      }
    },
    [mutate]
  );

  return {
    deleteMenu,
    data: data?.deleteMenu,
    loading,
    error,
  };
}
