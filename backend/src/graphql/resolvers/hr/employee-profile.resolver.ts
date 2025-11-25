import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { HRService } from '../../../services/hr.service';
import { EmployeeProfile } from '../../models/hr/employee-profile.model';
import { CreateEmployeeProfileInput, UpdateEmployeeProfileInput } from '../../inputs/hr/employee-profile.input';
import { GetUser } from '../../../auth/get-user.decorator';

@Resolver(() => EmployeeProfile)
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeProfileResolver {
  constructor(private hrService: HRService) {}

  @Mutation(() => EmployeeProfile)
  @Roles('ADMIN')
  async createEmployeeProfile(
    @Args('input') input: CreateEmployeeProfileInput,
    @GetUser() currentUser: any,
  ) {
    return this.hrService.createEmployeeProfile(input);
  }

  @Query(() => EmployeeProfile)
  @Roles('ADMIN', 'USER')
  async employeeProfile(@Args('id', { type: () => ID }) id: string) {
    return this.hrService.getEmployeeProfile(id);
  }

  @Query(() => EmployeeProfile)
  @Roles('ADMIN', 'USER')
  async employeeProfileByUserId(@Args('userId', { type: () => ID }) userId: string) {
    return this.hrService.getEmployeeProfileByUserId(userId);
  }

  @Query(() => EmployeeProfile)
  @Roles('ADMIN')
  async employeeProfileByCode(@Args('employeeCode') employeeCode: string) {
    return this.hrService.getEmployeeProfileByCode(employeeCode);
  }

  @Query(() => EmployeeListResponse)
  @Roles('ADMIN')
  async listEmployeeProfiles(
    @Args('department', { nullable: true }) department?: string,
    @Args('position', { nullable: true }) position?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.hrService.listEmployeeProfiles({
      department,
      position,
      isActive,
      skip,
      take,
    });
  }

  @Mutation(() => EmployeeProfile)
  @Roles('ADMIN')
  async updateEmployeeProfile(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeProfileInput,
    @GetUser() currentUser: any,
  ) {
    return this.hrService.updateEmployeeProfile(id, input);
  }

  @Mutation(() => DeleteResponse)
  @Roles('ADMIN')
  async deleteEmployeeProfile(@Args('id', { type: () => ID }) id: string) {
    return this.hrService.deleteEmployeeProfile(id);
  }
}

// Response Types
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class EmployeeListResponse {
  @Field(() => [EmployeeProfile])
  employees: EmployeeProfile[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
class DeleteResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
