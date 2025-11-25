import { gql } from '@apollo/client';

export const GET_VAPID_PUBLIC_KEY = gql`
  query GetVapidPublicKey {
    getVapidPublicKey
  }
`;

export const SUBSCRIBE_TO_PUSH = gql`
  mutation SubscribeToPush($endpoint: String!, $p256dh: String!, $auth: String!) {
    subscribeToPush(endpoint: $endpoint, p256dh: $p256dh, auth: $auth)
  }
`;

export const UNSUBSCRIBE_FROM_PUSH = gql`
  mutation UnsubscribeFromPush($endpoint: String!) {
    unsubscribeFromPush(endpoint: $endpoint)
  }
`;

export const TEST_PUSH_NOTIFICATION = gql`
  mutation TestPushNotification {
    testPushNotification
  }
`;
