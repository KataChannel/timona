import { gql } from '@apollo/client';

// =====================================================
// FRAGMENTS
// =====================================================

export const MENU_FRAGMENT = gql`
  fragment MenuFields on MenuResponseDto {
    id
    title
    slug
    description
    type
    parentId
    order
    level
    path
    url
    route
    externalUrl
    target
    icon
    iconType
    badge
    badgeColor
    image
    requiredPermissions
    requiredRoles
    isPublic
    isActive
    isVisible
    isProtected
    createdAt
    updatedAt
    createdBy
    updatedBy
  }
`;

// MenuResponseDto doesn't have children/parent fields
// Use parentId to build tree structure on frontend

// =====================================================
// QUERIES
// =====================================================

export const GET_MENU = gql`
  ${MENU_FRAGMENT}
  query GetMenu($id: ID!) {
    menu(id: $id) {
      ...MenuFields
    }
  }
`;

export const GET_MENU_BY_SLUG = gql`
  ${MENU_FRAGMENT}
  query GetMenuBySlug($slug: String!) {
    menuBySlug(slug: $slug) {
      ...MenuFields
    }
  }
`;

export const GET_MENUS = gql`
  ${MENU_FRAGMENT}
  query GetMenus(
    $filter: MenuFilterInput
    $orderBy: MenuOrderInput
    $page: Int
    $pageSize: Int
  ) {
    menus(filter: $filter, orderBy: $orderBy, page: $page, pageSize: $pageSize) {
      items {
        ...MenuFields
        parent {
          id
          title
          slug
        }
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`;

export const GET_MENU_TREE = gql`
  ${MENU_FRAGMENT}
  query GetMenuTree($type: String, $parentId: String) {
    menuTree(type: $type, parentId: $parentId) {
      ...MenuFields
    }
  }
`;

export const GET_SIDEBAR_MENUS = gql`
  ${MENU_FRAGMENT}
  query GetSidebarMenus {
    sidebarMenus {
      ...MenuFields
    }
  }
`;

export const GET_MY_MENUS = gql`
  ${MENU_FRAGMENT}
  query GetMyMenus($type: String) {
    myMenus(type: $type) {
      ...MenuFields
    }
  }
`;

// =====================================================
// MUTATIONS
// =====================================================

export const CREATE_MENU = gql`
  ${MENU_FRAGMENT}
  mutation CreateMenu($input: CreateMenuInput!) {
    createMenu(input: $input) {
      ...MenuFields
    }
  }
`;

export const UPDATE_MENU = gql`
  ${MENU_FRAGMENT}
  mutation UpdateMenu($id: ID!, $input: UpdateMenuInput!) {
    updateMenu(id: $id, input: $input) {
      ...MenuFields
    }
  }
`;

export const DELETE_MENU = gql`
  mutation DeleteMenu($id: ID!) {
    deleteMenu(id: $id)
  }
`;

export const DELETE_MANY_MENUS = gql`
  mutation DeleteManyMenus($ids: [ID!]!) {
    deleteManyMenus(ids: $ids)
  }
`;

export const TOGGLE_MENU_ACTIVE = gql`
  ${MENU_FRAGMENT}
  mutation ToggleMenuActive($id: ID!) {
    toggleMenuActive(id: $id) {
      ...MenuFields
    }
  }
`;

export const TOGGLE_MENU_VISIBILITY = gql`
  ${MENU_FRAGMENT}
  mutation ToggleMenuVisibility($id: ID!) {
    toggleMenuVisibility(id: $id) {
      ...MenuFields
    }
  }
`;

export const UPDATE_MENU_ORDER = gql`
  ${MENU_FRAGMENT}
  mutation UpdateMenuOrder($id: ID!, $order: Int!) {
    updateMenuOrder(id: $id, order: $order) {
      ...MenuFields
    }
  }
`;

export const REORDER_MENUS = gql`
  ${MENU_FRAGMENT}
  mutation ReorderMenus($ids: [ID!]!) {
    reorderMenus(ids: $ids) {
      ...MenuFields
    }
  }
`;

export const MOVE_MENU = gql`
  ${MENU_FRAGMENT}
  mutation MoveMenu($id: ID!, $newParentId: String, $newOrder: Int) {
    moveMenu(id: $id, newParentId: $newParentId, newOrder: $newOrder) {
      ...MenuFields
    }
  }
`;

export const BULK_UPDATE_MENUS = gql`
  ${MENU_FRAGMENT}
  mutation BulkUpdateMenus($ids: [ID!]!, $input: UpdateMenuInput!) {
    bulkUpdateMenus(ids: $ids, input: $input) {
      ...MenuFields
    }
  }
`;

export const BULK_TOGGLE_ACTIVE = gql`
  ${MENU_FRAGMENT}
  mutation BulkToggleActive($ids: [ID!]!, $isActive: Boolean!) {
    bulkToggleActive(ids: $ids, isActive: $isActive) {
      ...MenuFields
    }
  }
`;

export const BULK_TOGGLE_VISIBILITY = gql`
  ${MENU_FRAGMENT}
  mutation BulkToggleVisibility($ids: [ID!]!, $isVisible: Boolean!) {
    bulkToggleVisibility(ids: $ids, isVisible: $isVisible) {
      ...MenuFields
    }
  }
`;
