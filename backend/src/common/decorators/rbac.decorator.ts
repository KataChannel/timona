/**
 * RBAC Permission Decorator
 * Decorator để check permissions cho routes
 */

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  resource: string;
  action: string;
  scope?: string;
}

/**
 * @RequirePermissions decorator
 * Sử dụng: @RequirePermissions({ resource: 'blog', action: 'create', scope: 'own' })
 */
export const RequirePermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * @RequireRole decorator  
 * Sử dụng: @RequireRole('blog_manager', 'content_manager')
 */
export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * @Public decorator
 * Đánh dấu route không cần authentication/authorization
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
