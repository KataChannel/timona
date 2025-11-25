// RBAC Types
export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  scope?: string;
  category: string;
  conditions?: any;
  metadata?: any;
  isActive: boolean;
  isSystemPerm: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  priority: number;
  metadata?: any;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: RolePermission[];
  children?: Role[];
}

export interface RolePermission {
  id: string;
  effect: 'allow' | 'deny';
  conditions?: any;
  metadata?: any;
  permission: Permission;
}

export interface UserRoleAssignment {
  id: string;
  effect: 'allow' | 'deny';
  conditions?: any;
  metadata?: any;
  role: Role;
}

export interface UserPermission {
  id: string;
  effect: 'allow' | 'deny';
  conditions?: any;
  metadata?: any;
  permission: Permission;
}

export interface UserRolePermissionSummary {
  userId: string;
  directPermissions: UserPermission[];
  roleAssignments: UserRoleAssignment[];
  effectivePermissions: string[];
  summary: {
    totalDirectPermissions: number;
    totalRoleAssignments: number;
    totalEffectivePermissions: number;
    lastUpdated: string;
  };
}

// Search Results
export interface PermissionSearchResult {
  permissions: Permission[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface RoleSearchResult {
  roles: Role[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Input Types
export interface PermissionSearchInput {
  search?: string;
  resource?: string;
  action?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleSearchInput {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  isSystemRole?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePermissionInput {
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

export interface UpdatePermissionInput {
  name?: string;
  displayName?: string;
  description?: string;
  resource?: string;
  action?: string;
  scope?: string;
  category?: string;
  conditions?: any;
  metadata?: any;
  isActive?: boolean;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  parentId?: string;
  priority?: number;
  metadata?: any;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  displayName?: string;
  description?: string;
  parentId?: string;
  priority?: number;
  metadata?: any;
  isActive?: boolean;
}

export interface AssignRolePermissionInput {
  roleId: string;
  assignments: {
    permissionId: string;
    effect: 'allow' | 'deny';
    conditions?: any;
    metadata?: any;
  }[];
}

export interface AssignUserRoleInput {
  userId: string;
  assignments: {
    roleId: string;
    effect: 'allow' | 'deny';
    conditions?: any;
    metadata?: any;
  }[];
}

export interface AssignUserPermissionInput {
  userId: string;
  assignments: {
    permissionId: string;
    effect: 'allow' | 'deny';
    conditions?: any;
    metadata?: any;
  }[];
}

// UI Helper Types
export interface RolePermissionTableRow {
  permission: Permission;
  effect: 'allow' | 'deny' | null;
  isInherited?: boolean;
  source?: string;
}

export interface UserRoleTableRow {
  role: Role;
  effect: 'allow' | 'deny' | null;
  isAssigned: boolean;
  assignmentId?: string;
}

export interface UserPermissionTableRow {
  permission: Permission;
  effect: 'allow' | 'deny' | null;
  isDirectAssignment: boolean;
  source: 'direct' | 'role';
  sourceRole?: string;
}