import { gql } from '@apollo/client';

// ============================================================================
// PUBLIC QUERIES (NO AUTHENTICATION REQUIRED)
// ============================================================================

/**
 * Get Public Menus
 * Used for website header, footer, and navigation
 * No authentication required
 */
export const GET_PUBLIC_MENUS = gql`
  query GetPublicMenus(
    $type: String
    $isActive: Boolean
    $isVisible: Boolean
    $orderBy: JSON
    $skip: Int
    $take: Int
    $includeChildren: Boolean
  ) {
    publicMenus(
      type: $type
      isActive: $isActive
      isVisible: $isVisible
      orderBy: $orderBy
      skip: $skip
      take: $take
      includeChildren: $includeChildren
    )
  }
`;

/**
 * Get Public Menu by ID
 * No authentication required
 */
export const GET_PUBLIC_MENU_BY_ID = gql`
  query GetPublicMenuById(
    $id: String!
    $includeChildren: Boolean
  ) {
    publicMenuById(
      id: $id
      includeChildren: $includeChildren
    )
  }
`;

// ============================================================================
// QUERIES (REQUIRES AUTHENTICATION)
// ============================================================================

export const GET_HEADER_MENUS = gql`
  query GetHeaderMenus {
    headerMenus {
      id
      title
      slug
      description
      order
      level
      url
      route
      externalUrl
      target
      icon
      badge
      badgeColor
      isActive
      isVisible
      children {
        id
        title
        slug
        description
        order
        level
        url
        route
        externalUrl
        target
        icon
        badge
        isActive
        isVisible
        children {
          id
          title
          slug
          description
          order
          url
          route
          externalUrl
          target
          icon
          badge
          isActive
          isVisible
        }
      }
    }
  }
`;

export const GET_MENUS_BY_TYPE = gql`
  query GetMenusByType($type: MenuType!) {
    menus(filter: { type: $type, isActive: true, isVisible: true }) {
      items {
        id
        title
        slug
        description
        type
        order
        level
        url
        route
        externalUrl
        target
        icon
        badge
        badgeColor
        isActive
        isVisible
        children {
          id
          title
          slug
          description
          order
          level
          url
          route
          externalUrl
          target
          icon
          badge
          isActive
          isVisible
          children {
            id
            title
            slug
            description
            order
            url
            route
            externalUrl
            target
            icon
            badge
            isActive
            isVisible
          }
        }
      }
      total
      page
      pageSize
      totalPages
    }
  }
`;

export const GET_MENU_TREE = gql`
  query GetMenuTree($type: MenuType) {
    menuTree(type: $type) {
      id
      title
      slug
      description
      order
      level
      url
      route
      externalUrl
      target
      icon
      badge
      badgeColor
      isActive
      isVisible
      children {
        id
        title
        slug
        description
        order
        level
        url
        route
        externalUrl
        target
        icon
        badge
        isActive
        isVisible
        children {
          id
          title
          slug
          description
          order
          url
          route
          externalUrl
          target
          icon
          badge
          isActive
          isVisible
        }
      }
    }
  }
`;

export const GET_MENU_BY_SLUG = gql`
  query GetMenuBySlug($slug: String!) {
    menuBySlug(slug: $slug) {
      id
      title
      slug
      description
      type
      order
      level
      url
      route
      externalUrl
      target
      icon
      badge
      badgeColor
      isActive
      isVisible
      linkType
      customData
      children {
        id
        title
        slug
        description
        order
        level
        url
        route
        externalUrl
        target
        icon
        badge
        isActive
        isVisible
        linkType
        customData
        children {
          id
          title
          slug
          description
          order
          url
          route
          externalUrl
          target
          icon
          badge
          isActive
          isVisible
          linkType
          customData
        }
      }
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_MENU = gql`
  mutation CreateMenu($input: CreateMenuInput!) {
    createMenu(input: $input) {
      id
      title
      slug
      description
      type
      order
      level
      url
      route
      externalUrl
      target
      icon
      badge
      badgeColor
      isActive
      isVisible
      children {
        id
        title
        slug
        url
        route
        externalUrl
        target
        icon
        badge
        isActive
        isVisible
      }
    }
  }
`;

export const UPDATE_MENU = gql`
  mutation UpdateMenu($id: ID!, $input: UpdateMenuInput!) {
    updateMenu(id: $id, input: $input) {
      id
      title
      slug
      description
      type
      order
      level
      url
      route
      externalUrl
      target
      icon
      badge
      badgeColor
      isActive
      isVisible
      children {
        id
        title
        slug
        url
        route
        externalUrl
        target
        icon
        badge
        isActive
        isVisible
      }
    }
  }
`;

export const DELETE_MENU = gql`
  mutation DeleteMenu($id: ID!) {
    deleteMenu(id: $id)
  }
`;

export const REORDER_MENUS = gql`
  mutation ReorderMenus($ids: [ID!]!) {
    reorderMenus(ids: $ids) {
      id
      title
      order
      isActive
      isVisible
    }
  }
`;

export const TOGGLE_MENU_ACTIVE = gql`
  mutation ToggleMenuActive($id: ID!) {
    toggleMenuActive(id: $id) {
      id
      isActive
    }
  }
`;

export const TOGGLE_MENU_VISIBILITY = gql`
  mutation ToggleMenuVisibility($id: ID!) {
    toggleMenuVisibility(id: $id) {
      id
      isVisible
    }
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export enum MenuType {
  SIDEBAR = 'SIDEBAR',
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  MOBILE = 'MOBILE',
  CUSTOM = 'CUSTOM',
}

export enum MenuTarget {
  SELF = 'SELF',
  BLANK = 'BLANK',
  MODAL = 'MODAL',
}

export interface MenuItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  level: number;
  url?: string;
  route?: string;
  externalUrl?: string;
  target: MenuTarget;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  isActive: boolean;
  isVisible: boolean;
  children: MenuItem[];
}

export interface MenuQueryResponse {
  headerMenus?: MenuItem[];
  menus?: {
    items: MenuItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  menuTree?: MenuItem[];
  menuBySlug?: MenuItem;
}

// ============================================================================
// ADMIN QUERIES & MUTATIONS
// ============================================================================

export const GET_MENU_BY_ID_ADMIN = gql`
  query GetMenuByIdAdmin($id: ID!) {
    menu(id: $id) {
      id
      title
      slug
      description
      type
      parentId
      order
      level
      url
      route
      externalUrl
      target
      linkType
      productId
      blogPostId
      pageId
      categoryId
      blogCategoryId
      queryConditions
      icon
      badge
      badgeColor
      image
      isActive
      isVisible
      cssClass
    }
  }
`;

export const CREATE_MENU_ADMIN = gql`
  mutation CreateMenuAdmin($input: CreateMenuInput!) {
    createMenu(input: $input) {
      id
      title
      slug
      description
      type
      parentId
      order
      url
      route
      externalUrl
      target
      linkType
      icon
      iconType
      badge
      badgeColor
      image
      cssClass
      productId
      blogPostId
      pageId
      categoryId
      blogCategoryId
      queryConditions
      customData
      metadata
      requiredPermissions
      requiredRoles
      isPublic
      isActive
      isVisible
      isProtected
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MENU_ADMIN = gql`
  mutation UpdateMenuAdmin($id: ID!, $input: UpdateMenuInput!) {
    updateMenu(id: $id, input: $input) {
      id
      title
      slug
      description
      type
      parentId
      order
      url
      route
      externalUrl
      target
      linkType
      icon
      iconType
      badge
      badgeColor
      image
      cssClass
      productId
      blogPostId
      pageId
      categoryId
      blogCategoryId
      queryConditions
      customData
      metadata
      requiredPermissions
      requiredRoles
      isPublic
      isActive
      isVisible
      isProtected
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_MENU_ADMIN = gql`
  mutation DeleteMenuAdmin($id: ID!) {
    deleteMenu(id: $id)
  }
`;

// Helper queries for dynamic selectors
export const GET_PRODUCTS_FOR_MENU = gql`
  query GetProductsForMenu($search: String, $limit: Int) {
    products(input: { filters: { search: $search }, limit: $limit }) {
      items {
        id
        name
        slug
      }
    }
  }
`;

export const GET_BLOGS_FOR_MENU = gql`
  query GetBlogsForMenu($search: String, $limit: Int) {
    blogs(search: $search, limit: $limit) {
      items {
        id
        title
        slug
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategoriesForMenu {
    categories {
      id
      name
      slug
    }
  }
`;

export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategoriesForMenu {
    blogCategories {
      id
      name
      slug
    }
  }
`;

export const GET_MENUS_TREE = gql`
  query GetMenusTree($type: String) {
    menuTree(type: $type) {
      id
      title
      slug
      level
      order
    }
  }
`;
