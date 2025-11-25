/**
 * RBAC Controller
 * API endpoints để quản lý roles và permissions
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RBACService } from '../services/rbac.service';
import { RBACGuard } from '../guards/rbac.guard';
import { RequireRole } from '../decorators/rbac.decorator';

@Controller('rbac')
@UseGuards(RBACGuard)
export class RBACController {
  constructor(private rbacService: RBACService) {}

  /**
   * Get all roles
   * GET /rbac/roles
   */
  @Get('roles')
  @RequireRole('ADMIN') // Chỉ ADMIN mới xem được
  async getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  /**
   * Get role by ID
   * GET /rbac/roles/:id
   */
  @Get('roles/:id')
  @RequireRole('ADMIN')
  async getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  /**
   * Get all permissions grouped by category
   * GET /rbac/permissions
   */
  @Get('permissions')
  @RequireRole('ADMIN')
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  /**
   * Get user's roles
   * GET /rbac/users/:userId/roles
   */
  @Get('users/:userId/roles')
  @RequireRole('ADMIN')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  /**
   * Get user's permissions
   * GET /rbac/users/:userId/permissions
   */
  @Get('users/:userId/permissions')
  @RequireRole('ADMIN')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  /**
   * Get current user's permissions
   * GET /rbac/me/permissions
   */
  @Get('me/permissions')
  async getMyPermissions(@Req() req: any) {
    return this.rbacService.getUserPermissions(req.user.id);
  }

  /**
   * Get current user's roles
   * GET /rbac/me/roles
   */
  @Get('me/roles')
  async getMyRoles(@Req() req: any) {
    return this.rbacService.getUserRoles(req.user.id);
  }

  /**
   * Assign role to user
   * POST /rbac/users/:userId/roles
   */
  @Post('users/:userId/roles')
  @RequireRole('ADMIN')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() body: { roleId: string; expiresAt?: string },
    @Req() req: any,
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.rbacService.assignRoleToUser(
      userId,
      body.roleId,
      req.user.id,
      expiresAt,
    );
  }

  /**
   * Remove role from user
   * DELETE /rbac/users/:userId/roles/:roleId
   */
  @Delete('users/:userId/roles/:roleId')
  @RequireRole('ADMIN')
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rbacService.removeRoleFromUser(userId, roleId);
  }

  /**
   * Get users by role
   * GET /rbac/roles/:roleId/users
   */
  @Get('roles/:roleId/users')
  @RequireRole('ADMIN')
  async getUsersByRole(@Param('roleId') roleId: string) {
    return this.rbacService.getUsersByRole(roleId);
  }

  /**
   * Check permission
   * POST /rbac/check-permission
   */
  @Post('check-permission')
  async checkPermission(
    @Body() body: { userId: string; resource: string; action: string; scope?: string },
  ) {
    const hasPermission = await this.rbacService.userHasPermission(
      body.userId,
      body.resource,
      body.action,
      body.scope,
    );
    return { hasPermission };
  }
}
