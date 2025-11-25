import { gql } from '@apollo/client';

export const GET_QUIZ = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      title
      description
      passingScore
      timeLimit
      questions {
        id
        type
        question
        points
        order
        explanation
        answers {
          id
          text
          order
        }
      }
    }
  }
`;

export const GET_QUIZZES_BY_LESSON = gql`
  query GetQuizzesByLesson($lessonId: ID!) {
    quizzesByLesson(lessonId: $lessonId) {
      id
      title
      description
      passingScore
      timeLimit
    }
  }
`;

export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($input: SubmitQuizInput!) {
    submitQuiz(input: $input) {
      id
      score
      passed
      timeSpent
      completedAt
      quiz {
        id
        title
        passingScore
        questions {
          id
          question
          type
          points
          explanation
          answers {
            id
            text
            isCorrect
          }
        }
      }
    }
  }
`;

export const GET_QUIZ_ATTEMPTS = gql`
  query GetQuizAttempts($quizId: ID!) {
    quizAttempts(quizId: $quizId) {
      id
      score
      passed
      timeSpent
      startedAt
      completedAt
    }
  }
`;

export const GET_QUIZ_ATTEMPT = gql`
  query GetQuizAttempt($id: ID!) {
    quizAttempt(id: $id) {
      id
      score
      passed
      answers
      timeSpent
      startedAt
      completedAt
      quiz {
        id
        title
        description
        passingScore
        questions {
          id
          question
          type
          points
          order
          explanation
          answers {
            id
            text
            isCorrect
            order
          }
        }
      }
    }
  }
`;
