import { gql } from '@apollo/client';

// Auth Fragments
export const AUTH_RESPONSE_FRAGMENT = gql`
  fragment AuthResponseFragment on AuthResponse {
    accessToken
    refreshToken
    redirectUrl
    user {
      id
      email
      username
      firstName
      lastName
      avatar
      role
      isActive
      isVerified
      createdAt
    }
  }
`;

export const OTP_RESPONSE_FRAGMENT = gql`
  fragment OtpResponseFragment on OtpResponse {
    success
    message
  }
`;

// Auth Mutations
export const LOGIN_USER = gql`
  ${AUTH_RESPONSE_FRAGMENT}
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      ...AuthResponseFragment
    }
  }
`;

export const LOGIN_WITH_GOOGLE = gql`
  ${AUTH_RESPONSE_FRAGMENT}
  mutation LoginWithGoogle($input: SocialLoginInput!) {
    loginWithGoogle(input: $input) {
      ...AuthResponseFragment
    }
  }
`;

export const LOGIN_WITH_FACEBOOK = gql`
  ${AUTH_RESPONSE_FRAGMENT}
  mutation LoginWithFacebook($input: SocialLoginInput!) {
    loginWithFacebook(input: $input) {
      ...AuthResponseFragment
    }
  }
`;

export const LOGIN_WITH_PHONE = gql`
  ${AUTH_RESPONSE_FRAGMENT}
  mutation LoginWithPhone($input: PhoneLoginInput!) {
    loginWithPhone(input: $input) {
      ...AuthResponseFragment
    }
  }
`;

export const REQUEST_PHONE_VERIFICATION = gql`
  ${OTP_RESPONSE_FRAGMENT}
  mutation RequestPhoneVerification($input: RequestPhoneVerificationInput!) {
    requestPhoneVerification(input: $input) {
      ...OtpResponseFragment
    }
  }
`;

export const REGISTER_USER = gql`
  ${AUTH_RESPONSE_FRAGMENT}
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      ...AuthResponseFragment
    }
  }
`;

/**
 * Mutations cho quản lý password (Admin)
 */
export const ADMIN_RESET_PASSWORD = gql`
  mutation AdminResetPassword($input: AdminResetPasswordInput!) {
    adminResetPassword(input: $input) {
      success
      message
      newPassword
      user {
        id
        email
        username
        firstName
        lastName
        avatar
        roleType
        isActive
        isVerified
        createdAt
      }
    }
  }
`;

/**
 * Mutations cho Profile Management
 */
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      username
      firstName
      lastName
      avatar
      phone
      roleType
      isActive
      isVerified
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const SET_PASSWORD = gql`
  mutation SetPassword($input: SetPasswordInput!) {
    setPassword(input: $input)
  }
`;

/**
 * Queries cho Profile Management
 */
export const HAS_PASSWORD = gql`
  query HasPassword {
    hasPassword
  }
`;

export const GET_ME = gql`
  query GetMe {
    getMe {
      id
      email
      username
      firstName
      lastName
      avatar
      phone
      roleType
      isActive
      isVerified
      createdAt
      updatedAt
    }
  }
`;
