/**
 * RBAC Cache Service
 * Service để cache permissions và roles của user với Redis
 */

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RBACCacheService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = {
    USER_PERMISSIONS: 'user:permissions:',
    USER_ROLES: 'user:roles:',
    ROLE_PERMISSIONS: 'role:permissions:',
  };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get cached user permissions
   */
  async getUserPermissions(userId: string): Promise<any[] | null> {
    const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
    return await this.cacheManager.get(key);
  }

  /**
   * Set user permissions cache
   */
  async setUserPermissions(userId: string, permissions: any[]): Promise<void> {
    const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
    await this.cacheManager.set(key, permissions, this.CACHE_TTL * 1000);
  }

  /**
   * Get cached user roles
   */
  async getUserRoles(userId: string): Promise<any[] | null> {
    const key = this.CACHE_PREFIX.USER_ROLES + userId;
    return await this.cacheManager.get(key);
  }

  /**
   * Set user roles cache
   */
  async setUserRoles(userId: string, roles: any[]): Promise<void> {
    const key = this.CACHE_PREFIX.USER_ROLES + userId;
    await this.cacheManager.set(key, roles, this.CACHE_TTL * 1000);
  }

  /**
   * Get cached role permissions
   */
  async getRolePermissions(roleId: string): Promise<any[] | null> {
    const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
    return await this.cacheManager.get(key);
  }

  /**
   * Set role permissions cache
   */
  async setRolePermissions(roleId: string, permissions: any[]): Promise<void> {
    const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
    await this.cacheManager.set(key, permissions, this.CACHE_TTL * 1000);
  }

  /**
   * Invalidate user permissions cache
   */
  async invalidateUserPermissions(userId: string): Promise<void> {
    const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
    await this.cacheManager.del(key);
  }

  /**
   * Invalidate user roles cache
   */
  async invalidateUserRoles(userId: string): Promise<void> {
    const key = this.CACHE_PREFIX.USER_ROLES + userId;
    await this.cacheManager.del(key);
  }

  /**
   * Invalidate all user caches (permissions + roles)
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateUserPermissions(userId),
      this.invalidateUserRoles(userId),
    ]);
  }

  /**
   * Invalidate role permissions cache
   */
  async invalidateRolePermissions(roleId: string): Promise<void> {
    const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
    await this.cacheManager.del(key);
  }

  /**
   * Invalidate all users who have this role
   * Called when role permissions change
   */
  async invalidateUsersWithRole(userIds: string[]): Promise<void> {
    await Promise.all(
      userIds.map(userId => this.invalidateUserCache(userId))
    );
  }

  /**
   * Clear all RBAC caches (use with caution)
   * Note: This clears ALL cache, not just RBAC
   */
  async clearAllRBACCache(): Promise<void> {
    // For production, implement Redis SCAN to delete only RBAC keys
    // await this.cacheManager.reset(); // Not available in all cache managers
    console.warn('clearAllRBACCache called - implement Redis SCAN for production');
  }
}
