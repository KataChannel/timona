import { gql } from '@apollo/client';

export const GET_COURSE_CATEGORIES = gql`
  query GetCourseCategories {
    courseCategories {
      id
      name
      slug
      description
      icon
    }
  }
`;
