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
var PresenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const advanced_cache_service_1 = require("../common/services/advanced-cache.service");
let PresenceService = PresenceService_1 = class PresenceService {
    constructor(cacheService) {
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(PresenceService_1.name);
        this.connectedUsers = new Map();
        this.taskPresence = new Map();
        this.editingSessions = new Map();
    }
    async userConnected(userId, socketId) {
        try {
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(socketId);
            await this.cacheService.set(`presence:user:${userId}:socket:${socketId}`, { userId, socketId, connectedAt: new Date() }, { layer: 'L1_FAST', ttl: 300 });
            this.logger.debug(`User ${userId} connected with socket ${socketId}`);
        }
        catch (error) {
            this.logger.error(`Error tracking user connection: ${error.message}`);
        }
    }
    async userDisconnected(userId, socketId) {
        try {
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socketId);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(userId);
                }
            }
            for (const [taskId, users] of this.taskPresence) {
                if (users.has(userId)) {
                    const presence = users.get(userId);
                    if (presence && presence.socketId === socketId) {
                        users.delete(userId);
                        await this.updateTaskPresenceCache(taskId);
                    }
                }
            }
            for (const [key, userIds] of this.editingSessions) {
                userIds.delete(userId);
                if (userIds.size === 0) {
                    this.editingSessions.delete(key);
                }
            }
            await this.cacheService.delete(`presence:user:${userId}:socket:${socketId}`, { layer: 'L1_FAST' });
            this.logger.debug(`User ${userId} disconnected socket ${socketId}`);
        }
        catch (error) {
            this.logger.error(`Error cleaning up user disconnection: ${error.message}`);
        }
    }
    async joinTask(userId, taskId, socketId) {
        try {
            const userInfo = await this.getUserInfo(userId);
            const presence = {
                userId,
                userName: userInfo.name || userInfo.username,
                userEmail: userInfo.email,
                socketId,
                joinedAt: new Date(),
                lastActivity: new Date(),
                status: 'active',
            };
            if (!this.taskPresence.has(taskId)) {
                this.taskPresence.set(taskId, new Map());
            }
            this.taskPresence.get(taskId).set(userId, presence);
            await this.updateTaskPresenceCache(taskId);
            this.logger.debug(`User ${userId} joined task ${taskId}`);
        }
        catch (error) {
            this.logger.error(`Error joining task: ${error.message}`);
        }
    }
    async leaveTask(userId, taskId, socketId) {
        try {
            const taskUsers = this.taskPresence.get(taskId);
            if (taskUsers && taskUsers.has(userId)) {
                const presence = taskUsers.get(userId);
                if (presence && presence.socketId === socketId) {
                    taskUsers.delete(userId);
                    if (taskUsers.size === 0) {
                        this.taskPresence.delete(taskId);
                    }
                }
            }
            const editingKeys = Array.from(this.editingSessions.keys())
                .filter(key => key.startsWith(`${taskId}:`));
            for (const key of editingKeys) {
                this.editingSessions.get(key)?.delete(userId);
                if (this.editingSessions.get(key)?.size === 0) {
                    this.editingSessions.delete(key);
                }
            }
            await this.updateTaskPresenceCache(taskId);
            this.logger.debug(`User ${userId} left task ${taskId}`);
        }
        catch (error) {
            this.logger.error(`Error leaving task: ${error.message}`);
        }
    }
    async getTaskPresence(taskId) {
        try {
            const cached = await this.cacheService.get(`presence:task:${taskId}`, { layer: 'L2_MEDIUM' });
            if (cached) {
                return cached;
            }
            const taskUsers = this.taskPresence.get(taskId);
            if (!taskUsers) {
                return [];
            }
            const presence = Array.from(taskUsers.values())
                .filter(p => this.isUserStillConnected(p.userId, p.socketId));
            await this.cacheService.set(`presence:task:${taskId}`, presence, { layer: 'L2_MEDIUM', ttl: 60 });
            return presence;
        }
        catch (error) {
            this.logger.error(`Error getting task presence: ${error.message}`);
            return [];
        }
    }
    async startEditing(userId, taskId, field) {
        try {
            const key = `${taskId}:${field}`;
            if (!this.editingSessions.has(key)) {
                this.editingSessions.set(key, new Set());
            }
            this.editingSessions.get(key).add(userId);
            await this.updateUserActivity(userId, taskId);
            await this.cacheService.set(`editing:${key}`, Array.from(this.editingSessions.get(key)), { layer: 'L1_FAST', ttl: 300 });
            this.logger.debug(`User ${userId} started editing ${field} in task ${taskId}`);
        }
        catch (error) {
            this.logger.error(`Error tracking edit start: ${error.message}`);
        }
    }
    async stopEditing(userId, taskId, field) {
        try {
            const key = `${taskId}:${field}`;
            const editingUsers = this.editingSessions.get(key);
            if (editingUsers) {
                editingUsers.delete(userId);
                if (editingUsers.size === 0) {
                    this.editingSessions.delete(key);
                    await this.cacheService.delete(`editing:${key}`, { layer: 'L1_FAST' });
                }
                else {
                    await this.cacheService.set(`editing:${key}`, Array.from(editingUsers), { layer: 'L1_FAST', ttl: 300 });
                }
            }
            await this.updateUserActivity(userId, taskId);
            this.logger.debug(`User ${userId} stopped editing ${field} in task ${taskId}`);
        }
        catch (error) {
            this.logger.error(`Error tracking edit stop: ${error.message}`);
        }
    }
    async getEditingUsers(taskId, field) {
        const key = `${taskId}:${field}`;
        return Array.from(this.editingSessions.get(key) || []);
    }
    async updateUserActivity(userId, taskId) {
        try {
            const taskUsers = this.taskPresence.get(taskId);
            if (taskUsers && taskUsers.has(userId)) {
                const presence = taskUsers.get(userId);
                presence.lastActivity = new Date();
                presence.status = 'active';
            }
            await this.updateTaskPresenceCache(taskId);
        }
        catch (error) {
            this.logger.error(`Error updating user activity: ${error.message}`);
        }
    }
    async getConnectedUsers() {
        return new Map(this.connectedUsers);
    }
    async isUserOnline(userId) {
        return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).size > 0;
    }
    async getUserPresenceInTask(userId, taskId) {
        const taskUsers = this.taskPresence.get(taskId);
        return taskUsers?.get(userId) || null;
    }
    async cleanupIdleConnections() {
        try {
            const now = new Date();
            const idleThreshold = 10 * 60 * 1000;
            for (const [taskId, users] of this.taskPresence) {
                const activeUsers = new Map();
                for (const [userId, presence] of users) {
                    const timeSinceActivity = now.getTime() - presence.lastActivity.getTime();
                    if (timeSinceActivity < idleThreshold) {
                        if (timeSinceActivity > 5 * 60 * 1000) {
                            presence.status = 'idle';
                        }
                        else if (timeSinceActivity > 2 * 60 * 1000) {
                            presence.status = 'away';
                        }
                        else {
                            presence.status = 'active';
                        }
                        activeUsers.set(userId, presence);
                    }
                }
                this.taskPresence.set(taskId, activeUsers);
                await this.updateTaskPresenceCache(taskId);
            }
            this.logger.debug('Completed idle connection cleanup');
        }
        catch (error) {
            this.logger.error(`Error during cleanup: ${error.message}`);
        }
    }
    async updateTaskPresenceCache(taskId) {
        try {
            const taskUsers = this.taskPresence.get(taskId);
            const presence = taskUsers ? Array.from(taskUsers.values()) : [];
            await this.cacheService.set(`presence:task:${taskId}`, presence, { layer: 'L2_MEDIUM', ttl: 60 });
        }
        catch (error) {
            this.logger.error(`Error updating presence cache: ${error.message}`);
        }
    }
    isUserStillConnected(userId, socketId) {
        const userSockets = this.connectedUsers.get(userId);
        return userSockets ? userSockets.has(socketId) : false;
    }
    async getUserInfo(userId) {
        const cached = await this.cacheService.get(`user:info:${userId}`, { layer: 'L3_SLOW' });
        if (cached) {
            return cached;
        }
        const userInfo = {
            username: `user_${userId}`,
            email: `user_${userId}@example.com`,
            name: `User ${userId}`,
        };
        await this.cacheService.set(`user:info:${userId}`, userInfo, { layer: 'L3_SLOW', ttl: 3600 });
        return userInfo;
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = PresenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService])
], PresenceService);
//# sourceMappingURL=presence.service.js.map