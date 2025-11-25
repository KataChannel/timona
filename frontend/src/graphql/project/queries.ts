import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const PROJECT_FRAGMENT = gql`
  fragment ProjectFields on Project {
    id
    name
    description
    avatar
    isArchived
    ownerId
    createdAt
    updatedAt
    owner {
      id
      firstName
      lastName
      avatar
      email
    }
    members {
      id
      userId
      role
      joinedAt
      user {
        id
        firstName
        lastName
        avatar
        email
      }
    }
    _count {
      tasks
      chatMessages
    }
  }
`;

export const PROJECT_MEMBER_FRAGMENT = gql`
  fragment ProjectMemberFields on ProjectMember {
    id
    userId
    projectId
    role
    joinedAt
    user {
      id
      firstName
      lastName
      avatar
      email
    }
  }
`;

// ==================== QUERIES ====================

/**
 * Lấy danh sách projects (Sidebar)
 */
export const GET_MY_PROJECTS = gql`
  ${PROJECT_FRAGMENT}
  query GetMyProjects($includeArchived: Boolean = false) {
    myProjects(includeArchived: $includeArchived) {
      ...ProjectFields
    }
  }
`;

/**
 * Lấy chi tiết 1 project
 */
export const GET_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  query GetProject($id: ID!) {
    project(id: $id) {
      ...ProjectFields
    }
  }
`;

/**
 * Lấy members cho @mention autocomplete
 */
export const GET_PROJECT_MEMBERS = gql`
  ${PROJECT_MEMBER_FRAGMENT}
  query GetProjectMembers($projectId: ID!) {
    projectMembers(projectId: $projectId) {
      ...ProjectMemberFields
    }
  }
`;
