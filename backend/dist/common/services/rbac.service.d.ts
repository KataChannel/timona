import { PrismaService } from '../../prisma/prisma.service';
import { RBACCacheService } from './rbac-cache.service';
import { AuditLogService } from './audit-log.service';
export declare class RBACService {
    private prisma;
    private cacheService;
    private auditLogService;
    constructor(prisma: PrismaService, cacheService: RBACCacheService, auditLogService: AuditLogService);
    getAllRoles(): Promise<({
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
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
        } & {
            id: string;
            createdAt: Date;
            expiresAt: Date | null;
            updatedAt: Date;
            effect: string;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            roleId: string;
            permissionId: string;
            grantedBy: string | null;
            grantedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        displayName: string;
        description: string | null;
        parentId: string | null;
        isSystemRole: boolean;
        priority: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdBy: string | null;
    })[]>;
    getRoleById(roleId: string): Promise<{
        userRoles: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
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
        })[];
        permissions: ({
            permission: {
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
        } & {
            id: string;
            createdAt: Date;
            expiresAt: Date | null;
            updatedAt: Date;
            effect: string;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
            roleId: string;
            permissionId: string;
            grantedBy: string | null;
            grantedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        displayName: string;
        description: string | null;
        parentId: string | null;
        isSystemRole: boolean;
        priority: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdBy: string | null;
    }>;
    getAllPermissions(): Promise<Record<string, {
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
    }[]>>;
    getUserRoles(userId: string): Promise<any[]>;
    getUserPermissions(userId: string): Promise<any[]>;
    assignRoleToUser(userId: string, roleId: string, assignedBy?: string, expiresAt?: Date): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        role: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            displayName: string;
            description: string | null;
            parentId: string | null;
            isSystemRole: boolean;
            priority: number;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: string | null;
        };
    } & {
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
    }>;
    removeRoleFromUser(userId: string, roleId: string, currentUserId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    userHasPermission(userId: string, resource: string, action: string, scope?: string): Promise<boolean>;
    getUsersByRole(roleId: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
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
    })[]>;
}
