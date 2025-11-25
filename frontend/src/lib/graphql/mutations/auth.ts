import { gql } from '@apollo/client';

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($input: SocialLoginInput!) {
    loginWithGoogle(input: $input) {
      token
      user {
        id
        email
        name
        avatar
        gid
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN_WITH_FACEBOOK = gql`
  mutation LoginWithFacebook($input: SocialLoginInput!) {
    loginWithFacebook(input: $input) {
      token
      user {
        id
        email
        name
        avatar
        fid
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        avatar
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        avatar
        createdAt
        updatedAt
      }
    }
  }
`;
