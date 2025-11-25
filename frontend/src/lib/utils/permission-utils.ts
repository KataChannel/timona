/**
 * Permission checking utility for navigation menu
 * Kiểm tra quyền truy cập menu dựa trên role và permissions của user
 */

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  resource?: string;
  action?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  roleType?: string;
  email?: string;
  username?: string;
  roles?: Role[];
  permissions?: Permission[];
}

export interface MenuItem {
  id?: string;
  title?: string;
  name?: string;  // Support both title (database) and name (static)
  requiredRoles?: string[] | string;  // Can be array or JSON string from database
  requiredPermissions?: string[] | string;  // Can be array or JSON string from database
  isPublic?: boolean;
  route?: string | null;
  url?: string | null;
  externalUrl?: string | null;
  href?: string;  // Support href from static navigation
  icon?: any;  // Support icon from static navigation
  children?: MenuItem[];
}

/**
 * Get user's role names from their role assignments
 * Normalizes roleType to lowercase for consistent matching
 */
export function getUserRoleNames(user: User | null | undefined): string[] {
  if (!user) return [];
  
  const roleNames: string[] = [];
  
  // Add roleType (legacy) - normalize to lowercase
  if (user.roleType) {
    const normalizedRoleType = user.roleType.toLowerCase();
    roleNames.push(normalizedRoleType);
    // Map ADMIN roleType to role names
    if (normalizedRoleType === 'admin') {
      if (!roleNames.includes('admin')) roleNames.push('admin');
      if (!roleNames.includes('super_admin')) roleNames.push('super_admin');
    }
  }
  
  // Add assigned roles from database - normalize to lowercase
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach(role => {
      if (role.name) {
        const normalizedName = role.name.toLowerCase();
        if (!roleNames.includes(normalizedName)) {
          roleNames.push(normalizedName);
        }
      }
    });
  }
  
  return roleNames;
}

/**
 * Get user's permission names from their direct permissions and roles
 */
export function getUserPermissionNames(user: User | null | undefined): string[] {
  if (!user) return [];
  
  const permissionNames: Set<string> = new Set();
  
  // Add direct user permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach(perm => {
      if (perm.name) {
        permissionNames.add(perm.name);
      }
    });
  }
  
  // Add permissions from roles
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(perm => {
          if (perm.name) {
            permissionNames.add(perm.name);
          }
        });
      }
    });
  }
  
  return Array.from(permissionNames);
}

/**
 * Kiểm tra xem user có quyền truy cập menu item không
 * 
 * Rules:
 * 1. Nếu isPublic = true, cho phép truy cập
 * 2. Nếu requiredRoles rỗng và requiredPermissions rỗng, cho phép truy cập
 * 3. Nếu user.roleType = 'ADMIN' hoặc 'admin', cho phép truy cập tất cả
 * 4. Nếu có requiredRoles, user phải có ít nhất một role
 * 5. Nếu có requiredPermissions, user phải có ít nhất một permission
 */
export function canAccessMenuItem(
  user: User | null | undefined,
  menuItem: MenuItem
): boolean {
  // Nếu chưa đăng nhập
  if (!user) {
    return menuItem.isPublic === true;
  }

  // Nếu public, cho phép truy cập
  if (menuItem.isPublic === true) {
    return true;
  }

  // Get user's roles and permissions from database FIRST
  const userRoles = getUserRoleNames(user);
  const userPermissions = getUserPermissionNames(user);

  // Super admin hoặc admin có quyền truy cập tất cả - CHECK EARLY
  if (userRoles.includes('admin') || userRoles.includes('super_admin')) {
    return true;
  }

  // Parse requiredRoles - có thể là array hoặc JSON string từ database
  let requiredRoles: string[] = [];
  if (menuItem.requiredRoles) {
    if (Array.isArray(menuItem.requiredRoles)) {
      requiredRoles = menuItem.requiredRoles.map(r => r.toLowerCase()); // Normalize to lowercase
    } else if (typeof menuItem.requiredRoles === 'string') {
      try {
        const parsed = JSON.parse(menuItem.requiredRoles);
        if (Array.isArray(parsed)) {
          requiredRoles = parsed.map((r: string) => r.toLowerCase()); // Normalize to lowercase
        }
      } catch {
        requiredRoles = [];
      }
    }
  }

  // Parse requiredPermissions - có thể là array hoặc JSON string từ database
  let requiredPermissions: string[] = [];
  if (menuItem.requiredPermissions) {
    if (Array.isArray(menuItem.requiredPermissions)) {
      requiredPermissions = menuItem.requiredPermissions;
    } else if (typeof menuItem.requiredPermissions === 'string') {
      try {
        const parsed = JSON.parse(menuItem.requiredPermissions);
        if (Array.isArray(parsed)) {
          requiredPermissions = parsed;
        }
      } catch {
        requiredPermissions = [];
      }
    }
  }

  // Nếu không có yêu cầu quyền, cho phép truy cập
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    return true;
  }

  // Kiểm tra requiredRoles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(requiredRole => 
      userRoles.includes(requiredRole)
    );
    if (hasRequiredRole) {
      return true;
    }
  }

  // Kiểm tra requiredPermissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(requiredPerm => 
      userPermissions.includes(requiredPerm)
    );
    if (hasRequiredPermission) {
      return true;
    }
  }

  return false;
}

/**
 * Lọc menu items dựa trên quyền của user
 * Recursive function để filter menu và submenu
 */
export function filterMenuByPermissions(
  menus: MenuItem[] | undefined | null,
  user: User | null | undefined
): MenuItem[] {
  if (!menus || !Array.isArray(menus)) {
    return [];
  }

  return menus
    .filter((item) => canAccessMenuItem(user, item))
    .map((item) => ({
      ...item,
      // Recursively filter children
      children: item.children
        ? filterMenuByPermissions(item.children, user)
        : undefined,
    }))
    .filter((item) => {
      // Nếu không có children sau filter, nhưng menu item đó không có URL
      // thì không hiển thị (ví dụ: menu group chỉ dùng để chứa submenu)
      if (
        item.children &&
        item.children.length === 0 &&
        !item.route &&
        !item.url &&
        !item.externalUrl &&
        !item.href  // FIX: Also check href (used by static navigation and transformed menus)
      ) {
        return false;
      }
      return true;
    });
}

/**
 * Debug function - in ra menu structure và quyền
 */
export function debugMenuPermissions(
  menus: MenuItem[] | undefined | null,
  user: User | null | undefined
): void {
  if (!menus) return;

  console.group('🔐 Menu Permissions Debug');
  
  // Show user info
  const userRoles = getUserRoleNames(user);
  const userPermissions = getUserPermissionNames(user);
  
  console.log('User:', {
    id: user?.id,
    email: user?.email,
    roleType: user?.roleType,
  });
  console.log('User Roles from DB:', user?.roles?.map(r => r.name));
  console.log('User Permissions from DB:', user?.permissions?.map(p => p.name));
  console.log('Computed Roles:', userRoles);
  console.log('Computed Permissions:', userPermissions);

  const checkMenu = (items: MenuItem[], level = 0) => {
    items.forEach((item) => {
      const canAccess = canAccessMenuItem(user, item);
      const indent = '  '.repeat(level);
      const status = canAccess ? '✅' : '❌';

      // Parse requiredRoles for display
      let requiredRoles: string[] = [];
      if (item.requiredRoles) {
        if (Array.isArray(item.requiredRoles)) {
          requiredRoles = item.requiredRoles;
        } else if (typeof item.requiredRoles === 'string') {
          try {
            const parsed = JSON.parse(item.requiredRoles);
            requiredRoles = Array.isArray(parsed) ? parsed : [];
          } catch {
            requiredRoles = [];
          }
        }
      }

      // Parse requiredPermissions for display
      let requiredPermissions: string[] = [];
      if (item.requiredPermissions) {
        if (Array.isArray(item.requiredPermissions)) {
          requiredPermissions = item.requiredPermissions;
        } else if (typeof item.requiredPermissions === 'string') {
          try {
            const parsed = JSON.parse(item.requiredPermissions);
            requiredPermissions = Array.isArray(parsed) ? parsed : [];
          } catch {
            requiredPermissions = [];
          }
        }
      }

      const requiredStr = [];
      if (requiredRoles.length) requiredStr.push(`roles: [${requiredRoles.join(', ')}]`);
      if (requiredPermissions.length) requiredStr.push(`perms: [${requiredPermissions.join(', ')}]`);
      
      // Get title from item.title (database) or item.name (static) or fallback to id
      const itemTitle = item.title || item.name || `Menu #${item.id}`;
      
      // DEBUG: Show why item is blocked
      if (!canAccess && level === 0) {
        console.log(`${indent}${status} ${itemTitle} (${requiredStr.join(', ') || 'public'})`);
        console.log(`  Raw item.requiredRoles:`, item.requiredRoles);
        console.log(`  Raw item.requiredPermissions:`, item.requiredPermissions);
        console.log(`  isPublic:`, item.isPublic);
      } else {
        console.log(`${indent}${status} ${itemTitle} (${requiredStr.join(', ') || 'public'})`);
      }

      if (item.children) {
        checkMenu(item.children, level + 1);
      }
    });
  };

  checkMenu(menus);
  console.groupEnd();
}
