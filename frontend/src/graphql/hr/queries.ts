import { gql } from '@apollo/client';

// ============================================
// EMPLOYEE PROFILE QUERIES
// ============================================

export const GET_EMPLOYEE_PROFILE = gql`
  query GetEmployeeProfile($id: ID!) {
    employeeProfile(id: $id) {
      id
      userId
      employeeCode
      fullName
      displayName
      citizenId
      citizenIdIssueDate
      citizenIdIssuePlace
      passportNumber
      passportIssueDate
      passportExpiryDate
      dateOfBirth
      placeOfBirth
      gender
      maritalStatus
      nationality
      personalEmail
      personalPhone
      permanentAddress
      currentAddress
      city
      district
      ward
      postalCode
      emergencyContactName
      emergencyContactRelationship
      emergencyContactPhone
      emergencyContactAddress
      education
      certifications
      skills
      languages
      bankName
      bankAccountNumber
      bankAccountName
      bankBranch
      taxCode
      socialInsuranceNumber
      healthInsuranceNumber
      department
      position
      level
      team
      directManager
      startDate
      probationEndDate
      contractType
      workLocation
      salaryGrade
      isActive
      notes
      createdAt
      updatedAt
      createdBy
      updatedBy
      user {
        id
        email
        username
        firstName
        lastName
        avatar
        isActive
      }
    }
  }
`;

export const GET_EMPLOYEE_PROFILE_BY_USER_ID = gql`
  query GetEmployeeProfileByUserId($userId: ID!) {
    employeeProfileByUserId(userId: $userId) {
      id
      userId
      employeeCode
      fullName
      displayName
      department
      position
      level
      team
      directManager
      startDate
      probationEndDate
      contractType
      workLocation
      isActive
      user {
        id
        email
        username
        firstName
        lastName
        avatar
        isActive
      }
    }
  }
`;

export const LIST_EMPLOYEE_PROFILES = gql`
  query ListEmployeeProfiles(
    $department: String
    $position: String
    $isActive: Boolean
    $skip: Int
    $take: Int
  ) {
    listEmployeeProfiles(
      department: $department
      position: $position
      isActive: $isActive
      skip: $skip
      take: $take
    ) {
      employees {
        id
        userId
        employeeCode
        fullName
        displayName
        department
        position
        level
        startDate
        isActive
        user {
          id
          email
          username
          firstName
          lastName
          avatar
        }
      }
      total
      hasMore
    }
  }
`;

// ============================================
// EMPLOYEE PROFILE MUTATIONS
// ============================================

export const CREATE_EMPLOYEE_PROFILE = gql`
  mutation CreateEmployeeProfile($input: CreateEmployeeProfileInput!) {
    createEmployeeProfile(input: $input) {
      id
      userId
      employeeCode
      fullName
      department
      position
      startDate
      isActive
    }
  }
`;

export const UPDATE_EMPLOYEE_PROFILE = gql`
  mutation UpdateEmployeeProfile($id: ID!, $input: UpdateEmployeeProfileInput!) {
    updateEmployeeProfile(id: $id, input: $input) {
      id
      userId
      employeeCode
      fullName
      displayName
      department
      position
      level
      team
      isActive
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYEE_PROFILE = gql`
  mutation DeleteEmployeeProfile($id: ID!) {
    deleteEmployeeProfile(id: $id) {
      success
      message
    }
  }
`;

// ============================================
// EMPLOYMENT HISTORY QUERIES
// ============================================

export const GET_EMPLOYMENT_HISTORY = gql`
  query GetEmploymentHistory($employeeProfileId: ID!) {
    employmentHistory(employeeProfileId: $employeeProfileId) {
      id
      employeeProfileId
      userId
      eventType
      eventDate
      effectiveDate
      previousValue
      newValue
      fromPosition
      toPosition
      fromDepartment
      toDepartment
      fromLevel
      toLevel
      contractType
      contractNumber
      contractStartDate
      contractEndDate
      salaryChangePercentage
      newSalaryGrade
      terminationType
      terminationReason
      lastWorkingDay
      noticePeriodDays
      documentIds
      approvalStatus
      approvedBy
      approvedAt
      notes
      internalNotes
      processedBy
      createdAt
      updatedAt
    }
  }
`;

// ============================================
// ONBOARDING QUERIES
// ============================================

export const GET_ONBOARDING_CHECKLIST = gql`
  query GetOnboardingChecklist($id: ID!) {
    onboardingChecklist(id: $id) {
      id
      employeeProfileId
      userId
      checklistTemplate
      tasks
      totalTasks
      completedTasks
      progressPercentage
      status
      startDate
      targetDate
      actualCompletionDate
      assignedTo
      buddyId
      remindersSent
      lastReminderAt
      employeeFeedback
      managerFeedback
      hrNotes
      createdAt
      updatedAt
      createdBy
      employeeProfile {
        id
        fullName
        employeeCode
        department
        position
        user {
          id
          email
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

export const GET_ONBOARDING_CHECKLIST_BY_EMPLOYEE = gql`
  query GetOnboardingChecklistByEmployee($employeeProfileId: ID!) {
    onboardingChecklistByEmployee(employeeProfileId: $employeeProfileId) {
      id
      employeeProfileId
      userId
      checklistTemplate
      tasks
      totalTasks
      completedTasks
      progressPercentage
      status
      startDate
      targetDate
      actualCompletionDate
      assignedTo
      buddyId
      remindersSent
      lastReminderAt
      employeeFeedback
      managerFeedback
      hrNotes
      createdAt
      updatedAt
      employeeProfile {
        id
        fullName
        employeeCode
        department
        position
      }
    }
  }
`;

export const LIST_ONBOARDING_CHECKLISTS = gql`
  query ListOnboardingChecklists($status: OnboardingStatus, $skip: Int, $take: Int) {
    listOnboardingChecklists(status: $status, skip: $skip, take: $take) {
      checklists {
        id
        employeeProfileId
        userId
        totalTasks
        completedTasks
        progressPercentage
        status
        startDate
        targetDate
        actualCompletionDate
        assignedTo
        createdAt
        employeeProfile {
          id
          fullName
          employeeCode
          department
          position
          user {
            id
            username
            firstName
            lastName
            avatar
          }
        }
      }
      total
      hasMore
    }
  }
`;

// ============================================
// ONBOARDING MUTATIONS
// ============================================

export const CREATE_ONBOARDING_CHECKLIST = gql`
  mutation CreateOnboardingChecklist($input: CreateOnboardingChecklistInput!) {
    createOnboardingChecklist(input: $input) {
      id
      employeeProfileId
      userId
      tasks
      totalTasks
      status
      startDate
      targetDate
      createdAt
    }
  }
`;

export const UPDATE_ONBOARDING_CHECKLIST = gql`
  mutation UpdateOnboardingChecklist($id: ID!, $input: UpdateOnboardingChecklistInput!) {
    updateOnboardingChecklist(id: $id, input: $input) {
      id
      tasks
      totalTasks
      completedTasks
      progressPercentage
      status
      actualCompletionDate
      updatedAt
    }
  }
`;

export const COMPLETE_ONBOARDING_TASK = gql`
  mutation CompleteOnboardingTask($checklistId: ID!, $taskId: ID!) {
    completeOnboardingTask(checklistId: $checklistId, taskId: $taskId) {
      id
      tasks
      completedTasks
      progressPercentage
      status
      updatedAt
    }
  }
`;

// ============================================
// OFFBOARDING QUERIES
// ============================================

export const GET_OFFBOARDING_PROCESS = gql`
  query GetOffboardingProcess($id: ID!) {
    offboardingProcess(id: $id) {
      id
      employeeProfileId
      userId
      lastWorkingDay
      effectiveDate
      exitReason
      exitType
      resignationLetter
      noticePeriodDays
      noticeGivenDate
      noticeRequired
      assetReturnChecklist
      knowledgeTransferPlan
      accessRevocationList
      exitInterviewScheduled
      exitInterviewDate
      exitInterviewBy
      exitInterviewNotes
      exitInterviewForm
      finalSalaryAmount
      unusedLeaveDays
      leavePayoutAmount
      bonusAmount
      deductions
      totalSettlement
      paymentDate
      paymentStatus
      clearanceStatus
      clearanceSteps
      referenceLetterRequested
      referenceLetterProvided
      experienceCertificate
      finalDocuments
      eligibleForRehire
      rehireNotes
      status
      approvalWorkflow
      finalApprovedBy
      finalApprovedAt
      initiatedBy
      processOwner
      completedAt
      completedBy
      hrNotes
      managerComments
      employeeComments
      createdAt
      updatedAt
      employeeProfile {
        id
        fullName
        employeeCode
        department
        position
        user {
          id
          email
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

export const LIST_OFFBOARDING_PROCESSES = gql`
  query ListOffboardingProcesses(
    $status: OffboardingStatus
    $clearanceStatus: ClearanceStatus
    $skip: Int
    $take: Int
  ) {
    listOffboardingProcesses(
      status: $status
      clearanceStatus: $clearanceStatus
      skip: $skip
      take: $take
    ) {
      processes {
        id
        employeeProfileId
        userId
        lastWorkingDay
        effectiveDate
        exitReason
        exitType
        status
        clearanceStatus
        initiatedBy
        processOwner
        createdAt
        employeeProfile {
          id
          fullName
          employeeCode
          department
          position
          user {
            id
            username
            firstName
            lastName
            avatar
          }
        }
      }
      total
      hasMore
    }
  }
`;

// ============================================
// OFFBOARDING MUTATIONS
// ============================================

export const CREATE_OFFBOARDING_PROCESS = gql`
  mutation CreateOffboardingProcess($input: CreateOffboardingProcessInput!) {
    createOffboardingProcess(input: $input) {
      id
      employeeProfileId
      userId
      lastWorkingDay
      exitReason
      exitType
      status
      clearanceStatus
      createdAt
    }
  }
`;

export const UPDATE_OFFBOARDING_PROCESS = gql`
  mutation UpdateOffboardingProcess($id: ID!, $input: UpdateOffboardingProcessInput!) {
    updateOffboardingProcess(id: $id, input: $input) {
      id
      lastWorkingDay
      exitReason
      exitType
      status
      clearanceStatus
      finalSalaryAmount
      totalSettlement
      paymentStatus
      updatedAt
    }
  }
`;

export const COMPLETE_OFFBOARDING = gql`
  mutation CompleteOffboarding($id: ID!) {
    completeOffboarding(id: $id) {
      id
      status
      clearanceStatus
      completedAt
      completedBy
    }
  }
`;

// ============================================
// HR STATISTICS
// ============================================

export const GET_HR_STATISTICS = gql`
  query GetHRStatistics {
    hrStatistics {
      totalEmployees
      activeEmployees
      inactiveEmployees
      onboarding {
        pending
        inProgress
        total
      }
      offboarding {
        pending
        inProgress
        total
      }
    }
  }
`;

// ============================================
// EMPLOYEE DOCUMENT QUERIES
// ============================================

export const GET_EMPLOYEE_DOCUMENT = gql`
  query GetEmployeeDocument($id: ID!) {
    employeeDocument(id: $id) {
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
  }
`;

export const LIST_EMPLOYEE_DOCUMENTS = gql`
  query ListEmployeeDocuments($employeeProfileId: ID!, $documentType: DocumentType, $skip: Int, $take: Int) {
    employeeDocuments(employeeProfileId: $employeeProfileId, documentType: $documentType, skip: $skip, take: $take) {
      documents {
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
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

// ============================================
// EMPLOYEE DOCUMENT MUTATIONS
// ============================================

export const CREATE_EMPLOYEE_DOCUMENT = gql`
  mutation CreateEmployeeDocument($input: CreateEmployeeDocumentInput!) {
    createEmployeeDocument(input: $input) {
      id
      employeeProfileId
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
      createdAt
    }
  }
`;

export const UPDATE_EMPLOYEE_DOCUMENT = gql`
  mutation UpdateEmployeeDocument($id: ID!, $input: UpdateEmployeeDocumentInput!) {
    updateEmployeeDocument(id: $id, input: $input) {
      id
      title
      description
      documentNumber
      issueDate
      expiryDate
      issuingAuthority
      isVerified
      verifiedBy
      verifiedAt
      notes
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYEE_DOCUMENT = gql`
  mutation DeleteEmployeeDocument($id: ID!) {
    deleteEmployeeDocument(id: $id)
  }
`;
