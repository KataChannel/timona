/**
 * Permission Guard Component
 * Component wrapper để kiểm tra permissions trước khi render
 */

'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  resource: string;
  action: string;
  scope?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  resource,
  action,
  scope,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return null;
  }

  if (!hasPermission(resource, action, scope)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAnyPermissionProps {
  checks: Array<{ resource: string; action: string; scope?: string }>;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequireAnyPermission({
  checks,
  fallback = null,
  children,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission, loading } = usePermission();

  if (loading) {
    return null;
  }

  if (!hasAnyPermission(checks)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAllPermissionsProps {
  checks: Array<{ resource: string; action: string; scope?: string }>;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequireAllPermissions({
  checks,
  fallback = null,
  children,
}: RequireAllPermissionsProps) {
  const { hasAllPermissions, loading } = usePermission();

  if (loading) {
    return null;
  }

  if (!hasAllPermissions(checks)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Usage Examples:
 * 
 * // Single permission
 * <PermissionGuard resource="blog" action="create" scope="own">
 *   <CreateBlogButton />
 * </PermissionGuard>
 * 
 * // Any permission (OR)
 * <RequireAnyPermission 
 *   checks={[
 *     { resource: 'blog', action: 'create' },
 *     { resource: 'blog', action: 'update', scope: 'all' }
 *   ]}
 * >
 *   <BlogActions />
 * </RequireAnyPermission>
 * 
 * // All permissions (AND)
 * <RequireAllPermissions 
 *   checks={[
 *     { resource: 'product', action: 'update' },
 *     { resource: 'product', action: 'delete' }
 *   ]}
 * >
 *   <DangerZone />
 * </RequireAllPermissions>
 * 
 * // With fallback
 * <PermissionGuard 
 *   resource="admin" 
 *   action="access"
 *   fallback={<AccessDenied />}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 */
