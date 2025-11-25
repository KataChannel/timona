import { gql } from '@apollo/client';

// ==================== QUERIES ====================

export const GET_SYSTEM_GUIDES = gql`
  query GetSystemGuides(
    $type: GuideType
    $parentId: String
    $search: String
  ) {
    systemGuides(type: $type, parentId: $parentId, search: $search) {
      id
      title
      slug
      type
      description
      content
      icon
      order
      isPublished
      viewCount
      helpfulCount
      notHelpfulCount
      parentId
      parent {
        id
        title
        slug
      }
      children {
        id
        title
        slug
        type
        description
        icon
        order
        isPublished
      }
      author {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SYSTEM_GUIDE = gql`
  query GetSystemGuide($id: String!) {
    systemGuide(id: $id) {
      id
      title
      slug
      type
      description
      content
      icon
      order
      isPublished
      viewCount
      helpfulCount
      notHelpfulCount
      parentId
      parent {
        id
        title
        slug
      }
      children {
        id
        title
        slug
        type
        description
        icon
        order
        isPublished
      }
      author {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SYSTEM_GUIDE_BY_SLUG = gql`
  query GetSystemGuideBySlug($slug: String!) {
    systemGuideBySlug(slug: $slug) {
      id
      title
      slug
      type
      description
      content
      icon
      order
      isPublished
      viewCount
      helpfulCount
      notHelpfulCount
      parentId
      parent {
        id
        title
        slug
      }
      children {
        id
        title
        slug
        type
        description
        icon
        order
        isPublished
      }
      author {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

// ==================== MUTATIONS ====================

export const CREATE_SYSTEM_GUIDE = gql`
  mutation CreateSystemGuide($input: CreateSystemGuideInput!) {
    createSystemGuide(input: $input) {
      id
      title
      slug
      type
      isPublished
    }
  }
`;

export const UPDATE_SYSTEM_GUIDE = gql`
  mutation UpdateSystemGuide($input: UpdateSystemGuideInput!) {
    updateSystemGuide(input: $input) {
      id
      title
      slug
      type
      isPublished
    }
  }
`;

export const DELETE_SYSTEM_GUIDE = gql`
  mutation DeleteSystemGuide($id: String!) {
    deleteSystemGuide(id: $id)
  }
`;

export const INCREMENT_GUIDE_VIEW = gql`
  mutation IncrementGuideView($id: String!) {
    incrementGuideView(id: $id) {
      id
      viewCount
    }
  }
`;

export const VOTE_GUIDE_HELPFUL = gql`
  mutation VoteGuideHelpful($id: String!, $isHelpful: Boolean!) {
    voteGuideHelpful(id: $id, isHelpful: $isHelpful) {
      id
      helpfulCount
      notHelpfulCount
    }
  }
`;
