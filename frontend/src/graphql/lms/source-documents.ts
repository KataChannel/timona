import { gql } from '@apollo/client';

// ============== QUERIES ==============

export const GET_SOURCE_DOCUMENTS = gql`
  query GetSourceDocuments($filter: SourceDocumentFilterInput, $page: Int, $limit: Int) {
    sourceDocuments(filter: $filter, page: $page, limit: $limit) {
      id
      title
      description
      type
      status
      url
      fileName
      fileSize
      mimeType
      duration
      thumbnailUrl
      categoryId
      tags
      aiSummary
      isAiAnalyzed
      userId
      viewCount
      downloadCount
      usageCount
      createdAt
      updatedAt
      publishedAt
      category {
        id
        name
        slug
        icon
        color
      }
      user {
        id
        email
        username
        firstName
        lastName
      }
    }
  }
`;

export const GET_SOURCE_DOCUMENT = gql`
  query GetSourceDocument($id: ID!) {
    sourceDocument(id: $id) {
      id
      title
      description
      type
      status
      url
      content
      fileName
      fileSize
      mimeType
      duration
      thumbnailUrl
      categoryId
      tags
      aiSummary
      aiKeywords
      aiTopics
      aiAnalyzedAt
      isAiAnalyzed
      metadata
      userId
      viewCount
      downloadCount
      usageCount
      createdAt
      updatedAt
      publishedAt
      category {
        id
        name
        slug
        description
        icon
        color
      }
    }
  }
`;

export const GET_SOURCE_DOCUMENT_CATEGORIES = gql`
  query GetSourceDocumentCategories {
    sourceDocumentCategories {
      id
      name
      slug
      description
      icon
      color
      parentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_SOURCE_DOCUMENT_CATEGORY_TREE = gql`
  query GetSourceDocumentCategoryTree {
    sourceDocumentCategoryTree {
      id
      name
      slug
      description
      icon
      color
      parentId
      children {
        id
        name
        slug
        icon
        color
        children {
          id
          name
          slug
          icon
          color
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_COURSE_DOCUMENTS = gql`
  query GetCourseDocuments($courseId: ID!) {
    courseDocuments(courseId: $courseId) {
      id
      courseId
      documentId
      order
      isRequired
      description
      addedAt
      document {
        id
        title
        description
        type
        status
        url
        fileName
        thumbnailUrl
        tags
        category {
          id
          name
          icon
          color
        }
      }
    }
  }
`;

export const GET_SOURCE_DOCUMENT_STATS = gql`
  query GetSourceDocumentStats($userId: ID) {
    sourceDocumentStats(userId: $userId)
  }
`;

// ============== MUTATIONS ==============

export const CREATE_SOURCE_DOCUMENT = gql`
  mutation CreateSourceDocument($input: CreateSourceDocumentInput!) {
    createSourceDocument(input: $input) {
      id
      title
      type
      status
      url
      fileName
      createdAt
    }
  }
`;

export const UPDATE_SOURCE_DOCUMENT = gql`
  mutation UpdateSourceDocument($id: ID!, $input: UpdateSourceDocumentInput!) {
    updateSourceDocument(id: $id, input: $input) {
      id
      title
      description
      type
      status
      updatedAt
    }
  }
`;

export const DELETE_SOURCE_DOCUMENT = gql`
  mutation DeleteSourceDocument($id: ID!) {
    deleteSourceDocument(id: $id) {
      id
    }
  }
`;

export const LINK_DOCUMENT_TO_COURSE = gql`
  mutation LinkDocumentToCourse($input: LinkDocumentToCourseInput!, $userId: ID!) {
    linkDocumentToCourse(input: $input, userId: $userId) {
      id
      courseId
      documentId
      order
      isRequired
    }
  }
`;

export const UNLINK_DOCUMENT_FROM_COURSE = gql`
  mutation UnlinkDocumentFromCourse($courseId: ID!, $documentId: ID!) {
    unlinkDocumentFromCourse(courseId: $courseId, documentId: $documentId)
  }
`;

export const UPDATE_COURSE_DOCUMENT_LINK = gql`
  mutation UpdateCourseDocumentLink($id: ID!, $input: UpdateCourseDocumentLinkInput!) {
    updateCourseDocumentLink(id: $id, input: $input) {
      id
      order
      isRequired
      description
    }
  }
`;

export const INCREMENT_DOCUMENT_DOWNLOAD = gql`
  mutation IncrementDocumentDownload($id: ID!) {
    incrementDocumentDownload(id: $id) {
      id
      downloadCount
    }
  }
`;

// ============== File Upload ==============

export const UPLOAD_SOURCE_DOCUMENT_FILE = gql`
  mutation UploadSourceDocumentFile($documentId: ID!, $file: Upload!) {
    uploadSourceDocumentFile(documentId: $documentId, file: $file)
  }
`;

export const UPLOAD_DOCUMENT_THUMBNAIL = gql`
  mutation UploadDocumentThumbnail($documentId: ID!, $file: Upload!) {
    uploadDocumentThumbnail(documentId: $documentId, file: $file)
  }
`;

// ============== AI Analysis ==============

export const ANALYZE_SOURCE_DOCUMENT = gql`
  mutation AnalyzeSourceDocument($id: ID!) {
    analyzeSourceDocument(id: $id) {
      id
      aiSummary
      aiKeywords
      aiTopics
      isAiAnalyzed
      aiAnalyzedAt
    }
  }
`;

export const BULK_ANALYZE_DOCUMENTS = gql`
  mutation BulkAnalyzeDocuments($userId: ID) {
    bulkAnalyzeDocuments(userId: $userId)
  }
`;

export const CREATE_SOURCE_DOCUMENT_CATEGORY = gql`
  mutation CreateSourceDocumentCategory($input: CreateSourceDocumentCategoryInput!) {
    createSourceDocumentCategory(input: $input) {
      id
      name
      slug
      icon
      color
      createdAt
    }
  }
`;

export const UPDATE_SOURCE_DOCUMENT_CATEGORY = gql`
  mutation UpdateSourceDocumentCategory($id: ID!, $input: UpdateSourceDocumentCategoryInput!) {
    updateSourceDocumentCategory(id: $id, input: $input) {
      id
      name
      slug
      updatedAt
    }
  }
`;

export const DELETE_SOURCE_DOCUMENT_CATEGORY = gql`
  mutation DeleteSourceDocumentCategory($id: ID!) {
    deleteSourceDocumentCategory(id: $id) {
      id
    }
  }
`;

// ============== Approval Workflow ==============

export const REQUEST_DOCUMENT_APPROVAL = gql`
  mutation RequestDocumentApproval($documentId: ID!) {
    requestDocumentApproval(documentId: $documentId) {
      id
      title
      status
      approvalRequested
      approvalRequestedAt
    }
  }
`;

export const APPROVE_DOCUMENT = gql`
  mutation ApproveDocument($documentId: ID!) {
    approveDocument(documentId: $documentId) {
      id
      title
      status
      publishedAt
      approvedBy
      approvedAt
    }
  }
`;

export const REJECT_DOCUMENT = gql`
  mutation RejectDocument($documentId: ID!, $reason: String!) {
    rejectDocument(documentId: $documentId, reason: $reason) {
      id
      title
      status
      approvalRequested
      rejectionReason
    }
  }
`;
