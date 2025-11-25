"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let RBACCacheService = class RBACCacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.CACHE_TTL = 300;
        this.CACHE_PREFIX = {
            USER_PERMISSIONS: 'user:permissions:',
            USER_ROLES: 'user:roles:',
            ROLE_PERMISSIONS: 'role:permissions:',
        };
    }
    async getUserPermissions(userId) {
        const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
        return await this.cacheManager.get(key);
    }
    async setUserPermissions(userId, permissions) {
        const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
        await this.cacheManager.set(key, permissions, this.CACHE_TTL * 1000);
    }
    async getUserRoles(userId) {
        const key = this.CACHE_PREFIX.USER_ROLES + userId;
        return await this.cacheManager.get(key);
    }
    async setUserRoles(userId, roles) {
        const key = this.CACHE_PREFIX.USER_ROLES + userId;
        await this.cacheManager.set(key, roles, this.CACHE_TTL * 1000);
    }
    async getRolePermissions(roleId) {
        const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
        return await this.cacheManager.get(key);
    }
    async setRolePermissions(roleId, permissions) {
        const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
        await this.cacheManager.set(key, permissions, this.CACHE_TTL * 1000);
    }
    async invalidateUserPermissions(userId) {
        const key = this.CACHE_PREFIX.USER_PERMISSIONS + userId;
        await this.cacheManager.del(key);
    }
    async invalidateUserRoles(userId) {
        const key = this.CACHE_PREFIX.USER_ROLES + userId;
        await this.cacheManager.del(key);
    }
    async invalidateUserCache(userId) {
        await Promise.all([
            this.invalidateUserPermissions(userId),
            this.invalidateUserRoles(userId),
        ]);
    }
    async invalidateRolePermissions(roleId) {
        const key = this.CACHE_PREFIX.ROLE_PERMISSIONS + roleId;
        await this.cacheManager.del(key);
    }
    async invalidateUsersWithRole(userIds) {
        await Promise.all(userIds.map(userId => this.invalidateUserCache(userId)));
    }
    async clearAllRBACCache() {
        console.warn('clearAllRBACCache called - implement Redis SCAN for production');
    }
};
exports.RBACCacheService = RBACCacheService;
exports.RBACCacheService = RBACCacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RBACCacheService);
//# sourceMappingURL=rbac-cache.service.js.map