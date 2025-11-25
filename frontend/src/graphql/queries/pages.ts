import { gql } from '@apollo/client';

// Fragment for page fields
const PAGE_FRAGMENT = gql`
  fragment PageFields on Page {
    id
    title
    slug
    content
    status
    isHomepage
    isDynamic
    dynamicConfig
    seoTitle
    seoDescription
    seoKeywords
    createdAt
    updatedAt
  }
`;

// Fragment for page block fields (with nested children support)
const PAGE_BLOCK_FRAGMENT = gql`
  fragment PageBlockFields on PageBlock {
    id
    type
    content
    style
    config
    order
    parentId
    depth
    isVisible
    children {
      id
      type
      content
      style
      config
      order
      parentId
      depth
      isVisible
      children {
        id
        type
        content
        style
        config
        order
        parentId
        depth
        isVisible
        children {
          id
          type
          content
          style
          config
          order
          parentId
          depth
          isVisible
        }
      }
    }
  }
`;

// Get paginated list of pages
export const GET_PAGES = gql`
  ${PAGE_FRAGMENT}
  query GetPages($pagination: PaginationInput, $filters: PageFiltersInput) {
    getPages(pagination: $pagination, filters: $filters) {
      items {
        ...PageFields
        blocks {
          id
          type
          order
        }
      }
      pagination {
        currentPage
        totalPages
        totalItems
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Get a single page by ID with all blocks
export const GET_PAGE_BY_ID = gql`
  ${PAGE_FRAGMENT}
  ${PAGE_BLOCK_FRAGMENT}
  query GetPageById($id: String!) {
    getPageById(id: $id) {
      ...PageFields
      blocks {
        ...PageBlockFields
      }
    }
  }
`;

// Get a single page by slug with all blocks (for public pages)
export const GET_PAGE_BY_SLUG = gql`
  ${PAGE_FRAGMENT}
  ${PAGE_BLOCK_FRAGMENT}
  query GetPageBySlug($slug: String!) {
    getPageBySlug(slug: $slug) {
      ...PageFields
      blocks {
        ...PageBlockFields
      }
    }
  }
`;

// Get homepage
export const GET_HOMEPAGE = gql`
  ${PAGE_FRAGMENT}
  ${PAGE_BLOCK_FRAGMENT}
  query GetHomepage {
    getHomepage {
      ...PageFields
      isHomepage
      blocks {
        ...PageBlockFields
      }
    }
  }
`;

// Create a new page
export const CREATE_PAGE = gql`
  ${PAGE_FRAGMENT}
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      ...PageFields
    }
  }
`;

// Update an existing page
export const UPDATE_PAGE = gql`
  ${PAGE_FRAGMENT}
  mutation UpdatePage($id: String!, $input: UpdatePageInput!) {
    updatePage(id: $id, input: $input) {
      ...PageFields
    }
  }
`;

// Delete a page
export const DELETE_PAGE = gql`
  ${PAGE_FRAGMENT}
  mutation DeletePage($id: String!) {
    deletePage(id: $id) {
      ...PageFields
    }
  }
`;

// Add a block to a page
export const ADD_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation AddPageBlock($pageId: String!, $input: CreatePageBlockInput!) {
    addPageBlock(pageId: $pageId, input: $input) {
      ...PageBlockFields
    }
  }
`;

// Update a page block
export const UPDATE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation UpdatePageBlock($id: String!, $input: UpdatePageBlockInput!) {
    updatePageBlock(id: $id, input: $input) {
      ...PageBlockFields
    }
  }
`;

// Delete a page block
export const DELETE_PAGE_BLOCK = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation DeletePageBlock($id: String!) {
    deletePageBlock(id: $id) {
      ...PageBlockFields
    }
  }
`;

// Update the order of multiple page blocks
export const UPDATE_PAGE_BLOCKS_ORDER = gql`
  ${PAGE_BLOCK_FRAGMENT}
  mutation UpdatePageBlocksOrder($pageId: String!, $updates: [BulkUpdateBlockOrderInput!]!) {
    updatePageBlocksOrder(pageId: $pageId, updates: $updates) {
      ...PageBlockFields
    }
  }
`;