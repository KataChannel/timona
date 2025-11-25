import { gql } from '@apollo/client';

/**
 * Centralized GraphQL fragments to avoid duplication warnings
 * graphql-tag enforces unique fragment names across the application
 */

// ============================================================================
// Category Fragments
// ============================================================================

export const CATEGORY_BASIC_FRAGMENT = gql`
  fragment CategoryBasicFields on CategoryType {
    id
    name
    slug
    description
    image
    displayOrder
    isActive
    createdAt
  }
`;

export const CATEGORY_WITH_COUNT_FRAGMENT = gql`
  ${CATEGORY_BASIC_FRAGMENT}
  fragment CategoryWithCountFields on CategoryType {
    ...CategoryBasicFields
    productCount
  }
`;

export const CATEGORY_TREE_FRAGMENT = gql`
  ${CATEGORY_WITH_COUNT_FRAGMENT}
  fragment CategoryTreeFields on CategoryType {
    ...CategoryWithCountFields
    parent {
      id
      name
      slug
    }
    children {
      ...CategoryWithCountFields
    }
  }
`;

// ============================================================================
// Product Fragments
// ============================================================================

export const PRODUCT_IMAGE_FRAGMENT = gql`
  fragment ProductImageFields on ProductImageType {
    id
    url
    alt
    isPrimary
    order
    createdAt
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = gql`
  fragment ProductVariantFields on ProductVariantType {
    id
    name
    sku
    price
    stock
    order
    isActive
    attributes
    createdAt
  }
`;

export const PRODUCT_BASIC_FRAGMENT = gql`
  fragment ProductBasicFields on ProductType {
    id
    name
    slug
    description
    shortDesc
    price
    compareAtPrice
    status
    isActive
    sku
    createdAt
  }
`;

// ============================================================================
// User Fragments
// ============================================================================

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    username
    firstName
    lastName
    phone
    avatar
    roleType
    isActive
    isVerified
    isTwoFactorEnabled
    failedLoginAttempts
    lockedUntil
    lastLoginAt
    createdAt
    updatedAt
  }
`;

// ============================================================================
// Common Model Fragments (used in dynamic queries)
// ============================================================================

export const POST_FRAGMENT = gql`
  fragment PostFragment on Post {
    id
    title
    slug
    content
    excerpt
    featured_image
    author {
      id
      username
    }
    category {
      id
      name
    }
    published_at
    created_at
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    content
    author {
      id
      username
    }
    post {
      id
      title
    }
    created_at
  }
`;
