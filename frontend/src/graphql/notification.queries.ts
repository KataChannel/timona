import { gql } from '@apollo/client';

// ==================== NOTIFICATION QUERIES ====================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($isRead: Boolean, $type: String, $skip: Int, $take: Int) {
    getNotifications(isRead: $isRead, type: $type, skip: $skip, take: $take) {
      notifications {
        id
        userId
        title
        message
        type
        isRead
        data
        taskId
        mentionedBy
        createdAt
        updatedAt
        mentioner {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      total
      unreadCount
      hasMore
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    getUnreadNotificationsCount
  }
`;

// ==================== NOTIFICATION MUTATIONS ====================

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
    markNotificationAsRead(input: $input) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($input: DeleteNotificationInput!) {
    deleteNotification(input: $input)
  }
`;

export const DELETE_ALL_READ_NOTIFICATIONS = gql`
  mutation DeleteAllReadNotifications {
    deleteAllReadNotifications
  }
`;
