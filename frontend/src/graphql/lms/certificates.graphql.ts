import { gql } from '@apollo/client';

// Certificate Fragments
export const CERTIFICATE_FRAGMENT = gql`
  fragment CertificateData on Certificate {
    id
    certificateNumber
    courseName
    instructorName
    completionDate
    grade
    verificationUrl
    issueDate
  }
`;

// Queries
export const GET_MY_CERTIFICATES = gql`
  query GetMyCertificates {
    myCertificates {
      ...CertificateData
      course {
        id
        title
        slug
        thumbnail
      }
    }
    certificateStats {
      total
      thisMonth
      thisYear
    }
  }
  ${CERTIFICATE_FRAGMENT}
`;

export const GET_CERTIFICATE = gql`
  query GetCertificate($id: ID!) {
    certificate(id: $id) {
      ...CertificateData
      user {
        id
        firstName
        lastName
        username
      }
      course {
        id
        title
        slug
        thumbnail
        duration
      }
    }
  }
  ${CERTIFICATE_FRAGMENT}
`;

export const VERIFY_CERTIFICATE = gql`
  query VerifyCertificate($certificateNumber: String!) {
    verifyCertificate(certificateNumber: $certificateNumber) {
      valid
      certificate {
        ...CertificateData
        user {
          firstName
          lastName
          username
        }
        course {
          title
          thumbnail
        }
      }
    }
  }
  ${CERTIFICATE_FRAGMENT}
`;

// Mutations
export const GENERATE_CERTIFICATE = gql`
  mutation GenerateCertificate($enrollmentId: ID!) {
    generateCertificate(enrollmentId: $enrollmentId) {
      ...CertificateData
    }
  }
  ${CERTIFICATE_FRAGMENT}
`;
