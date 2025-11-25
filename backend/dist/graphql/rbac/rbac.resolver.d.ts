import { RBACService } from '../../common/services/rbac.service';
export declare class RBACResolver {
    private rbacService;
    constructor(rbacService: RBACService);
    myPermissions(user: any): Promise<any[]>;
    myRoles(user: any): Promise<any[]>;
    checkMyPermission(user: any, resource: string, action: string, scope?: string): Promise<boolean>;
    roles(): Promise<({
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
    role(id: string): Promise<{
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
    permissions(): Promise<{
        data: Record<string, {
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
        }[]>;
    }>;
    assignRoleToUser(currentUser: any, userId: string, roleId: string, expiresAt?: Date): Promise<{
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
    removeRoleFromUser(userId: string, roleId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    usersByRole(roleId: string): Promise<({
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
    checkUserPermission(userId: string, resource: string, action: string, scope?: string): Promise<boolean>;
}
