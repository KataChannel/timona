import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty, IsBoolean, IsNumber, IsArray, MaxLength } from 'class-validator';
import { TerminationType, OffboardingStatus, ClearanceStatus } from '../../models/hr/enums.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateOffboardingProcessInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  employeeProfileId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  lastWorkingDay: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  exitReason: string;

  @Field(() => TerminationType)
  @IsNotEmpty()
  @IsEnum(TerminationType)
  exitType: TerminationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resignationLetter?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  noticeGivenDate?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  noticeRequired?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  assetReturnChecklist?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  knowledgeTransferPlan?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  accessRevocationList?: any;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  exitInterviewScheduled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  exitInterviewDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exitInterviewBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exitInterviewNotes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  exitInterviewForm?: any;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  referenceLetterRequested?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  eligibleForRehire?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rehireNotes?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  initiatedBy: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  processOwner?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hrNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  managerComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeComments?: string;
}

@InputType()
export class UpdateOffboardingProcessInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lastWorkingDay?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exitReason?: string;

  @Field(() => TerminationType, { nullable: true })
  @IsOptional()
  @IsEnum(TerminationType)
  exitType?: TerminationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resignationLetter?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  noticeGivenDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  noticeRequired?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  assetReturnChecklist?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  knowledgeTransferPlan?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  accessRevocationList?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  exitInterviewScheduled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  exitInterviewDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exitInterviewBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exitInterviewNotes?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  exitInterviewForm?: any;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  finalSalaryAmount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  unusedLeaveDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  leavePayoutAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  bonusAmount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  deductions?: any;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalSettlement?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentStatus?: string;

  @Field(() => ClearanceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ClearanceStatus)
  clearanceStatus?: ClearanceStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  clearanceSteps?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  referenceLetterRequested?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  referenceLetterProvided?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experienceCertificate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  finalDocuments?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  eligibleForRehire?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rehireNotes?: string;

  @Field(() => OffboardingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OffboardingStatus)
  status?: OffboardingStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  approvalWorkflow?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  finalApprovedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  finalApprovedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  processOwner?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  completedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hrNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  managerComments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeComments?: string;
}
