import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { OnboardingStatus } from '../../models/hr/enums.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateOnboardingChecklistInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  employeeProfileId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  checklistTemplate?: string;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  tasks: any;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  totalTasks?: number;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  buddyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hrNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

@InputType()
export class UpdateOnboardingChecklistInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  checklistTemplate?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  tasks?: any;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalTasks?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  completedTasks?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  progressPercentage?: number;

  @Field(() => OnboardingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OnboardingStatus)
  status?: OnboardingStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  actualCompletionDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  buddyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeFeedback?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  managerFeedback?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hrNotes?: string;
}
