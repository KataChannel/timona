// ============================================
// HR ENUMS
// ============================================

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum EmploymentEventType {
  ONBOARDING = 'ONBOARDING',
  PROMOTION = 'PROMOTION',
  TRANSFER = 'TRANSFER',
  SALARY_CHANGE = 'SALARY_CHANGE',
  POSITION_CHANGE = 'POSITION_CHANGE',
  DEPARTMENT_CHANGE = 'DEPARTMENT_CHANGE',
  OFFBOARDING = 'OFFBOARDING',
}

export enum ContractType {
  PROBATION = 'PROBATION',
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum TerminationType {
  RESIGNATION = 'RESIGNATION',
  TERMINATION = 'TERMINATION',
  RETIREMENT = 'RETIREMENT',
  CONTRACT_END = 'CONTRACT_END',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
}

export enum DocumentType {
  CV = 'CV',
  CONTRACT = 'CONTRACT',
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  DEGREE = 'DEGREE',
  CERTIFICATE = 'CERTIFICATE',
  PHOTO = 'PHOTO',
  BANK_INFO = 'BANK_INFO',
  HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE',
  OTHER = 'OTHER',
}

export enum OnboardingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OffboardingStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ClearanceStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE',
}

// ============================================
// EMPLOYEE PROFILE
// ============================================

export interface EmployeeProfile {
  id: string;
  userId: string;
  employeeCode: string;

  // Personal Information
  fullName: string;
  displayName?: string;
  citizenId?: string;
  citizenIdIssueDate?: string;
  citizenIdIssuePlace?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;

  // Contact Information
  personalEmail?: string;
  personalPhone?: string;
  permanentAddress?: string;
  currentAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;

  // Education & Professional
  education?: EducationRecord[];
  certifications?: CertificationRecord[];
  skills?: string[];
  languages?: LanguageRecord[];

  // Banking Information
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;

  // Tax & Insurance
  taxCode?: string;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;

  // Employment Information
  department?: string;
  position?: string;
  level?: string;
  team?: string;
  directManager?: string;
  startDate?: string;
  probationEndDate?: string;
  contractType?: ContractType;
  workLocation?: string;
  salaryGrade?: string;

  // Status
  isActive: boolean;

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;

  // Relations (populated when included)
  user?: {
    id: string;
    email?: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    isActive: boolean;
  };
  employmentHistory?: EmploymentHistory[];
  documents?: EmployeeDocument[];
  onboardingChecklist?: OnboardingChecklist;
  offboardingProcesses?: OffboardingProcess[];
}

export interface EducationRecord {
  degree: string;
  school: string;
  major: string;
  year: number;
  gpa?: number;
}

export interface CertificationRecord {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  fileId?: string;
}

export interface LanguageRecord {
  language: string;
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
}

// ============================================
// EMPLOYMENT HISTORY
// ============================================

export interface EmploymentHistory {
  id: string;
  employeeProfileId: string;
  userId: string;
  eventType: EmploymentEventType;
  eventDate: string;
  effectiveDate: string;

  // Event Details
  previousValue?: any;
  newValue?: any;

  // Position & Department
  fromPosition?: string;
  toPosition?: string;
  fromDepartment?: string;
  toDepartment?: string;
  fromLevel?: string;
  toLevel?: string;

  // Contract
  contractType?: ContractType;
  contractNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;

  // Salary Change
  salaryChangePercentage?: number;
  newSalaryGrade?: string;

  // Offboarding Specific
  terminationType?: TerminationType;
  terminationReason?: string;
  lastWorkingDay?: string;
  noticePeriodDays?: number;

  // Documents & Approvals
  documentIds?: string[];
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;

  // Notes
  notes?: string;
  internalNotes?: string;

  // Metadata
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EMPLOYEE DOCUMENT
// ============================================

export interface EmployeeDocument {
  id: string;
  employeeProfileId: string;
  userId: string;
  documentType: DocumentType;
  title: string;
  description?: string;

  // File Reference
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileMimeType?: string;

  // Document Metadata
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;

  // Verification
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;

  // Access Control
  isConfidential: boolean;
  accessibleBy?: string[];

  // Metadata
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

// ============================================
// ONBOARDING CHECKLIST
// ============================================

export interface OnboardingTask {
  id: string;
  category: string;
  title: string;
  description?: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  order: number;
}

export interface OnboardingChecklist {
  id: string;
  employeeProfileId: string;
  userId: string;

  // Checklist Configuration
  checklistTemplate?: string;
  tasks: OnboardingTask[];

  // Progress Tracking
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;

  // Status & Timeline
  status: OnboardingStatus;
  startDate: string;
  targetDate?: string;
  actualCompletionDate?: string;

  // Assignments
  assignedTo?: string;
  buddyId?: string;

  // Notifications
  remindersSent: number;
  lastReminderAt?: string;

  // Feedback
  employeeFeedback?: string;
  managerFeedback?: string;
  hrNotes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // Relations
  employeeProfile?: EmployeeProfile;
}

// ============================================
// OFFBOARDING PROCESS
// ============================================

export interface AssetReturnItem {
  asset: string;
  assetId?: string;
  category: string;
  returned: boolean;
  returnedDate?: string;
  returnedTo?: string;
  condition?: string;
  notes?: string;
}

export interface KnowledgeTransferItem {
  task: string;
  area: string;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completedDate?: string;
  notes?: string;
}

export interface AccessRevocationItem {
  system: string;
  access: string;
  revoked: boolean;
  revokedDate?: string;
  revokedBy?: string;
}

export interface ClearanceStep {
  department: string;
  clearedBy?: string;
  clearedAt?: string;
  notes?: string;
}

export interface ApprovalStep {
  step: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date?: string;
  comments?: string;
}

export interface Deduction {
  type: string;
  amount: number;
  reason: string;
}

export interface OffboardingProcess {
  id: string;
  employeeProfileId: string;
  userId: string;

  // Exit Information
  lastWorkingDay: string;
  effectiveDate?: string;
  exitReason: string;
  exitType: TerminationType;
  resignationLetter?: string;

  // Notice Period
  noticePeriodDays?: number;
  noticeGivenDate?: string;
  noticeRequired: boolean;

  // Checklist Items
  assetReturnChecklist?: AssetReturnItem[];
  knowledgeTransferPlan?: KnowledgeTransferItem[];
  accessRevocationList?: AccessRevocationItem[];

  // Exit Interview
  exitInterviewScheduled: boolean;
  exitInterviewDate?: string;
  exitInterviewBy?: string;
  exitInterviewNotes?: string;
  exitInterviewForm?: any;

  // Final Settlement
  finalSalaryAmount?: number;
  unusedLeaveDays?: number;
  leavePayoutAmount?: number;
  bonusAmount?: number;
  deductions?: Deduction[];
  totalSettlement?: number;
  paymentDate?: string;
  paymentStatus?: string;

  // Clearance
  clearanceStatus: ClearanceStatus;
  clearanceSteps?: ClearanceStep[];

  // References & Documents
  referenceLetterRequested: boolean;
  referenceLetterProvided: boolean;
  experienceCertificate?: string;
  finalDocuments?: string[];

  // Rehire Eligibility
  eligibleForRehire?: boolean;
  rehireNotes?: string;

  // Process Status
  status: OffboardingStatus;

  // Approvals
  approvalWorkflow?: ApprovalStep[];
  finalApprovedBy?: string;
  finalApprovedAt?: string;

  // Assignment
  initiatedBy: string;
  processOwner?: string;

  // Completion
  completedAt?: string;
  completedBy?: string;

  // Notes & Comments
  hrNotes?: string;
  managerComments?: string;
  employeeComments?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Relations
  employeeProfile?: EmployeeProfile;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateEmployeeProfileInput {
  userId: string;
  employeeCode: string;
  fullName: string;
  displayName?: string;
  citizenId?: string;
  citizenIdIssueDate?: string;
  citizenIdIssuePlace?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  personalEmail?: string;
  personalPhone?: string;
  permanentAddress?: string;
  currentAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  education?: EducationRecord[];
  certifications?: CertificationRecord[];
  skills?: string[];
  languages?: LanguageRecord[];
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  department?: string;
  position?: string;
  level?: string;
  team?: string;
  directManager?: string;
  startDate?: string;
  probationEndDate?: string;
  contractType?: ContractType;
  workLocation?: string;
  salaryGrade?: string;
  notes?: string;
}

export interface UpdateEmployeeProfileInput {
  fullName?: string;
  displayName?: string;
  citizenId?: string;
  citizenIdIssueDate?: string;
  citizenIdIssuePlace?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  personalEmail?: string;
  personalPhone?: string;
  permanentAddress?: string;
  currentAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  education?: EducationRecord[];
  certifications?: CertificationRecord[];
  skills?: string[];
  languages?: LanguageRecord[];
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  department?: string;
  position?: string;
  level?: string;
  team?: string;
  directManager?: string;
  startDate?: string;
  probationEndDate?: string;
  contractType?: ContractType;
  workLocation?: string;
  salaryGrade?: string;
  isActive?: boolean;
  notes?: string;
}

export interface CreateOnboardingChecklistInput {
  employeeProfileId: string;
  userId: string;
  checklistTemplate?: string;
  tasks: OnboardingTask[];
  totalTasks?: number;
  startDate: string;
  targetDate?: string;
  assignedTo?: string;
  buddyId?: string;
  hrNotes?: string;
}

export interface UpdateOnboardingChecklistInput {
  checklistTemplate?: string;
  tasks?: OnboardingTask[];
  totalTasks?: number;
  completedTasks?: number;
  progressPercentage?: number;
  status?: OnboardingStatus;
  startDate?: string;
  targetDate?: string;
  actualCompletionDate?: string;
  assignedTo?: string;
  buddyId?: string;
  employeeFeedback?: string;
  managerFeedback?: string;
  hrNotes?: string;
}

export interface CreateOffboardingProcessInput {
  employeeProfileId: string;
  userId: string;
  lastWorkingDay: string;
  effectiveDate?: string;
  exitReason: string;
  exitType: TerminationType;
  resignationLetter?: string;
  noticePeriodDays?: number;
  noticeGivenDate?: string;
  noticeRequired?: boolean;
  assetReturnChecklist?: AssetReturnItem[];
  knowledgeTransferPlan?: KnowledgeTransferItem[];
  accessRevocationList?: AccessRevocationItem[];
  exitInterviewScheduled?: boolean;
  exitInterviewDate?: string;
  exitInterviewBy?: string;
  exitInterviewNotes?: string;
  exitInterviewForm?: any;
  referenceLetterRequested?: boolean;
  eligibleForRehire?: boolean;
  rehireNotes?: string;
  initiatedBy: string;
  processOwner?: string;
  hrNotes?: string;
  managerComments?: string;
  employeeComments?: string;
}

export interface UpdateOffboardingProcessInput {
  lastWorkingDay?: string;
  effectiveDate?: string;
  exitReason?: string;
  exitType?: TerminationType;
  resignationLetter?: string;
  noticePeriodDays?: number;
  noticeGivenDate?: string;
  noticeRequired?: boolean;
  assetReturnChecklist?: AssetReturnItem[];
  knowledgeTransferPlan?: KnowledgeTransferItem[];
  accessRevocationList?: AccessRevocationItem[];
  exitInterviewScheduled?: boolean;
  exitInterviewDate?: string;
  exitInterviewBy?: string;
  exitInterviewNotes?: string;
  exitInterviewForm?: any;
  finalSalaryAmount?: number;
  unusedLeaveDays?: number;
  leavePayoutAmount?: number;
  bonusAmount?: number;
  deductions?: Deduction[];
  totalSettlement?: number;
  paymentDate?: string;
  paymentStatus?: string;
  clearanceStatus?: ClearanceStatus;
  clearanceSteps?: ClearanceStep[];
  referenceLetterRequested?: boolean;
  referenceLetterProvided?: boolean;
  experienceCertificate?: string;
  finalDocuments?: string[];
  eligibleForRehire?: boolean;
  rehireNotes?: string;
  status?: OffboardingStatus;
  approvalWorkflow?: ApprovalStep[];
  finalApprovedBy?: string;
  finalApprovedAt?: string;
  processOwner?: string;
  completedAt?: string;
  completedBy?: string;
  hrNotes?: string;
  managerComments?: string;
  employeeComments?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface EmployeeListResponse {
  employees: EmployeeProfile[];
  total: number;
  hasMore: boolean;
}

export interface OnboardingListResponse {
  checklists: OnboardingChecklist[];
  total: number;
  hasMore: boolean;
}

export interface OffboardingListResponse {
  processes: OffboardingProcess[];
  total: number;
  hasMore: boolean;
}

export interface EmployeeDocumentListResponse {
  documents: EmployeeDocument[];
  total: number;
  hasMore: boolean;
}

export interface HRStatistics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onboarding: {
    pending: number;
    inProgress: number;
    total: number;
  };
  offboarding: {
    pending: number;
    inProgress: number;
    total: number;
  };
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateEmployeeDocumentInput {
  employeeProfileId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileMimeType?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
}

export interface UpdateEmployeeDocumentInput {
  title?: string;
  description?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  isVerified?: boolean;
  notes?: string;
}
