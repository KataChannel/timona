import { gql } from '@apollo/client';

// ==================== MUTATIONS ====================

export const ANALYZE_DOCUMENTS_FOR_COURSE = gql`
  query AnalyzeDocumentsForCourse($input: AnalyzeDocumentsForCourseInput!) {
    analyzeDocumentsForCourse(input: $input) {
      suggestedTitle
      suggestedDescription
      recommendedLevel
      aggregatedKeywords
      mainTopics
      learningObjectives
      whatYouWillLearn
      requirements
      targetAudience
      suggestedStructure
      estimatedDuration
      sourceDocumentIds
      analysisSummary
    }
  }
`;

export const GENERATE_COURSE_FROM_DOCUMENTS = gql`
  mutation GenerateCourseFromDocuments($input: GenerateCourseFromDocumentsInput!) {
    generateCourseFromDocuments(input: $input) {
      id
      title
      slug
      description
      status
      modules {
        id
        title
        lessons {
          id
          title
          quizzes {
            id
            title
          }
        }
      }
    }
  }
`;

// Course Fragments
export const COURSE_BASIC_FRAGMENT = gql`
  fragment CourseBasic on Course {
    id
    title
    slug
    description
    thumbnail
    price
    level
    status
    duration
    avgRating
    enrollmentCount
    reviewCount
    sourceDocumentsCount
    createdAt
    publishedAt
  }
`;

export const COURSE_DETAIL_FRAGMENT = gql`
  fragment CourseDetail on Course {
    ...CourseBasic
    trailer
    metaTitle
    metaDescription
    tags
    whatYouWillLearn
    requirements
    targetAudience
    instructorId
  }
  ${COURSE_BASIC_FRAGMENT}
`;

// Queries
export const GET_COURSES = gql`
  query GetCourses($filters: CourseFiltersInput) {
    courses(filters: $filters) {
      data {
        ...CourseBasic
        categoryId
        instructor {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      total
      page
      limit
      totalPages
    }
  }
  ${COURSE_BASIC_FRAGMENT}
`;

export const GET_COURSE_BY_SLUG = gql`
  query GetCourseBySlug($slug: String!) {
    courseBySlug(slug: $slug) {
      ...CourseDetail
      categoryId
      instructor {
        id
        username
        firstName
        lastName
        avatar
      }
      modules {
        id
        title
        description
        order
        lessons {
          id
          title
          description
          type
          content
          duration
          order
          isFree
        }
      }
    }
  }
  ${COURSE_DETAIL_FRAGMENT}
`;

export const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      ...CourseBasic
      categoryId
    }
  }
  ${COURSE_BASIC_FRAGMENT}
`;

export const GET_ENROLLMENT = gql`
  query GetEnrollment($courseId: ID!) {
    enrollment(courseId: $courseId) {
      id
      userId
      courseId
      status
      progress
      enrolledAt
      completedAt
      lessonProgress {
        id
        lessonId
        completed
        completedAt
      }
    }
  }
`;

export const GET_COURSE_CATEGORIES = gql`
  query GetCourseCategories {
    courseCategories {
      id
      name
      slug
      description
      icon
      parentId
    }
  }
`;

export const GET_COURSE_CATEGORY_TREE = gql`
  query GetCourseCategoryTree {
    courseCategoryTree {
      id
      name
      slug
      icon
      children {
        id
        name
        slug
        icon
      }
    }
  }
`;

// Mutations
export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(createCourseInput: $input) {
      ...CourseDetail
    }
  }
  ${COURSE_DETAIL_FRAGMENT}
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($input: UpdateCourseInput!) {
    updateCourse(updateCourseInput: $input) {
      ...CourseDetail
    }
  }
  ${COURSE_DETAIL_FRAGMENT}
`;

export const PUBLISH_COURSE = gql`
  mutation PublishCourse($id: ID!) {
    publishCourse(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

// ============== Approval Workflow ==============

export const REQUEST_COURSE_APPROVAL = gql`
  mutation RequestCourseApproval($courseId: ID!) {
    requestCourseApproval(courseId: $courseId) {
      id
      title
      status
      approvalRequested
      approvalRequestedAt
    }
  }
`;

export const APPROVE_COURSE = gql`
  mutation ApproveCourse($courseId: ID!) {
    approveCourse(courseId: $courseId) {
      id
      title
      status
      publishedAt
      approvedBy
      approvedAt
    }
  }
`;

export const REJECT_COURSE = gql`
  mutation RejectCourse($courseId: ID!, $reason: String!) {
    rejectCourse(courseId: $courseId, reason: $reason) {
      id
      title
      status
      approvalRequested
      rejectionReason
    }
  }
`;

export const MARK_LESSON_COMPLETE = gql`
  mutation MarkLessonComplete($enrollmentId: ID!, $lessonId: ID!) {
    markLessonComplete(enrollmentId: $enrollmentId, lessonId: $lessonId) {
      id
      lessonId
      completed
      completedAt
    }
  }
`;

// ==================== MODULE MUTATIONS ====================

export const CREATE_MODULE = gql`
  mutation CreateModule($input: CreateModuleInput!) {
    createModule(input: $input) {
      id
      title
      description
      order
      courseId
      lessons {
        id
        title
        type
        order
      }
    }
  }
`;

export const UPDATE_MODULE = gql`
  mutation UpdateModule($input: UpdateModuleInput!) {
    updateModule(input: $input) {
      id
      title
      description
      order
    }
  }
`;

export const DELETE_MODULE = gql`
  mutation DeleteModule($id: ID!) {
    deleteModule(id: $id)
  }
`;

export const REORDER_MODULES = gql`
  mutation ReorderModules($input: ReorderModulesInput!) {
    reorderModules(input: $input) {
      id
      title
      order
      lessons {
        id
        title
        order
      }
    }
  }
`;

// ==================== LESSON MUTATIONS ====================

export const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      id
      title
      description
      type
      content
      duration
      order
      moduleId
    }
  }
`;

export const UPDATE_LESSON = gql`
  mutation UpdateLesson($input: UpdateLessonInput!) {
    updateLesson(input: $input) {
      id
      title
      description
      type
      content
      duration
      order
    }
  }
`;

export const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`;

export const REORDER_LESSONS = gql`
  mutation ReorderLessons($input: ReorderLessonsInput!) {
    reorderLessons(input: $input) {
      id
      title
      order
    }
  }
`;
