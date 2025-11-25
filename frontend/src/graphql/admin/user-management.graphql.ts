import { gql } from '@apollo/client';

/**
 * Admin Reset Password Mutation
 * Tạo mật khẩu ngẫu nhiên mới cho user
 */
export const ADMIN_RESET_PASSWORD = gql`
  mutation AdminResetPassword($input: AdminResetPasswordInput!) {
    adminResetPassword(input: $input) {
      success
      message
      newPassword
      user {
        id
        username
        email
        firstName
        lastName
      }
    }
  }
`;

/**
 * TypeScript Types
 */
export interface AdminResetPasswordInput {
  userId: string;
}

export interface AdminResetPasswordResponse {
  adminResetPassword: {
    success: boolean;
    message: string;
    newPassword: string;
    user: {
      id: string;
      username: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
    };
  };
}
