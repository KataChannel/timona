import { gql } from '@apollo/client';
import { PROJECT_FRAGMENT, PROJECT_MEMBER_FRAGMENT } from './queries';

// ==================== MUTATIONS ====================

/**
 * Tạo project mới
 */
export const CREATE_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...ProjectFields
    }
  }
`;

/**
 * Update project
 */
export const UPDATE_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      ...ProjectFields
    }
  }
`;

/**
 * Delete/Archive project
 */
export const DELETE_PROJECT = gql`
  ${PROJECT_FRAGMENT}
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      ...ProjectFields
    }
  }
`;

/**
 * Thêm member vào project
 */
export const ADD_PROJECT_MEMBER = gql`
  ${PROJECT_MEMBER_FRAGMENT}
  mutation AddProjectMember($projectId: ID!, $input: AddMemberInput!) {
    addProjectMember(projectId: $projectId, input: $input) {
      ...ProjectMemberFields
    }
  }
`;

/**
 * Xóa member khỏi project
 */
export const REMOVE_PROJECT_MEMBER = gql`
  mutation RemoveProjectMember($projectId: ID!, $memberId: ID!) {
    removeProjectMember(projectId: $projectId, memberId: $memberId)
  }
`;

/**
 * Update role của member
 */
export const UPDATE_MEMBER_ROLE = gql`
  ${PROJECT_MEMBER_FRAGMENT}
  mutation UpdateProjectMemberRole($projectId: ID!, $input: UpdateMemberRoleInput!) {
    updateProjectMemberRole(projectId: $projectId, input: $input) {
      ...ProjectMemberFields
    }
  }
`;
