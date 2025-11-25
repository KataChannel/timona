import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const TASK_FRAGMENT = gql`
  fragment TaskFields on Task {
    id
    title
    description
    category
    priority
    status
    dueDate
    completedAt
    createdAt
    updatedAt
    userId
    projectId
    assignedTo
    mentions
    order
    tags
    user {
      id
      firstName
      lastName
      avatar
      email
    }
  }
`;

export const TASK_WITH_COMMENTS_FRAGMENT = gql`
  ${TASK_FRAGMENT}
  fragment TaskWithComments on Task {
    ...TaskFields
    comments {
      id
      content
      createdAt
      user {
        id
        firstName
        lastName
        avatar
      }
    }
    _count {
      comments
      subtasks
    }
  }
`;

// ==================== QUERIES ====================

/**
 * Lấy tasks của project (TaskFeed)
 */
export const GET_PROJECT_TASKS = gql`
  ${TASK_WITH_COMMENTS_FRAGMENT}
  query GetProjectTasks($projectId: ID!, $filters: TaskFilterInput) {
    projectTasks(projectId: $projectId, filters: $filters) {
      ...TaskWithComments
    }
  }
`;

/**
 * Lấy chi tiết task
 */
export const GET_TASK = gql`
  ${TASK_WITH_COMMENTS_FRAGMENT}
  query GetTask($id: ID!) {
    task(id: $id) {
      ...TaskWithComments
      subtasks {
        id
        title
        status
        priority
      }
    }
  }
`;

/**
 * Lấy personal tasks (không có projectId)
 */
export const GET_MY_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetMyTasks($filters: TaskFilterInput) {
    myTasks(filters: $filters) {
      ...TaskFields
    }
  }
`;
