import { gql } from '@apollo/client';

// Auth Queries and Mutations
export const LOGIN_MUTATION = gql`
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      user {
        id
        email
        username
        role
        avatar
        createdAt
      }
      accessToken
      redirectUrl
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      user {
        id
        email
        username
        role
        avatar
        createdAt
      }
      accessToken
      redirectUrl
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getMe {
      id
      email
      username
      roleType
      avatar
      firstName
      lastName
      phone
      address
      city
      district
      ward
      createdAt
      updatedAt
      roles {
        id
        name
        displayName
        permissions {
          id
          effect
          permission {
            id
            name
            displayName
            resource
            action
          }
        }
      }
      permissions {
        id
        name
        displayName
        resource
        action
      }
    }
  }
`;

// Post Queries and Mutations
export const GET_POSTS = gql`
  query GetPosts($filters: PostFiltersInput, $pagination: PaginationInput!) {
    getPosts(filters: $filters, pagination: $pagination) {
      items {
        id
        title
        excerpt
        slug
        status
        publishedAt
        createdAt
        updatedAt
        author {
          id
          username
          avatar
        }
        commentsCount
      }
      meta {
        total
        page
        totalPages
        hasNextPage
        hasPrevPage
        limit
      }
    }
  }
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    getPostBySlug(slug: $slug) {
      id
      title
      content
      excerpt
      slug
      status
      publishedAt
      createdAt
      updatedAt
      author {
        id
        username
        avatar
      }
      commentsCount
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      excerpt
      slug
      status
      publishedAt
      createdAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: String!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      excerpt
      slug
      status
      publishedAt
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id) {
      id
      title
    }
  }
`;

// Comment Queries and Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        username
        avatar
      }
      post {
        id
        title
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

// File Upload Mutation
export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $bucket: String!) {
    uploadFile(file: $file, bucket: $bucket) {
      id
      url
      filename
      mimetype
      size
      bucket
    }
  }
`;

// AI/Grok Queries
export const GENERATE_SUMMARY = gql`
  query GenerateSummary($content: String!) {
    generateSummary(content: $content) {
      summary
      keywords
      sentiment
      readingTime
    }
  }
`;

export const GENERATE_POST_SUGGESTIONS = gql`
  query GeneratePostSuggestions($topic: String!) {
    generatePostSuggestions(topic: $topic) {
      title
      excerpt
      tags
    }
  }
`;

// Subscriptions
export const NEW_POST_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      id
      title
      excerpt
      slug
      publishedAt
      author {
        id
        username
        avatar
      }
    }
  }
`;

export const NEW_COMMENT_SUBSCRIPTION = gql`
  subscription NewComment($postId: String!) {
    newComment(postId: $postId) {
      id
      content
      createdAt
      author {
        id
        username
        avatar
      }
      post {
        id
      }
    }
  }
`;

// Health and Meta Queries
export const HEALTH_CHECK = gql`
  query HealthCheck {
    health {
      status
      info {
        database {
          status
        }
        redis {
          status
        }
        minio {
          status
        }
      }
    }
  }
`;

// Search Query
export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!, $limit: Int, $offset: Int) {
    searchPosts(query: $query, limit: $limit, offset: $offset) {
      id
      title
      excerpt
      slug
      publishedAt
      author {
        id
        username
        avatar
      }
      _count {
        comments
      }
    }
  }
`;

// User Management
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      id
      username
      email
      bio
      avatar
      updatedAt
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: String!, $limit: Int, $offset: Int) {
    userPosts(userId: $userId, limit: $limit, offset: $offset) {
      id
      title
      excerpt
      slug
      status
      publishedAt
      createdAt
      _count {
        comments
      }
    }
  }
`;
