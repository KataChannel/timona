import { registerEnumType } from '@nestjs/graphql';

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

// Register all enums with GraphQL
registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender types',
});

registerEnumType(MaritalStatus, {
  name: 'MaritalStatus',
  description: 'Marital status types',
});

registerEnumType(EmploymentEventType, {
  name: 'EmploymentEventType',
  description: 'Employment event types for tracking employment history',
});

registerEnumType(ContractType, {
  name: 'ContractType',
  description: 'Employment contract types',
});

registerEnumType(TerminationType, {
  name: 'TerminationType',
  description: 'Employment termination types',
});

registerEnumType(DocumentType, {
  name: 'DocumentType',
  description: 'Employee document types',
});

registerEnumType(OnboardingStatus, {
  name: 'OnboardingStatus',
  description: 'Onboarding process status',
});

registerEnumType(OffboardingStatus, {
  name: 'OffboardingStatus',
  description: 'Offboarding process status',
});

registerEnumType(ClearanceStatus, {
  name: 'ClearanceStatus',
  description: 'Clearance status for offboarding',
});
