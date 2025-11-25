import { PrismaService } from '../prisma/prisma.service';
import { Permission } from '@prisma/client';
import { CreateRoleInput, UpdateRoleInput, RoleSearchInput, CreatePermissionInput, UpdatePermissionInput, PermissionSearchInput, AssignRolePermissionInput, AssignUserRoleInput, AssignUserPermissionInput } from '../graphql/inputs/rbac.input';
export declare class RbacService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPermissionById(id: string): Promise<Permission>;
    createPermission(input: CreatePermissionInput): Promise<Permission>;
    updatePermission(id: string, input: UpdatePermissionInput): Promise<Permission>;
    deletePermission(id: string): Promise<boolean>;
    searchPermissions(input: PermissionSearchInput): Promise<any>;
    getRoleById(id: string): Promise<any>;
    createRole(input: CreateRoleInput): Promise<any>;
    updateRole(id: string, input: UpdateRoleInput): Promise<any>;
    deleteRole(id: string): Promise<boolean>;
    searchRoles(input: RoleSearchInput): Promise<any>;
    assignRolePermissions(input: AssignRolePermissionInput): Promise<boolean>;
    assignUserRoles(input: AssignUserRoleInput): Promise<boolean>;
    assignUserPermissions(input: AssignUserPermissionInput): Promise<boolean>;
    getUserEffectivePermissions(userId: string): Promise<any>;
    initializeSystemRolePermissions(): Promise<void>;
}
