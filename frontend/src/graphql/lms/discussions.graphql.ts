import { gql } from '@apollo/client';

// Discussion Fragments
export const DISCUSSION_REPLY_FRAGMENT = gql`
  fragment DiscussionReplyData on DiscussionReply {
    id
    content
    parentId
    createdAt
    updatedAt
    user {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`;

export const DISCUSSION_FRAGMENT = gql`
  fragment DiscussionData on Discussion {
    id
    title
    content
    isPinned
    createdAt
    updatedAt
    user {
      id
      username
      firstName
      lastName
      avatar
    }
    lesson {
      id
      title
    }
  }
`;

// Queries
export const GET_COURSE_DISCUSSIONS = gql`
  query GetCourseDiscussions($courseId: ID!, $lessonId: ID) {
    courseDiscussions(courseId: $courseId, lessonId: $lessonId) {
      ...DiscussionData
      replies {
        ...DiscussionReplyData
      }
    }
  }
  ${DISCUSSION_FRAGMENT}
  ${DISCUSSION_REPLY_FRAGMENT}
`;

export const GET_DISCUSSION = gql`
  query GetDiscussion($id: ID!) {
    discussion(id: $id) {
      ...DiscussionData
      course {
        id
        title
        slug
      }
      replies {
        ...DiscussionReplyData
        children {
          ...DiscussionReplyData
        }
      }
    }
  }
  ${DISCUSSION_FRAGMENT}
  ${DISCUSSION_REPLY_FRAGMENT}
`;

// Mutations
export const CREATE_DISCUSSION = gql`
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) {
      ...DiscussionData
    }
  }
  ${DISCUSSION_FRAGMENT}
`;

export const CREATE_REPLY = gql`
  mutation CreateReply($input: CreateReplyInput!) {
    createReply(input: $input) {
      ...DiscussionReplyData
    }
  }
  ${DISCUSSION_REPLY_FRAGMENT}
`;

export const UPDATE_DISCUSSION = gql`
  mutation UpdateDiscussion($input: UpdateDiscussionInput!) {
    updateDiscussion(input: $input) {
      ...DiscussionData
    }
  }
  ${DISCUSSION_FRAGMENT}
`;

export const DELETE_DISCUSSION = gql`
  mutation DeleteDiscussion($id: ID!) {
    deleteDiscussion(id: $id)
  }
`;

export const TOGGLE_DISCUSSION_PIN = gql`
  mutation ToggleDiscussionPin($id: ID!) {
    toggleDiscussionPin(id: $id) {
      ...DiscussionData
    }
  }
  ${DISCUSSION_FRAGMENT}
`;
