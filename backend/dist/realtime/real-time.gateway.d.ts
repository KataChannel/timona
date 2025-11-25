import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '@prisma/client';
import { PresenceService } from './presence.service';
import { CollaborationService } from './collaboration.service';
import { RealTimeNotificationService } from './real-time-notification.service';
interface AuthenticatedSocket extends Socket {
    user?: User;
}
export declare class RealTimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private presenceService;
    private collaborationService;
    private notificationService;
    server: Server;
    private readonly logger;
    constructor(presenceService: PresenceService, collaborationService: CollaborationService, notificationService: RealTimeNotificationService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinTask(client: AuthenticatedSocket, data: {
        taskId: string;
    }): Promise<void>;
    handleLeaveTask(client: AuthenticatedSocket, data: {
        taskId: string;
    }): Promise<void>;
    handleTaskEditStart(client: AuthenticatedSocket, data: {
        taskId: string;
        field: string;
    }): Promise<void>;
    handleTaskEditStop(client: AuthenticatedSocket, data: {
        taskId: string;
        field: string;
    }): Promise<void>;
    handleTaskEditTyping(client: AuthenticatedSocket, data: {
        taskId: string;
        field: string;
        content: string;
    }): Promise<void>;
    handleTaskEditOperation(client: AuthenticatedSocket, data: {
        taskId: string;
        operation: {
            type: 'insert' | 'delete' | 'retain';
            position: number;
            content?: string;
            length?: number;
        };
        version: number;
    }): Promise<void>;
    handleNotificationSubscribe(client: AuthenticatedSocket, data: {
        types: string[];
    }): Promise<void>;
    broadcastToTask(taskId: string, event: string, data: any): Promise<void>;
    broadcastToUser(userId: string, event: string, data: any): Promise<void>;
    broadcastToRoom(room: string, event: string, data: any): Promise<void>;
    private extractUserFromSocket;
    private validateJwtToken;
    private getUserById;
}
export {};
