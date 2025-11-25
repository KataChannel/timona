/**
 * usePermission Hook
 * Hook để check permissions trong React components
 */

'use client';

import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_MY_PERMISSIONS, GET_MY_ROLES } from '@/graphql/rbac.queries';

interface Permission {
  id: string;
  name: string;
  displayName: string;
  resource: string;
  action: string;
  scope: string | null;
  category: string;
}

interface UsePermissionResult {
  permissions: Permission[];
  loading: boolean;
  error: any;
  hasPermission: (resource: string, action: string, scope?: string) => boolean;
  hasAnyPermission: (checks: Array<{ resource: string; action: string; scope?: string }>) => boolean;
  hasAllPermissions: (checks: Array<{ resource: string; action: string; scope?: string }>) => boolean;
  canCreate: (resource: string, scope?: string) => boolean;
  canRead: (resource: string, scope?: string) => boolean;
  canUpdate: (resource: string, scope?: string) => boolean;
  canDelete: (resource: string, scope?: string) => boolean;
}

export function usePermission(): UsePermissionResult {
  const { data, loading, error } = useQuery(GET_MY_PERMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const permissions: Permission[] = useMemo(() => {
    return data?.myPermissions || [];
  }, [data]);

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    return permissions.some(
      (p) =>
        p.resource === resource &&
        p.action === action &&
        (!scope || p.scope === scope || p.scope === 'all')
    );
  };

  const hasAnyPermission = (
    checks: Array<{ resource: string; action: string; scope?: string }>
  ): boolean => {
    return checks.some((check) =>
      hasPermission(check.resource, check.action, check.scope)
    );
  };

  const hasAllPermissions = (
    checks: Array<{ resource: string; action: string; scope?: string }>
  ): boolean => {
    return checks.every((check) =>
      hasPermission(check.resource, check.action, check.scope)
    );
  };

  const canCreate = (resource: string, scope?: string): boolean => {
    return hasPermission(resource, 'create', scope);
  };

  const canRead = (resource: string, scope?: string): boolean => {
    return hasPermission(resource, 'read', scope);
  };

  const canUpdate = (resource: string, scope?: string): boolean => {
    return hasPermission(resource, 'update', scope);
  };

  const canDelete = (resource: string, scope?: string): boolean => {
    return hasPermission(resource, 'delete', scope);
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  };
}

/**
 * useRole Hook
 * Hook để check roles
 */
export function useRole() {
  const { data, loading, error } = useQuery(GET_MY_ROLES);

  const roles = useMemo(() => {
    return data?.myRoles || [];
  }, [data]);

  const hasRole = (roleName: string): boolean => {
    return roles.some((r: any) => r.role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some((name) => hasRole(name));
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every((name) => hasRole(name));
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}
