import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsDateString, IsArray, IsBoolean, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Gender, MaritalStatus, ContractType } from '../../models/hr/enums.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateEmployeeProfileInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  employeeCode: string;

  // Personal Information
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  fullName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  citizenId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  citizenIdIssueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  citizenIdIssuePlace?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  passportNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  passportIssueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  passportExpiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeOfBirth?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => MaritalStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @Field({ nullable: true, defaultValue: 'Vietnam' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  // Contact Information
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  personalPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  permanentAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  currentAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  // Emergency Contact
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactRelationship?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  emergencyContactAddress?: string;

  // Education & Professional
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  education?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  certifications?: any;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  languages?: any;

  // Banking Information
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankAccountName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankBranch?: string;

  // Tax & Insurance
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  socialInsuranceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  healthInsuranceNumber?: string;

  // Employment Information
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  team?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  directManager?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @Field(() => ContractType, { nullable: true })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryGrade?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateEmployeeProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  citizenId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  citizenIdIssueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  citizenIdIssuePlace?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  passportNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  passportIssueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  passportExpiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeOfBirth?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => MaritalStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  personalPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  permanentAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  currentAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactRelationship?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  emergencyContactAddress?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  education?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  certifications?: any;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  languages?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankAccountName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankBranch?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  socialInsuranceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  healthInsuranceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  team?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  directManager?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @Field(() => ContractType, { nullable: true })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryGrade?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
