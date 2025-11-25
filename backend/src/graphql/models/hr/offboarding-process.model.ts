import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { TerminationType, OffboardingStatus, ClearanceStatus } from './enums.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class OffboardingProcess {
  @Field(() => ID)
  id: string;

  @Field()
  employeeProfileId: string;

  @Field()
  userId: string;

  // Exit Information
  @Field()
  lastWorkingDay: Date;

  @Field({ nullable: true })
  effectiveDate?: Date;

  @Field()
  exitReason: string;

  @Field(() => TerminationType)
  exitType: TerminationType;

  @Field({ nullable: true })
  resignationLetter?: string;

  // Notice Period
  @Field(() => Int, { nullable: true })
  noticePeriodDays?: number;

  @Field({ nullable: true })
  noticeGivenDate?: Date;

  @Field({ defaultValue: true })
  noticeRequired: boolean;

  // Checklist Items
  @Field(() => GraphQLJSON, { nullable: true })
  assetReturnChecklist?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  knowledgeTransferPlan?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  accessRevocationList?: any;

  // Exit Interview
  @Field({ defaultValue: false })
  exitInterviewScheduled: boolean;

  @Field({ nullable: true })
  exitInterviewDate?: Date;

  @Field({ nullable: true })
  exitInterviewBy?: string;

  @Field({ nullable: true })
  exitInterviewNotes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  exitInterviewForm?: any;

  // Final Settlement
  @Field(() => Float, { nullable: true })
  finalSalaryAmount?: number;

  @Field(() => Int, { nullable: true })
  unusedLeaveDays?: number;

  @Field(() => Float, { nullable: true })
  leavePayoutAmount?: number;

  @Field(() => Float, { nullable: true })
  bonusAmount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  deductions?: any;

  @Field(() => Float, { nullable: true })
  totalSettlement?: number;

  @Field({ nullable: true })
  paymentDate?: Date;

  @Field({ nullable: true })
  paymentStatus?: string;

  // Clearance
  @Field(() => ClearanceStatus, { defaultValue: ClearanceStatus.PENDING })
  clearanceStatus: ClearanceStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  clearanceSteps?: any;

  // References & Documents
  @Field({ defaultValue: false })
  referenceLetterRequested: boolean;

  @Field({ defaultValue: false })
  referenceLetterProvided: boolean;

  @Field({ nullable: true })
  experienceCertificate?: string;

  @Field(() => [String], { nullable: true })
  finalDocuments?: string[];

  // Rehire Eligibility
  @Field({ nullable: true })
  eligibleForRehire?: boolean;

  @Field({ nullable: true })
  rehireNotes?: string;

  // Process Status
  @Field(() => OffboardingStatus, { defaultValue: OffboardingStatus.INITIATED })
  status: OffboardingStatus;

  // Approvals
  @Field(() => GraphQLJSON, { nullable: true })
  approvalWorkflow?: any;

  @Field({ nullable: true })
  finalApprovedBy?: string;

  @Field({ nullable: true })
  finalApprovedAt?: Date;

  // Assignment
  @Field()
  initiatedBy: string;

  @Field({ nullable: true })
  processOwner?: string;

  // Completion
  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  completedBy?: string;

  // Notes & Comments
  @Field({ nullable: true })
  hrNotes?: string;

  @Field({ nullable: true })
  managerComments?: string;

  @Field({ nullable: true })
  employeeComments?: string;

  // Metadata
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
