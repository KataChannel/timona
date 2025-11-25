export declare class PermissionType {
    id: string;
    name: string;
    displayName: string;
    resource: string;
    action: string;
    scope: string | null;
    category: string | null;
    description: string | null;
    isSystemPerm: boolean;
    isActive: boolean;
    source?: string;
    roleName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RoleType {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    isSystemRole: boolean;
    isActive: boolean;
    priority: number;
    parentId: string | null;
    permissions?: RolePermissionType[];
    userRoles?: UserRoleAssignmentType[];
    userCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RolePermissionType {
    id: string;
    roleId: string;
    permissionId: string;
    effect: string;
    expiresAt: Date | null;
    permission: PermissionType;
    createdAt: Date;
}
export declare class UserBasicType {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    isActive: boolean;
}
export declare class UserRoleAssignmentType {
    id: string;
    userId: string;
    roleId: string;
    effect: string;
    assignedBy: string | null;
    assignedAt: Date;
    expiresAt: Date | null;
    role?: RoleType;
    user?: UserBasicType;
}
export declare class RemoveRoleResultType {
    success: boolean;
    message: string;
}
export declare class PermissionsByCategoryType {
    data: Record<string, PermissionType[]>;
}
export declare class RoleSearchResultType {
    roles: RoleType[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class PermissionSearchResultType {
    permissions: PermissionType[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
