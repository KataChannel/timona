import { RbacService } from '../services/rbac.service';
import { SecurityAuditService } from '../services/security-audit.service';
import { CreateRoleDto, CreatePermissionDto, AssignRoleDto, GrantPermissionDto, CheckPermissionDto } from '../dto/rbac.types';
export declare class RbacController {
    private readonly rbacService;
    private readonly auditService;
    constructor(rbacService: RbacService, auditService: SecurityAuditService);
    createRole(req: any, createRoleDto: CreateRoleDto): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").RoleWithPermissions;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAllRoles(req: any, includeInactive?: string): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").RoleWithPermissions[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRoleHierarchy(req: any): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").RoleWithPermissions[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getRoleById(req: any, roleId: string): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").RoleWithPermissions;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateRole(req: any, roleId: string, updateRoleDto: Partial<CreateRoleDto>): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").RoleWithPermissions;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deleteRole(req: any, roleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    createPermission(req: any, createPermissionDto: CreatePermissionDto): Promise<{
        success: boolean;
        data: {
            category: string;
            id: string;
            createdAt: Date;
            isActive: boolean;
            action: string;
            name: string;
            updatedAt: Date;
            displayName: string;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: string | null;
            scope: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            resource: string;
            isSystemPerm: boolean;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAllPermissions(req: any, category?: string, resource?: string): Promise<{
        success: boolean;
        data: {
            category: string;
            id: string;
            createdAt: Date;
            isActive: boolean;
            action: string;
            name: string;
            updatedAt: Date;
            displayName: string;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: string | null;
            scope: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            resource: string;
            isSystemPerm: boolean;
        }[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getPermissionById(req: any, permissionId: string): Promise<{
        success: boolean;
        data: {
            category: string;
            id: string;
            createdAt: Date;
            isActive: boolean;
            action: string;
            name: string;
            updatedAt: Date;
            displayName: string;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: string | null;
            scope: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            resource: string;
            isSystemPerm: boolean;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updatePermission(req: any, permissionId: string, updatePermissionDto: Partial<CreatePermissionDto>): Promise<{
        success: boolean;
        data: {
            category: string;
            id: string;
            createdAt: Date;
            isActive: boolean;
            action: string;
            name: string;
            updatedAt: Date;
            displayName: string;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: string | null;
            scope: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            resource: string;
            isSystemPerm: boolean;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deletePermission(req: any, permissionId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    assignPermissionsToRole(req: any, roleId: string, body: {
        permissionIds: string[];
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    removePermissionsFromRole(req: any, roleId: string, body: {
        permissionIds: string[];
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    assignRoleToUser(req: any, userId: string, assignRoleDto: Omit<AssignRoleDto, 'userId'>): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            expiresAt: Date | null;
            userId: string;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            effect: string;
            scope: string | null;
            assignedBy: string | null;
            assignedAt: Date;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            roleId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    removeRoleFromUser(req: any, userId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    grantPermissionToUser(req: any, userId: string, grantPermissionDto: Omit<GrantPermissionDto, 'userId'>): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            expiresAt: Date | null;
            userId: string;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            effect: string;
            scope: string | null;
            assignedBy: string | null;
            assignedAt: Date;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            permissionId: string;
            reason: string | null;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    revokePermissionFromUser(req: any, userId: string, permissionId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    checkPermission(req: any, checkPermissionDto: Omit<CheckPermissionDto, 'userId'>): Promise<{
        success: boolean;
        data: {
            hasPermission: boolean;
            userId: any;
            resource: string;
            action: string;
            scope: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getUserRoleInfo(req: any, userId: string): Promise<{
        success: boolean;
        data: import("../dto/rbac.types").UserRoleInfo;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
