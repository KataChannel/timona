export declare class Permission {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    resource: string;
    action: string;
    scope?: string;
    isSystemPerm: boolean;
    isActive: boolean;
    category: string;
    conditions?: any;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RolePermission {
    id: string;
    effect: string;
    permission: Permission;
    conditions?: any;
    metadata?: any;
}
export declare class Role {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    parentId?: string;
    parent?: Role;
    children: Role[];
    isSystemRole: boolean;
    isActive: boolean;
    priority: number;
    metadata?: any;
    permissions: RolePermission[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserRoleAssignment {
    id: string;
    userId: string;
    roleId: string;
    effect: string;
    scope?: string;
    assignedBy?: string;
    assignedAt: Date;
    expiresAt?: Date;
    conditions?: any;
    metadata?: any;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserPermission {
    id: string;
    userId: string;
    permissionId: string;
    effect: string;
    scope?: string;
    assignedBy?: string;
    assignedAt: Date;
    expiresAt?: Date;
    reason?: string;
    conditions?: any;
    metadata?: any;
    permission: Permission;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RoleSearchResult {
    roles: Role[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class PermissionSearchResult {
    permissions: Permission[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class UserSummary {
    totalDirectPermissions: number;
    totalRoleAssignments: number;
    totalEffectivePermissions: number;
    lastUpdated: Date;
}
export declare class UserRolePermissionSummary {
    userId: string;
    roleAssignments: UserRoleAssignment[];
    directPermissions: UserPermission[];
    effectivePermissions: Permission[];
    summary: UserSummary;
}
