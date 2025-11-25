import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { OnboardingStatus } from './enums.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class OnboardingChecklist {
  @Field(() => ID)
  id: string;

  @Field()
  employeeProfileId: string;

  @Field()
  userId: string;

  // Checklist Configuration
  @Field({ nullable: true })
  checklistTemplate?: string;

  // Checklist Items
  @Field(() => GraphQLJSON)
  tasks: any;

  // Progress Tracking
  @Field(() => Int, { defaultValue: 0 })
  totalTasks: number;

  @Field(() => Int, { defaultValue: 0 })
  completedTasks: number;

  @Field(() => Float, { defaultValue: 0 })
  progressPercentage: number;

  // Status & Timeline
  @Field(() => OnboardingStatus, { defaultValue: OnboardingStatus.PENDING })
  status: OnboardingStatus;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  targetDate?: Date;

  @Field({ nullable: true })
  actualCompletionDate?: Date;

  // Assignments
  @Field({ nullable: true })
  assignedTo?: string;

  @Field({ nullable: true })
  buddyId?: string;

  // Notifications
  @Field(() => Int, { defaultValue: 0 })
  remindersSent: number;

  @Field({ nullable: true })
  lastReminderAt?: Date;

  // Feedback
  @Field({ nullable: true })
  employeeFeedback?: string;

  @Field({ nullable: true })
  managerFeedback?: string;

  @Field({ nullable: true })
  hrNotes?: string;

  // Metadata
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;
}
