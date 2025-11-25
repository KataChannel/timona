export declare const PERMISSIONS_KEY = "permissions";
export interface PermissionRequirement {
    resource: string;
    action: string;
    scope?: string;
}
export declare const RequirePermissions: (...permissions: PermissionRequirement[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const ROLES_KEY = "roles";
export declare const RequireRole: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
