import { gql } from '@apollo/client';

// ============================================================================
// PAGE BUILDER - CUSTOM TEMPLATES GRAPHQL
// ============================================================================

// Fragments
export const CUSTOM_TEMPLATE_FRAGMENT = gql`
  fragment CustomTemplateFields on CustomTemplate {
    id
    name
    description
    category
    thumbnail
    isPublic
    isArchived
    usageCount
    createdAt
    updatedAt
    userId
  }
`;

export const TEMPLATE_SHARE_FRAGMENT = gql`
  fragment TemplateShareFields on TemplateShare {
    id
    templateId
    sharedWith
    createdAt
  }
`;

// Queries
export const GET_MY_CUSTOM_TEMPLATES = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  query GetMyCustomTemplates($category: TemplateCategory, $archived: Boolean) {
    getMyCustomTemplates(category: $category, archived: $archived) {
      ...CustomTemplateFields
    }
  }
`;

export const GET_CUSTOM_TEMPLATE = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  query GetCustomTemplate($id: ID!) {
    getCustomTemplate(id: $id) {
      ...CustomTemplateFields
      blocks
    }
  }
`;

export const GET_PUBLIC_TEMPLATES = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  query GetPublicTemplates($category: TemplateCategory, $limit: Int, $offset: Int) {
    getPublicTemplates(category: $category, limit: $limit, offset: $offset) {
      templates {
        ...CustomTemplateFields
      }
      total
    }
  }
`;

export const GET_SHARED_TEMPLATES = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  query GetSharedTemplates {
    getSharedTemplates {
      ...CustomTemplateFields
    }
  }
`;

// Mutations
export const CREATE_CUSTOM_TEMPLATE = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  mutation CreateCustomTemplate($input: CreateCustomTemplateInput!) {
    createCustomTemplate(input: $input) {
      ...CustomTemplateFields
    }
  }
`;

export const UPDATE_CUSTOM_TEMPLATE = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  mutation UpdateCustomTemplate($id: ID!, $input: UpdateCustomTemplateInput!) {
    updateCustomTemplate(id: $id, input: $input) {
      ...CustomTemplateFields
    }
  }
`;

export const DELETE_CUSTOM_TEMPLATE = gql`
  mutation DeleteCustomTemplate($id: ID!) {
    deleteCustomTemplate(id: $id) {
      success
      message
    }
  }
`;

export const DUPLICATE_CUSTOM_TEMPLATE = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  mutation DuplicateCustomTemplate($id: ID!, $newName: String) {
    duplicateCustomTemplate(id: $id, newName: $newName) {
      ...CustomTemplateFields
    }
  }
`;

export const SHARE_TEMPLATE = gql`
  ${TEMPLATE_SHARE_FRAGMENT}
  mutation ShareTemplate($templateId: ID!, $userIds: [String!]!) {
    shareTemplate(templateId: $templateId, userIds: $userIds) {
      ...TemplateShareFields
    }
  }
`;

export const UNSHARE_TEMPLATE = gql`
  mutation UnshareTemplate($templateId: ID!, $userId: String!) {
    unshareTemplate(templateId: $templateId, userId: $userId) {
      success
      message
    }
  }
`;

export const UPDATE_TEMPLATE_PUBLICITY = gql`
  ${CUSTOM_TEMPLATE_FRAGMENT}
  mutation UpdateTemplatePublicity($id: ID!, $isPublic: Boolean!) {
    updateTemplatePublicity(id: $id, isPublic: $isPublic) {
      ...CustomTemplateFields
    }
  }
`;

export const INCREMENT_TEMPLATE_USAGE = gql`
  mutation IncrementTemplateUsage($id: ID!) {
    incrementTemplateUsage(id: $id) {
      success
      usageCount
    }
  }
`;
