import { gql } from '@apollo/client';

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      courseId
      userId
      rating
      comment
      helpfulCount
      helpfulVoters
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
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($input: UpdateReviewInput!) {
    updateReview(input: $input) {
      id
      rating
      comment
      updatedAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

export const MARK_REVIEW_HELPFUL = gql`
  mutation MarkReviewHelpful($reviewId: ID!) {
    markReviewHelpful(reviewId: $reviewId) {
      id
      helpfulCount
      helpfulVoters
    }
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews($input: GetReviewsInput!) {
    reviews(input: $input) {
      reviews {
        id
        courseId
        userId
        rating
        comment
        helpfulCount
        helpfulVoters
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
      stats {
        avgRating
        totalReviews
        fiveStars
        fourStars
        threeStars
        twoStars
        oneStar
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_REVIEW_STATS = gql`
  query GetReviewStats($courseId: ID!) {
    reviewStats(courseId: $courseId) {
      avgRating
      totalReviews
      fiveStars
      fourStars
      threeStars
      twoStars
      oneStar
    }
  }
`;

export const GET_USER_REVIEW = gql`
  query GetUserReview($courseId: ID!) {
    userReview(courseId: $courseId) {
      id
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;
