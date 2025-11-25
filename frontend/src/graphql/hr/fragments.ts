import { gql } from '@apollo/client';

// ============================================
// FRAGMENTS - For query optimization
// ============================================

export const EMPLOYEE_PROFILE_FRAGMENT = gql`
  fragment EmployeeProfileFields on EmployeeProfile {
    id
    userId
    employeeCode
    fullName
    displayName
    gender
    dateOfBirth
    placeOfBirth
    nationality
    maritalStatus
    citizenId
    passportNumber
    personalEmail
    personalPhone
    currentAddress
    permanentAddress
    department
    position
    jobTitle
    directManager
    responsibilities
    contractType
    probationEndDate
    employmentStartDate
    employmentEndDate
    workingHoursPerWeek
    salaryAmount
    salaryCurrency
    bankAccountNumber
    bankName
    bankBranch
    taxCode
    socialInsuranceNumber
    emergencyContactName
    emergencyContactRelation
    emergencyContactPhone
    education
    certifications
    languages
    skills
    isActive
    notes
    createdAt
    updatedAt
  }
`;

export const EMPLOYEE_PROFILE_WITH_USER_FRAGMENT = gql`
  fragment EmployeeProfileWithUser on EmployeeProfile {
    ...EmployeeProfileFields
    user {
      id
      username
      firstName
      lastName
      email
      avatar
    }
  }
  ${EMPLOYEE_PROFILE_FRAGMENT}
`;

export const EMPLOYEE_DOCUMENT_FRAGMENT = gql`
  fragment EmployeeDocumentFields on EmployeeDocument {
    id
    employeeProfileId
    userId
    documentType
    title
    description
    fileId
    fileName
    fileUrl
    fileSize
    fileMimeType
    documentNumber
    issueDate
    expiryDate
    issuingAuthority
    isVerified
    verifiedBy
    verifiedAt
    notes
    createdAt
    updatedAt
  }
`;

export const ONBOARDING_CHECKLIST_FRAGMENT = gql`
  fragment OnboardingChecklistFields on OnboardingChecklist {
    id
    employeeProfileId
    userId
    startDate
    targetDate
    assignedTo
    buddy
    tasks
    status
    progressPercentage
    employeeFeedback
    managerFeedback
    hrNotes
    completedAt
    completedBy
    createdAt
    updatedAt
  }
`;

export const OFFBOARDING_PROCESS_FRAGMENT = gql`
  fragment OffboardingProcessFields on OffboardingProcess {
    id
    employeeProfileId
    userId
    lastWorkingDay
    effectiveDate
    noticeDate
    noticePeriodDays
    exitReason
    exitType
    status
    clearanceStatus
    assetReturnList
    knowledgeTransferPlan
    accessRevocationList
    finalSalaryAmount
    leavePayout
    bonusAmount
    totalSettlement
    paymentStatus
    exitInterviewDate
    exitInterviewNotes
    exitInterviewConductedBy
    referenceLetterProvided
    eligibleForRehire
    rehireNotes
    approvalWorkflow
    initiatedBy
    processOwner
    finalApprovedBy
    finalApprovedAt
    completedAt
    completedBy
    hrNotes
    managerComments
    employeeComments
    createdAt
    updatedAt
  }
`;

// ============================================
// EMPLOYEE PROFILE QUERIES
// ============================================

export const GET_EMPLOYEE_PROFILE = gql`
  query GetEmployeeProfile($id: ID!) {
    employeeProfile(id: $id) {
      ...EmployeeProfileWithUser
    }
  }
  ${EMPLOYEE_PROFILE_WITH_USER_FRAGMENT}
`;

export const GET_EMPLOYEE_PROFILE_BY_USER_ID = gql`
  query GetEmployeeProfileByUserId($userId: ID!) {
    employeeProfileByUserId(userId: $userId) {
      ...EmployeeProfileWithUser
    }
  }
  ${EMPLOYEE_PROFILE_WITH_USER_FRAGMENT}
`;

export const LIST_EMPLOYEE_PROFILES = gql`
  query ListEmployeeProfiles(
    $skip: Int
    $take: Int
    $search: String
    $department: String
    $position: String
    $isActive: Boolean
    $contractType: ContractType
  ) {
    employeeProfiles(
      skip: $skip
      take: $take
      search: $search
      department: $department
      position: $position
      isActive: $isActive
      contractType: $contractType
    ) {
      employees {
        id
        employeeCode
        fullName
        department
        position
        contractType
        isActive
        employmentStartDate
        user {
          id
          email
          avatar
        }
      }
      total
      hasMore
    }
  }
`;

// Rest of the queries remain the same but will use fragments where applicable
// ... (keeping existing queries for brevity)
