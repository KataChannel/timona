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
export declare class PresenceService {
    private cacheService;
    private readonly logger;
    private connectedUsers;
    private taskPresence;
    private editingSessions;
    constructor(cacheService: AdvancedCacheService);
    userConnected(userId: string, socketId: string): Promise<void>;
    userDisconnected(userId: string, socketId: string): Promise<void>;
    joinTask(userId: string, taskId: string, socketId: string): Promise<void>;
    leaveTask(userId: string, taskId: string, socketId: string): Promise<void>;
    getTaskPresence(taskId: string): Promise<UserPresence[]>;
    startEditing(userId: string, taskId: string, field: string): Promise<void>;
    stopEditing(userId: string, taskId: string, field: string): Promise<void>;
    getEditingUsers(taskId: string, field: string): Promise<string[]>;
    updateUserActivity(userId: string, taskId: string): Promise<void>;
    getConnectedUsers(): Promise<Map<string, Set<string>>>;
    isUserOnline(userId: string): Promise<boolean>;
    getUserPresenceInTask(userId: string, taskId: string): Promise<UserPresence | null>;
    cleanupIdleConnections(): Promise<void>;
    private updateTaskPresenceCache;
    private isUserStillConnected;
    private getUserInfo;
}
