'use client';

import { gql } from '@apollo/client';

// Note: Task comments and media are fetched through the main getTask query
// Individual queries for comments and media are available through the task relationships

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment($input: CreateTaskCommentInput!) {
    createTaskComment(input: $input) {
      id
      content
      taskId
      userId
      parentId
      user {
        id
        username
        firstName
        lastName
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK_COMMENT = gql`
  mutation UpdateTaskComment($id: String!, $input: UpdateTaskCommentInput!) {
    updateTaskComment(id: $id, input: $input) {
      id
      content
      taskId
      userId
      parentId
      user {
        id
        username
        firstName
        lastName
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TASK_COMMENT = gql`
  mutation DeleteTaskComment($id: String!) {
    deleteTaskComment(id: $id)
  }
`;

export const UPLOAD_TASK_MEDIA = gql`
  mutation UploadTaskMedia($input: UploadTaskMediaInput!) {
    uploadTaskMedia(input: $input) {
      id
      filename
      url
      type
      size
      mimeType
      caption
      taskId
      uploadedBy
      uploader {
        id
        username
        firstName
        lastName
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TASK_MEDIA = gql`
  mutation DeleteTaskMedia($mediaId: String!) {
    deleteTaskMedia(mediaId: $mediaId)
  }
`;

// Note: Task media mutations are not currently available in the backend
// Media files are handled through the task relationships

// Combined query for task with comments and media
export const GET_TASK_WITH_DETAILS = gql`
  query ($id: String!) {
    getTask(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      category
      userId
      author {
        id
        username
        firstName
        lastName
        avatar
      }
      comments {
        id
        content
        taskId
        userId
        parentId
        user {
          id
          username
          firstName
          lastName
          avatar
        }
        replies {
          id
          content
          taskId
          userId
          parentId
          user {
            id
            username
            firstName
            lastName
            avatar
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      media {
        id
        filename
        url
        size
        mimeType
        taskId
        uploadedBy
        uploader {
          id
          username
          firstName
          lastName
          avatar
        }
        createdAt
      }
      shares {
        id
        taskId
        permission
        sharedBy
        sharedWith
        sharedByUser {
          id
          username
          firstName
          lastName
          avatar
        }
        sharedWithUser {
          id
          username
          firstName
          lastName
          avatar
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;
