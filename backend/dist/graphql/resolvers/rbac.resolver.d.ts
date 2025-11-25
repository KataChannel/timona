import { Role, Permission, RoleSearchResult, PermissionSearchResult, UserRolePermissionSummary } from '../models/rbac.model';
import { CreateRoleInput, UpdateRoleInput, RoleSearchInput, CreatePermissionInput, UpdatePermissionInput, PermissionSearchInput, AssignRolePermissionInput, AssignUserRoleInput, AssignUserPermissionInput } from '../inputs/rbac.input';
import { RbacService } from '../../services/rbac.service';
export declare class PermissionResolver {
    private readonly rbacService;
    constructor(rbacService: RbacService);
    searchPermissions(input: PermissionSearchInput): Promise<PermissionSearchResult>;
    getPermissionById(id: string): Promise<Permission>;
    createPermission(input: CreatePermissionInput): Promise<Permission>;
    updatePermission(id: string, input: UpdatePermissionInput): Promise<Permission>;
    deletePermission(id: string): Promise<boolean>;
}
export declare class RoleResolver {
    private readonly rbacService;
    constructor(rbacService: RbacService);
    searchRoles(input: RoleSearchInput): Promise<RoleSearchResult>;
    getRoleById(id: string): Promise<Role>;
    createRole(input: CreateRoleInput): Promise<Role>;
    updateRole(id: string, input: UpdateRoleInput): Promise<Role>;
    deleteRole(id: string): Promise<boolean>;
    assignRolePermissions(input: AssignRolePermissionInput): Promise<boolean>;
}
export declare class UserRbacResolver {
    private readonly rbacService;
    constructor(rbacService: RbacService);
    getUserRolePermissions(userId: string): Promise<UserRolePermissionSummary>;
    assignUserRoles(input: AssignUserRoleInput): Promise<boolean>;
    assignUserPermissions(input: AssignUserPermissionInput): Promise<boolean>;
}
