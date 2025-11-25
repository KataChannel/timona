/**
 * RBAC Constants
 * Scope hierarchy và các constants cho RBAC system
 */

/**
 * Scope Hierarchy Levels
 * Higher number = broader scope
 * 
 * Example:
 * - User with 'all' scope (4) can access resources with 'own' scope (1)
 * - User with 'team' scope (2) can access resources with 'own' scope (1)
 * - User with 'own' scope (1) can only access their own resources
 */
export const SCOPE_HIERARCHY = {
  own: 1,
  team: 2,
  organization: 3,
  all: 4,
} as const;

export type ScopeLevel = keyof typeof SCOPE_HIERARCHY;

/**
 * Check if user scope includes required scope
 * 
 * @param userScope - Scope user has (e.g., 'all')
 * @param requiredScope - Scope required for action (e.g., 'own')
 * @returns true if user scope is equal or higher than required scope
 * 
 * @example
 * scopeIncludes('all', 'own') => true
 * scopeIncludes('own', 'all') => false
 * scopeIncludes('team', 'own') => true
 * scopeIncludes('organization', 'team') => true
 */
export function scopeIncludes(
  userScope: string | undefined,
  requiredScope: string | undefined,
): boolean {
  // If no required scope, allow access
  if (!requiredScope) return true;

  // If no user scope, deny access
  if (!userScope) return false;

  // If scopes are equal, allow access
  if (userScope === requiredScope) return true;

  // Get hierarchy levels
  const userLevel = SCOPE_HIERARCHY[userScope as ScopeLevel];
  const requiredLevel = SCOPE_HIERARCHY[requiredScope as ScopeLevel];

  // If scope not in hierarchy, use exact match only
  if (userLevel === undefined || requiredLevel === undefined) {
    return userScope === requiredScope;
  }

  // User scope must be equal or higher than required scope
  return userLevel >= requiredLevel;
}

/**
 * Get all scopes that are included in given scope
 * 
 * @param scope - User's scope
 * @returns Array of scopes included (from highest to lowest)
 * 
 * @example
 * getIncludedScopes('all') => ['all', 'organization', 'team', 'own']
 * getIncludedScopes('team') => ['team', 'own']
 * getIncludedScopes('own') => ['own']
 */
export function getIncludedScopes(scope: string): string[] {
  const level = SCOPE_HIERARCHY[scope as ScopeLevel];

  if (level === undefined) {
    return [scope];
  }

  return Object.entries(SCOPE_HIERARCHY)
    .filter(([_, scopeLevel]) => scopeLevel <= level)
    .sort(([_, a], [__, b]) => b - a)
    .map(([scopeName]) => scopeName);
}

/**
 * Common RBAC error messages
 */
export const RBAC_ERROR_MESSAGES = {
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to access this resource',
  ROLE_NOT_FOUND: 'Role not found',
  PERMISSION_NOT_FOUND: 'Permission not found',
  USER_NOT_FOUND: 'User not found',
  ROLE_ALREADY_ASSIGNED: 'Role already assigned to user',
  INVALID_SCOPE: 'Invalid scope specified',
  OWNERSHIP_REQUIRED: 'You can only access your own resources',
  ADMIN_REQUIRED: 'Admin role required for this action',
} as const;
