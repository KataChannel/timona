import { gql } from '@apollo/client';

/**
 * GraphQL Mutations for Password Reset Flow
 */

// Step 1: Request forgot password - Send OTP to email
export const REQUEST_FORGOT_PASSWORD = gql`
  mutation RequestForgotPassword($email: String!) {
    requestForgotPassword(email: $email) {
      success
      message
      token
    }
  }
`;

// Step 2: Verify OTP token
export const VERIFY_RESET_TOKEN = gql`
  mutation VerifyResetToken($email: String!, $token: String!) {
    verifyResetToken(email: $email, token: $token) {
      success
      message
    }
  }
`;

// Step 3: Reset password with verified token
export const RESET_PASSWORD_WITH_TOKEN = gql`
  mutation ResetPasswordWithToken(
    $email: String!
    $token: String!
    $newPassword: String!
  ) {
    resetPasswordWithToken(
      email: $email
      token: $token
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

/**
 * Types
 */
export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string; // Only in development mode
}

export interface RequestForgotPasswordResponse {
  requestForgotPassword: OtpResponse;
}

export interface VerifyResetTokenResponse {
  verifyResetToken: OtpResponse;
}

export interface ResetPasswordWithTokenResponse {
  resetPasswordWithToken: OtpResponse;
}
