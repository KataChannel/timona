import { gql } from '@apollo/client';
import { TASK_FRAGMENT } from './queries';

// ==================== MUTATIONS ====================

/**
 * Tạo task trong project
 */
export const CREATE_PROJECT_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CreateProjectTask($projectId: ID!, $input: CreateTaskInput!) {
    createProjectTask(projectId: $projectId, input: $input) {
      ...TaskFields
    }
  }
`;

/**
 * Update task
 */
export const UPDATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      ...TaskFields
    }
  }
`;

/**
 * Delete task
 */
export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

/**
 * Update task order (drag & drop)
 */
export const UPDATE_TASK_ORDER = gql`
  mutation UpdateTaskOrder($taskId: ID!, $newOrder: Int!) {
    updateTaskOrder(taskId: $taskId, newOrder: $newOrder) {
      id
      order
    }
  }
`;

/**
 * Assign task to users
 */
export const ASSIGN_TASK = gql`
  ${TASK_FRAGMENT}
  mutation AssignTask($taskId: ID!, $userIds: [ID!]!) {
    assignTask(taskId: $taskId, userIds: $userIds) {
      ...TaskFields
    }
  }
`;

/**
 * Update task status
 */
export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      status
      completedAt
    }
  }
`;
