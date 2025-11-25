import { Resolver, Query, Mutation, Args, ID, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { GetUser } from '../../../auth/get-user.decorator';
import { HRService } from '../../../services/hr.service';
import { OnboardingChecklist } from '../../models/hr/onboarding-checklist.model';
import { OffboardingProcess } from '../../models/hr/offboarding-process.model';
import { EmploymentHistory } from '../../models/hr/employment-history.model';
import {
  CreateOnboardingChecklistInput,
  UpdateOnboardingChecklistInput,
} from '../../inputs/hr/onboarding-checklist.input';
import {
  CreateOffboardingProcessInput,
  UpdateOffboardingProcessInput,
} from '../../inputs/hr/offboarding-process.input';
import {
  CreateEmploymentHistoryInput,
  UpdateEmploymentHistoryInput,
} from '../../inputs/hr/employment-history.input';
import { OnboardingStatus, OffboardingStatus, ClearanceStatus } from '../../models/hr/enums.model';

// ============================================
// RESPONSE TYPES - Define these first to avoid circular dependency
// ============================================

@ObjectType()
class OnboardingStats {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
class OffboardingStats {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
class HRStatistics {
  @Field(() => Int)
  totalEmployees: number;

  @Field(() => Int)
  activeEmployees: number;

  @Field(() => Int)
  inactiveEmployees: number;

  @Field(() => OnboardingStats)
  onboarding: OnboardingStats;

  @Field(() => OffboardingStats)
  offboarding: OffboardingStats;
}

@ObjectType()
class OnboardingListResponse {
  @Field(() => [OnboardingChecklist])
  checklists: OnboardingChecklist[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
class OffboardingListResponse {
  @Field(() => [OffboardingProcess])
  processes: OffboardingProcess[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

// ============================================
// ONBOARDING RESOLVER
// ============================================

@Resolver(() => OnboardingChecklist)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnboardingResolver {
  constructor(private hrService: HRService) {}

  @Mutation(() => OnboardingChecklist)
  @Roles('ADMIN')
  async createOnboardingChecklist(
    @Args('input') input: CreateOnboardingChecklistInput,
    @GetUser() currentUser: any,
  ) {
    return this.hrService.createOnboardingChecklist({
      ...input,
      createdBy: currentUser.id,
    });
  }

  @Query(() => OnboardingChecklist)
  @Roles('ADMIN', 'USER')
  async onboardingChecklist(@Args('id', { type: () => ID }) id: string) {
    return this.hrService.getOnboardingChecklist(id);
  }

  @Query(() => OnboardingChecklist)
  @Roles('ADMIN', 'USER')
  async onboardingChecklistByEmployee(@Args('employeeProfileId', { type: () => ID }) employeeProfileId: string) {
    return this.hrService.getOnboardingChecklistByEmployee(employeeProfileId);
  }

  @Query(() => OnboardingListResponse)
  @Roles('ADMIN')
  async listOnboardingChecklists(
    @Args('status', { type: () => OnboardingStatus, nullable: true }) status?: OnboardingStatus,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.hrService.listOnboardingChecklists({ status, skip, take });
  }

  @Mutation(() => OnboardingChecklist)
  @Roles('ADMIN')
  async updateOnboardingChecklist(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOnboardingChecklistInput,
  ) {
    return this.hrService.updateOnboardingChecklist(id, input);
  }

  @Mutation(() => OnboardingChecklist)
  @Roles('ADMIN', 'USER')
  async completeOnboardingTask(
    @Args('checklistId', { type: () => ID }) checklistId: string,
    @Args('taskId', { type: () => ID }) taskId: string,
    @GetUser() currentUser: any,
  ) {
    return this.hrService.completeOnboardingTask(checklistId, taskId, currentUser.id);
  }
}

// ============================================
// OFFBOARDING RESOLVER
// ============================================

@Resolver(() => OffboardingProcess)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffboardingResolver {
  constructor(private hrService: HRService) {}

  @Mutation(() => OffboardingProcess)
  @Roles('ADMIN')
  async createOffboardingProcess(
    @Args('input') input: CreateOffboardingProcessInput,
  ) {
    return this.hrService.createOffboardingProcess(input);
  }

  @Query(() => OffboardingProcess)
  @Roles('ADMIN', 'USER')
  async offboardingProcess(@Args('id', { type: () => ID }) id: string) {
    return this.hrService.getOffboardingProcess(id);
  }

  @Query(() => OffboardingListResponse)
  @Roles('ADMIN')
  async listOffboardingProcesses(
    @Args('status', { type: () => OffboardingStatus, nullable: true }) status?: OffboardingStatus,
    @Args('clearanceStatus', { type: () => ClearanceStatus, nullable: true }) clearanceStatus?: ClearanceStatus,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.hrService.listOffboardingProcesses({ status, clearanceStatus, skip, take });
  }

  @Mutation(() => OffboardingProcess)
  @Roles('ADMIN')
  async updateOffboardingProcess(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOffboardingProcessInput,
  ) {
    return this.hrService.updateOffboardingProcess(id, input);
  }

  @Mutation(() => OffboardingProcess)
  @Roles('ADMIN')
  async completeOffboarding(
    @Args('id', { type: () => ID }) id: string,
    @GetUser() currentUser: any,
  ) {
    return this.hrService.completeOffboarding(id, currentUser.id);
  }
}

// ============================================
// EMPLOYMENT HISTORY RESOLVER
// ============================================

@Resolver(() => EmploymentHistory)
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmploymentHistoryResolver {
  constructor(private hrService: HRService) {}

  @Mutation(() => EmploymentHistory)
  @Roles('ADMIN')
  async createEmploymentHistory(@Args('input') input: CreateEmploymentHistoryInput) {
    return this.hrService.createEmploymentHistory(input);
  }

  @Query(() => [EmploymentHistory])
  @Roles('ADMIN', 'USER')
  async employmentHistory(@Args('employeeProfileId', { type: () => ID }) employeeProfileId: string) {
    return this.hrService.getEmploymentHistory(employeeProfileId);
  }

  @Mutation(() => EmploymentHistory)
  @Roles('ADMIN')
  async updateEmploymentHistory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmploymentHistoryInput,
  ) {
    return this.hrService.updateEmploymentHistory(id, input);
  }
}

// ============================================
// HR STATISTICS RESOLVER
// ============================================

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class HRStatisticsResolver {
  constructor(private hrService: HRService) {}

  @Query(() => HRStatistics)
  @Roles('ADMIN')
  async hrStatistics() {
    return this.hrService.getHRStatistics();
  }
}
