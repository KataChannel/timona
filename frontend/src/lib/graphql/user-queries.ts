import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '@/lib/graphql/shared-fragments';

// Re-export for backward compatibility
export { USER_FRAGMENT };

// User management queries
export const SEARCH_USERS = gql`
  query SearchUsers($input: UserSearchInput!) {
    searchUsers(input: $input) {
      users {
        ...UserFragment
      }
      total
      page
      size
      totalPages
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_STATS = gql`
  query GetUserStats {
    getUserStats {
      totalUsers
      activeUsers
      verifiedUsers
      newUsersThisMonth
      adminUsers
      regularUsers
      guestUsers
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getUsers {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

// User management mutations
export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($id: String!, $input: AdminUpdateUserInput!) {
    adminUpdateUser(id: $id, input: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const BULK_USER_ACTION = gql`
  mutation BulkUserAction($input: BulkUserActionInput!) {
    bulkUserAction(input: $input) {
      success
      affectedCount
      errors
      message
    }
  }
`;

export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser($input: AdminCreateUserInput!) {
    adminCreateUser(input: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

// Regular user mutations
export const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;