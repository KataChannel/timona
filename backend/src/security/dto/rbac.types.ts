import { Permission, ResourceAccess } from '@prisma/client';

export interface RoleWithPermissions {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  parentId?: string;
  isSystemRole: boolean;
  isActive: boolean;
  priority: number;
  metadata?: any;
  permissions: Permission[];
  children?: RoleWithPermissions[];
}

export interface UserRoleInfo {
  userId: string;
  roles: RoleWithPermissions[];
  directPermissions: Permission[];
  effectivePermissions: Permission[];
  resourceAccesses: ResourceAccess[];
}

export class CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  parentId?: string;
  permissionIds?: string[];
  priority?: number;
  metadata?: any;
}

export class CreatePermissionDto {
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  scope?: string;
  category?: string;
  conditions?: any;
  metadata?: any;
}

export class AssignRoleDto {
  userId: string;
  roleId: string;
  scope?: string;
  expiresAt?: Date;
  conditions?: any;
  metadata?: any;
}

export class GrantPermissionDto {
  userId: string;
  permissionId: string;
  scope?: string;
  expiresAt?: Date;
  reason?: string;
  conditions?: any;
  metadata?: any;
}

export class CheckPermissionDto {
  userId: string;
  resource: string;
  action: string;
  scope?: string;
  resourceId?: string;
  context?: any;
}