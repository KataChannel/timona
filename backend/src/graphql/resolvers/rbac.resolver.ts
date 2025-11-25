import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { 
  Role, 
  Permission, 
  RoleSearchResult, 
  PermissionSearchResult,
  UserRolePermissionSummary 
} from '../models/rbac.model';
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleSearchInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchInput,
  AssignRolePermissionInput,
  AssignUserRoleInput,
  AssignUserPermissionInput,
} from '../inputs/rbac.input';
import { RbacService } from '../../services/rbac.service';
import { $Enums } from '@prisma/client';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private readonly rbacService: RbacService) {}

  @Query(() => PermissionSearchResult, { name: 'searchPermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async searchPermissions(
    @Args('input') input: PermissionSearchInput
  ): Promise<PermissionSearchResult> {
    return this.rbacService.searchPermissions(input);
  }

  @Query(() => Permission, { name: 'getPermissionById' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async getPermissionById(@Args('id') id: string): Promise<Permission> {
    return this.rbacService.getPermissionById(id);
  }

  @Mutation(() => Permission, { name: 'createPermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async createPermission(
    @Args('input') input: CreatePermissionInput
  ): Promise<Permission> {
    return this.rbacService.createPermission(input);
  }

  @Mutation(() => Permission, { name: 'updatePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async updatePermission(
    @Args('id') id: string,
    @Args('input') input: UpdatePermissionInput
  ): Promise<Permission> {
    return this.rbacService.updatePermission(id, input);
  }

  @Mutation(() => Boolean, { name: 'deletePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async deletePermission(@Args('id') id: string): Promise<boolean> {
    return this.rbacService.deletePermission(id);
  }
}

@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly rbacService: RbacService) {}

  @Query(() => RoleSearchResult, { name: 'searchRoles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async searchRoles(@Args('input') input: RoleSearchInput): Promise<RoleSearchResult> {
    return this.rbacService.searchRoles(input);
  }

  @Query(() => Role, { name: 'getRoleById' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async getRoleById(@Args('id') id: string): Promise<Role> {
    return this.rbacService.getRoleById(id);
  }

  @Mutation(() => Role, { name: 'createRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async createRole(@Args('input') input: CreateRoleInput): Promise<Role> {
    return this.rbacService.createRole(input);
  }

  @Mutation(() => Role, { name: 'updateRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async updateRole(
    @Args('id') id: string,
    @Args('input') input: UpdateRoleInput
  ): Promise<Role> {
    return this.rbacService.updateRole(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async deleteRole(@Args('id') id: string): Promise<boolean> {
    return this.rbacService.deleteRole(id);
  }

  @Mutation(() => Boolean, { name: 'assignRolePermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async assignRolePermissions(
    @Args('input') input: AssignRolePermissionInput
  ): Promise<boolean> {
    return this.rbacService.assignRolePermissions(input);
  }
}

@Resolver(() => UserRolePermissionSummary)
export class UserRbacResolver {
  constructor(private readonly rbacService: RbacService) {}

  @Query(() => UserRolePermissionSummary, { name: 'getUserRolePermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async getUserRolePermissions(
    @Args('userId') userId: string
  ): Promise<UserRolePermissionSummary> {
    return this.rbacService.getUserEffectivePermissions(userId);
  }

  @Mutation(() => Boolean, { name: 'assignUserRoles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async assignUserRoles(@Args('input') input: AssignUserRoleInput): Promise<boolean> {
    return this.rbacService.assignUserRoles(input);
  }

  @Mutation(() => Boolean, { name: 'assignUserPermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async assignUserPermissions(
    @Args('input') input: AssignUserPermissionInput
  ): Promise<boolean> {
    return this.rbacService.assignUserPermissions(input);
  }
}