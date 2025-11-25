/**
 * RBAC GraphQL Resolver
 * Resolvers cho queries và mutations liên quan đến RBAC
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RBACService } from '../../common/services/rbac.service';
import { RBACGuard } from '../../common/guards/rbac.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequireRole } from '../../common/decorators/rbac.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  PermissionType,
  RoleType,
  UserRoleAssignmentType,
  RemoveRoleResultType,
  PermissionsByCategoryType,
} from './rbac.types';

@Resolver()
export class RBACResolver {
  constructor(private rbacService: RBACService) {}

  /**
   * Get current user's permissions
   * Public query - any authenticated user can see their own permissions
   */
  @Query(() => [PermissionType])
  @UseGuards(JwtAuthGuard)
  async myPermissions(@CurrentUser() user: any) {
    if (!user || !user.id) {
      return [];
    }
    return this.rbacService.getUserPermissions(user.id);
  }

  /**
   * Get current user's roles
   * Public query - any authenticated user can see their own roles
   */
  @Query(() => [UserRoleAssignmentType])
  @UseGuards(JwtAuthGuard)
  async myRoles(@CurrentUser() user: any) {
    if (!user || !user.id) {
      return [];
    }
    return this.rbacService.getUserRoles(user.id);
  }

  /**
   * Check if current user has specific permission
   */
  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async checkMyPermission(
    @CurrentUser() user: any,
    @Args('resource') resource: string,
    @Args('action') action: string,
    @Args('scope', { nullable: true }) scope?: string,
  ): Promise<boolean> {
    if (!user || !user.id) {
      return false;
    }
    return this.rbacService.userHasPermission(user.id, resource, action, scope);
  }

  /**
   * Get all roles (ADMIN only)
   */
  @Query(() => [RoleType])
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async roles() {
    return this.rbacService.getAllRoles();
  }

  /**
   * Get role by ID (ADMIN only)
   */
  @Query(() => RoleType)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async role(@Args('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  /**
   * Get all permissions grouped by category (ADMIN only)
   */
  @Query(() => PermissionsByCategoryType)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async permissions() {
    const data = await this.rbacService.getAllPermissions();
    return { data };
  }

  /**
   * Assign role to user (ADMIN only)
   */
  @Mutation(() => UserRoleAssignmentType)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async assignRoleToUser(
    @CurrentUser() currentUser: any,
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
    @Args('expiresAt', { nullable: true }) expiresAt?: Date,
  ) {
    return this.rbacService.assignRoleToUser(
      userId,
      roleId,
      currentUser.id,
      expiresAt,
    );
  }

  /**
   * Remove role from user (ADMIN only)
   */
  @Mutation(() => RemoveRoleResultType)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async removeRoleFromUser(
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.rbacService.removeRoleFromUser(userId, roleId, currentUser.id);
  }

  /**
   * Get users by role (ADMIN only)
   */
  @Query(() => [UserRoleAssignmentType])
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async usersByRole(@Args('roleId') roleId: string) {
    return this.rbacService.getUsersByRole(roleId);
  }

  /**
   * Check if user has specific permission (ADMIN only)
   */
  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequireRole('ADMIN')
  async checkUserPermission(
    @Args('userId') userId: string,
    @Args('resource') resource: string,
    @Args('action') action: string,
    @Args('scope', { nullable: true }) scope?: string,
  ): Promise<boolean> {
    return this.rbacService.userHasPermission(userId, resource, action, scope);
  }
}
