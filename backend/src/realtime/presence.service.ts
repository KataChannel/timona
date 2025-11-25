import { Injectable, Logger } from '@nestjs/common';
import { AdvancedCacheService } from '../common/services/advanced-cache.service';

export interface UserPresence {
  userId: string;
  userName: string;
  userEmail: string;
  socketId: string;
  joinedAt: Date;
  lastActivity: Date;
  status: 'active' | 'idle' | 'away';
}

export interface TaskPresence {
  taskId: string;
  users: UserPresence[];
  editingFields: Record<string, UserPresence>;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  
  // In-memory presence tracking for fast access
  private connectedUsers = new Map<string, Set<string>>(); // userId -> socketIds
  private taskPresence = new Map<string, Map<string, UserPresence>>(); // taskId -> userId -> presence
  private editingSessions = new Map<string, Set<string>>(); // taskId:field -> userIds

  constructor(private cacheService: AdvancedCacheService) {}

  async userConnected(userId: string, socketId: string): Promise<void> {
    try {
      // Track connection in memory
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socketId);

      // Cache presence in Redis with TTL
      await this.cacheService.set(
        `presence:user:${userId}:socket:${socketId}`,
        { userId, socketId, connectedAt: new Date() },
        { layer: 'L1_FAST', ttl: 300 }
      );

      this.logger.debug(`User ${userId} connected with socket ${socketId}`);
    } catch (error) {
      this.logger.error(`Error tracking user connection: ${error.message}`);
    }
  }

  async userDisconnected(userId: string, socketId: string): Promise<void> {
    try {
      // Remove from in-memory tracking
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }

      // Clean up from all task presence
      for (const [taskId, users] of this.taskPresence) {
        if (users.has(userId)) {
          const presence = users.get(userId);
          if (presence && presence.socketId === socketId) {
            users.delete(userId);
            await this.updateTaskPresenceCache(taskId);
          }
        }
      }

      // Clean up editing sessions
      for (const [key, userIds] of this.editingSessions) {
        userIds.delete(userId);
        if (userIds.size === 0) {
          this.editingSessions.delete(key);
        }
      }

      // Remove from Redis
      await this.cacheService.delete(
        `presence:user:${userId}:socket:${socketId}`,
        { layer: 'L1_FAST' }
      );

      this.logger.debug(`User ${userId} disconnected socket ${socketId}`);
    } catch (error) {
      this.logger.error(`Error cleaning up user disconnection: ${error.message}`);
    }
  }

  async joinTask(userId: string, taskId: string, socketId: string): Promise<void> {
    try {
      // Get user info for presence
      const userInfo = await this.getUserInfo(userId);
      
      const presence: UserPresence = {
        userId,
        userName: userInfo.name || userInfo.username,
        userEmail: userInfo.email,
        socketId,
        joinedAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
      };

      // Track in memory
      if (!this.taskPresence.has(taskId)) {
        this.taskPresence.set(taskId, new Map());
      }
      this.taskPresence.get(taskId)!.set(userId, presence);

      // Update cache
      await this.updateTaskPresenceCache(taskId);

      this.logger.debug(`User ${userId} joined task ${taskId}`);
    } catch (error) {
      this.logger.error(`Error joining task: ${error.message}`);
    }
  }

  async leaveTask(userId: string, taskId: string, socketId: string): Promise<void> {
    try {
      // Remove from in-memory tracking
      const taskUsers = this.taskPresence.get(taskId);
      if (taskUsers && taskUsers.has(userId)) {
        const presence = taskUsers.get(userId);
        if (presence && presence.socketId === socketId) {
          taskUsers.delete(userId);
          
          // Clean up task presence if no users left
          if (taskUsers.size === 0) {
            this.taskPresence.delete(taskId);
          }
        }
      }

      // Clean up editing sessions for this task
      const editingKeys = Array.from(this.editingSessions.keys())
        .filter(key => key.startsWith(`${taskId}:`));
      
      for (const key of editingKeys) {
        this.editingSessions.get(key)?.delete(userId);
        if (this.editingSessions.get(key)?.size === 0) {
          this.editingSessions.delete(key);
        }
      }

      // Update cache
      await this.updateTaskPresenceCache(taskId);

      this.logger.debug(`User ${userId} left task ${taskId}`);
    } catch (error) {
      this.logger.error(`Error leaving task: ${error.message}`);
    }
  }

  async getTaskPresence(taskId: string): Promise<UserPresence[]> {
    try {
      // Try cache first
      const cached = await this.cacheService.get<UserPresence[]>(
        `presence:task:${taskId}`,
        { layer: 'L2_MEDIUM' }
      );
      
      if (cached) {
        return cached;
      }

      // Fallback to in-memory data
      const taskUsers = this.taskPresence.get(taskId);
      if (!taskUsers) {
        return [];
      }

      const presence = Array.from(taskUsers.values())
        .filter(p => this.isUserStillConnected(p.userId, p.socketId));

      // Cache the result
      await this.cacheService.set(
        `presence:task:${taskId}`,
        presence,
        { layer: 'L2_MEDIUM', ttl: 60 }
      );

      return presence;
    } catch (error) {
      this.logger.error(`Error getting task presence: ${error.message}`);
      return [];
    }
  }

  async startEditing(userId: string, taskId: string, field: string): Promise<void> {
    try {
      const key = `${taskId}:${field}`;
      
      if (!this.editingSessions.has(key)) {
        this.editingSessions.set(key, new Set());
      }
      this.editingSessions.get(key)!.add(userId);

      // Update user activity
      await this.updateUserActivity(userId, taskId);

      // Cache editing status
      await this.cacheService.set(
        `editing:${key}`,
        Array.from(this.editingSessions.get(key)!),
        { layer: 'L1_FAST', ttl: 300 }
      );

      this.logger.debug(`User ${userId} started editing ${field} in task ${taskId}`);
    } catch (error) {
      this.logger.error(`Error tracking edit start: ${error.message}`);
    }
  }

  async stopEditing(userId: string, taskId: string, field: string): Promise<void> {
    try {
      const key = `${taskId}:${field}`;
      
      const editingUsers = this.editingSessions.get(key);
      if (editingUsers) {
        editingUsers.delete(userId);
        
        if (editingUsers.size === 0) {
          this.editingSessions.delete(key);
          await this.cacheService.delete(`editing:${key}`, { layer: 'L1_FAST' });
        } else {
          await this.cacheService.set(
            `editing:${key}`,
            Array.from(editingUsers),
            { layer: 'L1_FAST', ttl: 300 }
          );
        }
      }

      // Update user activity
      await this.updateUserActivity(userId, taskId);

      this.logger.debug(`User ${userId} stopped editing ${field} in task ${taskId}`);
    } catch (error) {
      this.logger.error(`Error tracking edit stop: ${error.message}`);
    }
  }

  async getEditingUsers(taskId: string, field: string): Promise<string[]> {
    const key = `${taskId}:${field}`;
    return Array.from(this.editingSessions.get(key) || []);
  }

  async updateUserActivity(userId: string, taskId: string): Promise<void> {
    try {
      const taskUsers = this.taskPresence.get(taskId);
      if (taskUsers && taskUsers.has(userId)) {
        const presence = taskUsers.get(userId)!;
        presence.lastActivity = new Date();
        presence.status = 'active';
      }

      await this.updateTaskPresenceCache(taskId);
    } catch (error) {
      this.logger.error(`Error updating user activity: ${error.message}`);
    }
  }

  async getConnectedUsers(): Promise<Map<string, Set<string>>> {
    return new Map(this.connectedUsers);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  async getUserPresenceInTask(userId: string, taskId: string): Promise<UserPresence | null> {
    const taskUsers = this.taskPresence.get(taskId);
    return taskUsers?.get(userId) || null;
  }

  // Cleanup idle connections
  async cleanupIdleConnections(): Promise<void> {
    try {
      const now = new Date();
      const idleThreshold = 10 * 60 * 1000; // 10 minutes

      for (const [taskId, users] of this.taskPresence) {
        const activeUsers = new Map();
        
        for (const [userId, presence] of users) {
          const timeSinceActivity = now.getTime() - presence.lastActivity.getTime();
          
          if (timeSinceActivity < idleThreshold) {
            // Update status based on activity
            if (timeSinceActivity > 5 * 60 * 1000) { // 5 minutes
              presence.status = 'idle';
            } else if (timeSinceActivity > 2 * 60 * 1000) { // 2 minutes
              presence.status = 'away';
            } else {
              presence.status = 'active';
            }
            
            activeUsers.set(userId, presence);
          }
        }
        
        this.taskPresence.set(taskId, activeUsers);
        await this.updateTaskPresenceCache(taskId);
      }

      this.logger.debug('Completed idle connection cleanup');
    } catch (error) {
      this.logger.error(`Error during cleanup: ${error.message}`);
    }
  }

  private async updateTaskPresenceCache(taskId: string): Promise<void> {
    try {
      const taskUsers = this.taskPresence.get(taskId);
      const presence = taskUsers ? Array.from(taskUsers.values()) : [];
      
      await this.cacheService.set(
        `presence:task:${taskId}`,
        presence,
        { layer: 'L2_MEDIUM', ttl: 60 }
      );
    } catch (error) {
      this.logger.error(`Error updating presence cache: ${error.message}`);
    }
  }

  private isUserStillConnected(userId: string, socketId: string): boolean {
    const userSockets = this.connectedUsers.get(userId);
    return userSockets ? userSockets.has(socketId) : false;
  }

  private async getUserInfo(userId: string): Promise<{ name?: string; username: string; email: string }> {
    // Cache user info for presence
    const cached = await this.cacheService.get<any>(
      `user:info:${userId}`,
      { layer: 'L3_SLOW' }
    );
    
    if (cached) {
      return cached;
    }

    // In a real implementation, fetch from database
    // For now, return a placeholder
    const userInfo = {
      username: `user_${userId}`,
      email: `user_${userId}@example.com`,
      name: `User ${userId}`,
    };

    // Cache for 1 hour
    await this.cacheService.set(
      `user:info:${userId}`,
      userInfo,
      { layer: 'L3_SLOW', ttl: 3600 }
    );

    return userInfo;
  }
}