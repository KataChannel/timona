import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { EmploymentEventType, ContractType, TerminationType } from './enums.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class EmploymentHistory {
  @Field(() => ID)
  id: string;

  @Field()
  employeeProfileId: string;

  @Field()
  userId: string;

  @Field(() => EmploymentEventType)
  eventType: EmploymentEventType;

  @Field()
  eventDate: Date;

  @Field()
  effectiveDate: Date;

  // Event Details
  @Field(() => GraphQLJSON, { nullable: true })
  previousValue?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  newValue?: any;

  // Position & Department
  @Field({ nullable: true })
  fromPosition?: string;

  @Field({ nullable: true })
  toPosition?: string;

  @Field({ nullable: true })
  fromDepartment?: string;

  @Field({ nullable: true })
  toDepartment?: string;

  @Field({ nullable: true })
  fromLevel?: string;

  @Field({ nullable: true })
  toLevel?: string;

  // Contract
  @Field(() => ContractType, { nullable: true })
  contractType?: ContractType;

  @Field({ nullable: true })
  contractNumber?: string;

  @Field({ nullable: true })
  contractStartDate?: Date;

  @Field({ nullable: true })
  contractEndDate?: Date;

  // Salary Change
  @Field(() => Float, { nullable: true })
  salaryChangePercentage?: number;

  @Field({ nullable: true })
  newSalaryGrade?: string;

  // Offboarding Specific
  @Field(() => TerminationType, { nullable: true })
  terminationType?: TerminationType;

  @Field({ nullable: true })
  terminationReason?: string;

  @Field({ nullable: true })
  lastWorkingDay?: Date;

  @Field(() => Int, { nullable: true })
  noticePeriodDays?: number;

  // Documents & Approvals
  @Field(() => [String], { nullable: true })
  documentIds?: string[];

  @Field({ nullable: true })
  approvalStatus?: string;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  // Notes
  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  internalNotes?: string;

  // Metadata
  @Field({ nullable: true })
  processedBy?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
