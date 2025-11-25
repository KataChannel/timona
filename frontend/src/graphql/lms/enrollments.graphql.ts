import { gql } from '@apollo/client';

// Enrollment Fragments
export const ENROLLMENT_FRAGMENT = gql`
  fragment EnrollmentData on Enrollment {
    id
    userId
    courseId
    status
    progress
    enrolledAt
    completedAt
    lastAccessedAt
  }
`;

// Queries
export const GET_MY_ENROLLMENTS = gql`
  query GetMyEnrollments {
    myEnrollments {
      ...EnrollmentData
      course {
        id
        title
        slug
        thumbnail
        level
        duration
        categoryId
        instructor {
          id
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
  ${ENROLLMENT_FRAGMENT}
`;

export const GET_ENROLLMENT = gql`
  query GetEnrollment($courseId: ID!) {
    enrollment(courseId: $courseId) {
      ...EnrollmentData
      course {
        id
        title
        slug
        modules {
          id
          title
          description
          order
          lessons {
            id
            title
            type
            duration
            order
            isFree
            videoUrl
            content
          }
        }
      }
      lessonProgress {
        id
        lessonId
        completed
        watchedDuration
        lastWatchedAt
        score
      }
    }
  }
  ${ENROLLMENT_FRAGMENT}
`;

export const GET_COURSE_ENROLLMENTS = gql`
  query GetCourseEnrollments($courseId: ID!) {
    courseEnrollments(courseId: $courseId) {
      ...EnrollmentData
      user {
        id
        username
        email
        firstName
        lastName
        avatar
      }
    }
  }
  ${ENROLLMENT_FRAGMENT}
`;

// Mutations
export const ENROLL_COURSE = gql`
  mutation EnrollCourse($input: EnrollCourseInput!) {
    enrollCourse(enrollCourseInput: $input) {
      ...EnrollmentData
      course {
        id
        title
        slug
      }
    }
  }
  ${ENROLLMENT_FRAGMENT}
`;

export const DROP_COURSE = gql`
  mutation DropCourse($courseId: ID!) {
    dropCourse(courseId: $courseId) {
      ...EnrollmentData
    }
  }
  ${ENROLLMENT_FRAGMENT}
`;
