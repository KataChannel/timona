/**
 * Menu Dynamic Queries using Universal Dynamic Query System
 * 
 * Sử dụng dynamicFindMany, dynamicCreate, dynamicUpdate, dynamicDelete
 * để thao tác với Menu model thông qua Universal Dynamic Query System
 */

import type {
  FindManyInput,
  FindUniqueInput,
  CreateInput,
  UpdateInput,
  DeleteInput,
  CountInput,
} from './universal-dynamic-types';

// ==================== TYPE DEFINITIONS ====================

export interface Menu {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: string; // MenuType enum: SIDEBAR, HEADER, FOOTER, MOBILE, CUSTOM
  
  // Hierarchy
  parentId?: string | null;
  order: number;
  level: number;
  path?: string | null;
  
  // Navigation
  url?: string | null;
  route?: string | null;
  externalUrl?: string | null;
  target?: string; // MenuTarget enum: SELF, BLANK, MODAL
  
  // Display
  icon?: string | null;
  iconType?: string | null;
  badge?: string | null;
  badgeColor?: string | null;
  image?: string | null;
  
  // Permissions & Access
  requiredPermissions: string[];
  requiredRoles: string[];
  isPublic: boolean;
  
  // State
  isActive: boolean;
  isVisible: boolean;
  isProtected: boolean;
  
  // Metadata
  metadata?: any | null;
  cssClass?: string | null;
  customData?: any | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  
  // Relations (for GraphQL responses)
  parent?: Menu | null;
  children?: Menu[] | null;
}

export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
}

// ==================== INPUT BUILDERS ====================

/**
 * Build FindManyInput for Menu queries
 */
export function buildMenuFindManyInput(params: {
  where?: any;
  select?: any;
  orderBy?: any;
  pagination?: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}): FindManyInput {
  return {
    model: 'menu',
    where: params.where,
    select: params.select,
    orderBy: params.orderBy || { order: 'asc', createdAt: 'desc' },
    pagination: params.pagination,
  };
}

/**
 * Build FindUniqueInput for Menu single record
 */
export function buildMenuFindUniqueInput(params: {
  where: { id?: string; slug?: string };
  select?: any;
}): FindUniqueInput {
  return {
    model: 'menu',
    where: params.where,
    select: params.select,
  };
}

/**
 * Build CreateInput for Menu creation
 */
export function buildMenuCreateInput(data: Partial<Menu>): CreateInput {
  return {
    model: 'menu',
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      type: data.type,
      parentId: data.parentId,
      order: data.order || 0,
      level: data.level || 0,
      path: data.path,
      url: data.url,
      route: data.route,
      externalUrl: data.externalUrl,
      target: data.target,
      icon: data.icon,
      iconType: data.iconType,
      badge: data.badge,
      badgeColor: data.badgeColor,
      image: data.image,
      requiredPermissions: data.requiredPermissions,
      requiredRoles: data.requiredRoles,
      isPublic: data.isPublic ?? true,
      isActive: data.isActive ?? true,
      isVisible: data.isVisible ?? true,
      isProtected: data.isProtected ?? false,
    },
  };
}

/**
 * Build UpdateInput for Menu update
 */
export function buildMenuUpdateInput(
  where: { id?: string; slug?: string },
  data: Partial<Menu>
): UpdateInput {
  return {
    model: 'menu',
    where,
    data,
  };
}

/**
 * Build DeleteInput for Menu deletion
 */
export function buildMenuDeleteInput(where: { id?: string; slug?: string }): DeleteInput {
  return {
    model: 'menu',
    where,
  };
}

/**
 * Build CountInput for Menu count
 */
export function buildMenuCountInput(where?: any): CountInput {
  return {
    model: 'menu',
    where,
  };
}

// ==================== COMMON WHERE FILTERS ====================

/**
 * Get active menus filter
 */
export function getActiveMenusWhere() {
  return {
    isActive: true,
    isVisible: true,
  };
}

/**
 * Get menus by type filter
 */
export function getMenusByTypeWhere(type: string) {
  return {
    type,
    isActive: true,
    isVisible: true,
  };
}

/**
 * Get public menus filter
 */
export function getPublicMenusWhere() {
  return {
    isPublic: true,
    isActive: true,
    isVisible: true,
  };
}

/**
 * Get root menus filter (no parent)
 */
export function getRootMenusWhere(type?: string) {
  const where: any = {
    parentId: null,
    isActive: true,
    isVisible: true,
  };
  
  if (type) {
    where.type = type;
  }
  
  return where;
}

/**
 * Get child menus filter
 */
export function getChildMenusWhere(parentId: string) {
  return {
    parentId,
    isActive: true,
    isVisible: true,
  };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Build tree structure from flat menu array
 * Backend returns flat array, we build tree on frontend
 */
export function buildMenuTree(menus: Menu[]): MenuTreeNode[] {
  const menuMap = new Map<string, MenuTreeNode>();
  const rootMenus: MenuTreeNode[] = [];

  // Create map of all menus
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // Build tree structure
  menus.forEach(menu => {
    const node = menuMap.get(menu.id);
    if (!node) return;

    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        // Parent not found or not accessible, treat as root
        rootMenus.push(node);
      }
    } else {
      // Root menu
      rootMenus.push(node);
    }
  });

  // Sort each level by order
  const sortByOrder = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortByOrder(node.children);
      }
    });
  };

  sortByOrder(rootMenus);
  return rootMenus;
}

/**
 * Flatten tree structure back to array
 */
export function flattenMenuTree(tree: MenuTreeNode[]): Menu[] {
  const result: Menu[] = [];
  
  const traverse = (nodes: MenuTreeNode[]) => {
    nodes.forEach(node => {
      const { children, ...menu } = node;
      result.push(menu as Menu);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };
  
  traverse(tree);
  return result;
}

/**
 * Find menu by ID in tree
 */
export function findMenuInTree(tree: MenuTreeNode[], id: string): MenuTreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findMenuInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get menu path (breadcrumb)
 */
export function getMenuPath(menus: Menu[], targetId: string): Menu[] {
  const menuMap = new Map(menus.map(m => [m.id, m]));
  const path: Menu[] = [];
  
  let current = menuMap.get(targetId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? menuMap.get(current.parentId) : undefined;
  }
  
  return path;
}

/**
 * Default select fields for Menu queries
 */
export const DEFAULT_MENU_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  parentId: true,
  order: true,
  level: true,
  path: true,
  url: true,
  route: true,
  externalUrl: true,
  target: true,
  icon: true,
  iconType: true,
  badge: true,
  badgeColor: true,
  image: true,
  requiredPermissions: true,
  requiredRoles: true,
  isPublic: true,
  isActive: true,
  isVisible: true,
  isProtected: true,
  metadata: true,
  cssClass: true,
  customData: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
};
