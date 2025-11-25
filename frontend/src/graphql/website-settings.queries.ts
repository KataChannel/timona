/**
 * ============================================================================
 * PUBLIC WEBSITE SETTINGS GRAPHQL QUERIES
 * ============================================================================
 * 
 * Public website settings queries for frontend (no authentication required)
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import { gql } from '@apollo/client';

/**
 * Get Public Website Settings
 * No authentication required
 */
export const GET_PUBLIC_WEBSITE_SETTINGS = gql`
  query GetPublicWebsiteSettings(
    $category: String
    $group: String
    $keys: [String!]
  ) {
    publicWebsiteSettings(
      category: $category
      group: $group
      keys: $keys
    ) {
      id
      key
      label
      value
      description
      type
      category
      group
      order
      options
      validation
      isActive
      isPublic
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get Header Settings
 * No authentication required
 */
export const GET_HEADER_SETTINGS = gql`
  query GetHeaderSettings {
    headerSettings {
      id
      key
      label
      value
      description
      type
      category
      group
      order
      options
      validation
      isActive
      isPublic
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get Footer Settings
 * No authentication required
 */
export const GET_FOOTER_SETTINGS = gql`
  query GetFooterSettings {
    footerSettings {
      id
      key
      label
      value
      description
      type
      category
      group
      order
      options
      validation
      isActive
      isPublic
      createdAt
      updatedAt
    }
  }
`;
