import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Gender, MaritalStatus, ContractType } from './enums.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class EmployeeProfile {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  employeeCode: string;

  // Personal Information
  @Field()
  fullName: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  citizenId?: string;

  @Field({ nullable: true })
  citizenIdIssueDate?: Date;

  @Field({ nullable: true })
  citizenIdIssuePlace?: string;

  @Field({ nullable: true })
  passportNumber?: string;

  @Field({ nullable: true })
  passportIssueDate?: Date;

  @Field({ nullable: true })
  passportExpiryDate?: Date;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  placeOfBirth?: string;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => MaritalStatus, { nullable: true })
  maritalStatus?: MaritalStatus;

  @Field({ nullable: true, defaultValue: 'Vietnam' })
  nationality?: string;

  // Contact Information
  @Field({ nullable: true })
  personalEmail?: string;

  @Field({ nullable: true })
  personalPhone?: string;

  @Field({ nullable: true })
  permanentAddress?: string;

  @Field({ nullable: true })
  currentAddress?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  district?: string;

  @Field({ nullable: true })
  ward?: string;

  @Field({ nullable: true })
  postalCode?: string;

  // Emergency Contact
  @Field({ nullable: true })
  emergencyContactName?: string;

  @Field({ nullable: true })
  emergencyContactRelationship?: string;

  @Field({ nullable: true })
  emergencyContactPhone?: string;

  @Field({ nullable: true })
  emergencyContactAddress?: string;

  // Education & Professional
  @Field(() => GraphQLJSON, { nullable: true })
  education?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  certifications?: any;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  languages?: any;

  // Banking Information
  @Field({ nullable: true })
  bankName?: string;

  @Field({ nullable: true })
  bankAccountNumber?: string;

  @Field({ nullable: true })
  bankAccountName?: string;

  @Field({ nullable: true })
  bankBranch?: string;

  // Tax & Insurance
  @Field({ nullable: true })
  taxCode?: string;

  @Field({ nullable: true })
  socialInsuranceNumber?: string;

  @Field({ nullable: true })
  healthInsuranceNumber?: string;

  // Employment Information
  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  level?: string;

  @Field({ nullable: true })
  team?: string;

  @Field({ nullable: true })
  directManager?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  probationEndDate?: Date;

  @Field(() => ContractType, { nullable: true })
  contractType?: ContractType;

  @Field({ nullable: true })
  workLocation?: string;

  @Field({ nullable: true })
  salaryGrade?: string;

  // Status
  @Field({ defaultValue: true })
  isActive: boolean;

  // Metadata
  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}
