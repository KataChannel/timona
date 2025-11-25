import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsArray, MaxLength } from 'class-validator';
import { EmploymentEventType, ContractType, TerminationType } from '../../models/hr/enums.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateEmploymentHistoryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  employeeProfileId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => EmploymentEventType)
  @IsNotEmpty()
  @IsEnum(EmploymentEventType)
  eventType: EmploymentEventType;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  eventDate: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  effectiveDate: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  previousValue?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  newValue?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromPosition?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  toPosition?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromDepartment?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  toDepartment?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fromLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  toLevel?: string;

  @Field(() => ContractType, { nullable: true })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  salaryChangePercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  newSalaryGrade?: string;

  @Field(() => TerminationType, { nullable: true })
  @IsOptional()
  @IsEnum(TerminationType)
  terminationType?: TerminationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lastWorkingDay?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  documentIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvalStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  processedBy?: string;
}

@InputType()
export class UpdateEmploymentHistoryInput {
  @Field(() => EmploymentEventType, { nullable: true })
  @IsOptional()
  @IsEnum(EmploymentEventType)
  eventType?: EmploymentEventType;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  previousValue?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  newValue?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromPosition?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  toPosition?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromDepartment?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  toDepartment?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fromLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  toLevel?: string;

  @Field(() => ContractType, { nullable: true })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  salaryChangePercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  newSalaryGrade?: string;

  @Field(() => TerminationType, { nullable: true })
  @IsOptional()
  @IsEnum(TerminationType)
  terminationType?: TerminationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lastWorkingDay?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  documentIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvalStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
