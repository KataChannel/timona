/**
 * Menu Feature - Type Definitions
 * Clean Architecture - Domain Layer
 */

export enum MenuType {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  SIDEBAR = 'SIDEBAR',
  MOBILE = 'MOBILE',
}

export enum MenuTarget {
  SELF = 'SELF',
  BLANK = 'BLANK',
  PARENT = 'PARENT',
  TOP = 'TOP',
}

export enum MenuLinkType {
  URL = 'URL',
  ROUTE = 'ROUTE',
  EXTERNAL = 'EXTERNAL',
  PRODUCT_LIST = 'PRODUCT_LIST',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  BLOG_LIST = 'BLOG_LIST',
  BLOG_DETAIL = 'BLOG_DETAIL',
  CATEGORY = 'CATEGORY',
  BLOG_CATEGORY = 'BLOG_CATEGORY',
  PAGE = 'PAGE',
}

export interface MenuItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: MenuType;
  parentId?: string | null;
  order: number;
  level: number;
  path?: string | null;
  
  // Navigation
  url?: string | null;
  route?: string | null;
  externalUrl?: string | null;
  target: MenuTarget;
  linkType: MenuLinkType;
  
  // Styling
  icon?: string | null;
  iconType?: string | null;
  badge?: string | null;
  badgeColor?: string | null;
  image?: string | null;
  cssClass?: string | null;
  
  // Dynamic Linking
  productId?: string | null;
  blogPostId?: string | null;
  pageId?: string | null;
  categoryId?: string | null;
  blogCategoryId?: string | null;
  queryConditions?: any;
  
  // Permissions
  requiredPermissions: string[];
  requiredRoles: string[];
  isPublic: boolean;
  
  // Status
  isActive: boolean;
  isVisible: boolean;
  isProtected: boolean;
  
  // Hierarchy
  children?: MenuItem[];
  
  // Metadata
  metadata?: any;
  customData?: any;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface MenuTreeNode extends MenuItem {
  children: MenuTreeNode[];
  depth: number;
  hasChildren: boolean;
}

export interface MenuFilter {
  type?: MenuType;
  isActive?: boolean;
  isVisible?: boolean;
  isPublic?: boolean;
  parentId?: string | null;
  search?: string;
}

export interface MenuQueryConditions {
  sort?: 'latest' | 'bestseller' | 'popular' | 'price_asc' | 'price_desc';
  limit?: number;
  featured?: boolean;
  categoryId?: string;
}
