export declare const SCOPE_HIERARCHY: {
    readonly own: 1;
    readonly team: 2;
    readonly organization: 3;
    readonly all: 4;
};
export type ScopeLevel = keyof typeof SCOPE_HIERARCHY;
export declare function scopeIncludes(userScope: string | undefined, requiredScope: string | undefined): boolean;
export declare function getIncludedScopes(scope: string): string[];
export declare const RBAC_ERROR_MESSAGES: {
    readonly INSUFFICIENT_PERMISSIONS: "You do not have permission to access this resource";
    readonly ROLE_NOT_FOUND: "Role not found";
    readonly PERMISSION_NOT_FOUND: "Permission not found";
    readonly USER_NOT_FOUND: "User not found";
    readonly ROLE_ALREADY_ASSIGNED: "Role already assigned to user";
    readonly INVALID_SCOPE: "Invalid scope specified";
    readonly OWNERSHIP_REQUIRED: "You can only access your own resources";
    readonly ADMIN_REQUIRED: "Admin role required for this action";
};
