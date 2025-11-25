/**
 * RBAC Permission Utilities
 * 
 * Helper functions to check user permissions and roles
 */

interface User {
  id: string;
  email: string;
  roleType?: string;
  roles?: Role[];
  permissions?: Permission[];
}

interface Role {
  id: string;
  name: string;
  displayName?: string;
}

interface Permission {
  id: string;
  name: string;
  resource?: string;
  action?: string;
}

/**
 * Check if user has admin access
 * User has admin access if:
 * 1. roleType is ADMIN, OR
 * 2. Has any of the admin-level roles (content_manager, super_admin, etc.)
 */
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;
  
  // Check system roleType
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  // Check RBAC roles
  if (user.roles && user.roles.length > 0) {
    const adminRoles = [
      'admin',
      'super_admin',
      'content_manager',
      'content_editor',
      'product_manager',
      'order_manager',
      'user_manager',
      'blog_manager',           // Quản lý Blog
      'blog_editor',            // Biên tập viên Blog
      'ecommerce_manager',      // Quản lý E-commerce
      'page_builder_manager'    // Quản lý Page Builder
    ];
    
    const hasAdminRole = user.roles.some(role => 
      adminRoles.includes(role.name.toLowerCase())
    );
    
    if (hasAdminRole) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permissionName: string): boolean {
  if (!user) return false;
  
  // ADMIN roleType has all permissions
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  // Check direct permissions
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.some(p => p.name === permissionName);
  }
  
  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissionNames: string[]): boolean {
  if (!user) return false;
  
  // ADMIN roleType has all permissions
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  if (user.permissions && user.permissions.length > 0) {
    return permissionNames.some(name => 
      user.permissions!.some(p => p.name === name)
    );
  }
  
  return false;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false;
  
  if (user.roles && user.roles.length > 0) {
    return user.roles.some(role => 
      role.name.toLowerCase() === roleName.toLowerCase()
    );
  }
  
  return false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roleNames: string[]): boolean {
  if (!user) return false;
  
  if (user.roles && user.roles.length > 0) {
    return roleNames.some(name => 
      user.roles!.some(role => 
        role.name.toLowerCase() === name.toLowerCase()
      )
    );
  }
  
  return false;
}

/**
 * Check if user can access specific resource
 * Example: canAccessResource(user, 'blog', 'read')
 */
export function canAccessResource(
  user: User | null, 
  resource: string, 
  action: string
): boolean {
  if (!user) return false;
  
  // ADMIN roleType has all permissions
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.some(p => 
      p.resource === resource && p.action === action
    );
  }
  
  return false;
}

/**
 * Get user's display role name
 */
export function getUserDisplayRole(user: User | null): string {
  if (!user) return 'Guest';
  
  if (user.roleType === 'ADMIN') {
    return 'Administrator';
  }
  
  if (user.roles && user.roles.length > 0) {
    // Return first role's display name
    const firstRole = user.roles[0];
    return firstRole.displayName || firstRole.name;
  }
  
  return user.roleType || 'User';
}
