import { Cache } from 'cache-manager';
export declare class RBACCacheService {
    private cacheManager;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(cacheManager: Cache);
    getUserPermissions(userId: string): Promise<any[] | null>;
    setUserPermissions(userId: string, permissions: any[]): Promise<void>;
    getUserRoles(userId: string): Promise<any[] | null>;
    setUserRoles(userId: string, roles: any[]): Promise<void>;
    getRolePermissions(roleId: string): Promise<any[] | null>;
    setRolePermissions(roleId: string, permissions: any[]): Promise<void>;
    invalidateUserPermissions(userId: string): Promise<void>;
    invalidateUserRoles(userId: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
    invalidateRolePermissions(roleId: string): Promise<void>;
    invalidateUsersWithRole(userIds: string[]): Promise<void>;
    clearAllRBACCache(): Promise<void>;
}
