import { gql } from '@apollo/client';

// Todo Fragments
export const TASK_FRAGMENT = gql`
  fragment TaskFragment on Task {
    id
    title
    description
    category
    priority
    status
    dueDate
    createdAt
    updatedAt
    userId
    author {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

export const TASK_MEDIA_FRAGMENT = gql`
  fragment TaskMediaFragment on TaskMedia {
    id
    filename
    url
    type
    size
    mimeType
    caption
    createdAt
    updatedAt
    taskId
    uploadedBy
    uploader {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

export const TASK_SHARE_FRAGMENT = gql`
  fragment TaskShareFragment on TaskShare {
    id
    permission
    shareToken
    expiresAt
    isActive
    createdAt
    updatedAt
    taskId
    sharedBy
    sharedByUser {
      id
      username
      firstName
      lastName
      avatar
    }
    sharedWith
    sharedWithUser {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

export const TASK_COMMENT_FRAGMENT = gql`
  fragment TaskCommentFragment on TaskComment {
    id
    content
    createdAt
    updatedAt
    taskId
    userId
    user {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    id
    type
    title
    message
    isRead
    createdAt
    userId
    user {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

// Todo Queries
export const GET_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetTasks($filters: TaskFilterInput) {
    getTasks(filters: $filters) {
      ...TaskFragment
    }
  }
`;

export const GET_TASK_BY_ID = gql`
  ${TASK_FRAGMENT}
  ${TASK_MEDIA_FRAGMENT}
  ${TASK_SHARE_FRAGMENT}
  ${TASK_COMMENT_FRAGMENT}
  query GetTaskById($id: ID!) {
    getTaskById(id: $id) {
      ...TaskFragment
      media {
        ...TaskMediaFragment
      }
      shares {
        ...TaskShareFragment
      }
      comments {
        ...TaskCommentFragment
      }
    }
  }
`;

export const GET_SHARED_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetSharedTasks($filters: TaskFilterInput) {
    getSharedTasks(filters: $filters) {
      ...TaskFragment
    }
  }
`;

// Todo Mutations
export const CREATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFragment
    }
  }
`;

export const UPDATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      ...TaskFragment
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const SHARE_TASK = gql`
  ${TASK_SHARE_FRAGMENT}
  mutation ShareTask($input: ShareTaskInput!) {
    shareTask(input: $input) {
      ...TaskShareFragment
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  ${TASK_COMMENT_FRAGMENT}
  mutation CreateTaskComment($input: CreateTaskCommentInput!) {
    createTaskComment(input: $input) {
      ...TaskCommentFragment
    }
  }
`;

// Todo Subscriptions
export const TASK_CREATED_SUBSCRIPTION = gql`
  ${TASK_FRAGMENT}
  subscription TaskCreated {
    taskCreated {
      ...TaskFragment
    }
  }
`;

export const TASK_UPDATED_SUBSCRIPTION = gql`
  ${TASK_FRAGMENT}
  subscription TaskUpdated {
    taskUpdated {
      ...TaskFragment
    }
  }
`;

export const TASK_COMMENT_CREATED_SUBSCRIPTION = gql`
  ${TASK_COMMENT_FRAGMENT}
  subscription TaskCommentCreated {
    taskCommentCreated {
      ...TaskCommentFragment
    }
  }
`;
