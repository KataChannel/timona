export declare class CreatePermissionInput {
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
export declare class UpdatePermissionInput {
    displayName?: string;
    description?: string;
    scope?: string;
    isActive?: boolean;
    category?: string;
    conditions?: any;
    metadata?: any;
}
export declare class PermissionSearchInput {
    search?: string;
    resource?: string;
    action?: string;
    category?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class CreateRoleInput {
    name: string;
    displayName: string;
    description?: string;
    parentId?: string;
    priority?: number;
    metadata?: any;
    permissionIds?: string[];
}
export declare class UpdateRoleInput {
    displayName?: string;
    description?: string;
    parentId?: string;
    isActive?: boolean;
    priority?: number;
    metadata?: any;
}
export declare class RoleSearchInput {
    search?: string;
    isActive?: boolean;
    parentId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class AssignRolePermissionInput {
    roleId: string;
    permissionIds: string[];
    effect?: string;
    conditions?: any;
    expiresAt?: Date;
}
export declare class RoleAssignmentInput {
    roleId: string;
    effect: string;
    conditions?: any;
    metadata?: any;
}
export declare class AssignUserRoleInput {
    userId: string;
    assignments: RoleAssignmentInput[];
}
export declare class PermissionAssignmentInput {
    permissionId: string;
    effect: string;
    conditions?: any;
    metadata?: any;
}
export declare class AssignUserPermissionInput {
    userId: string;
    assignments: PermissionAssignmentInput[];
}
