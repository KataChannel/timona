import { 
  WebSocketGateway, 
  SubscribeMessage, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { PresenceService } from './presence.service';
import { CollaborationService } from './collaboration.service';
import { RealTimeNotificationService } from './real-time-notification.service';

interface AuthenticatedSocket extends Socket {
  user?: User;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'development' ? /.*/: (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  namespace: '/realtime'
})
export class RealTimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealTimeGateway.name);

  constructor(
    private presenceService: PresenceService,
    private collaborationService: CollaborationService,
    private notificationService: RealTimeNotificationService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user from JWT token
      const user = await this.extractUserFromSocket(client);
      if (!user) {
        client.disconnect();
        return;
      }

      client.user = user;
      await this.presenceService.userConnected(user.id, client.id);
      
      this.logger.log(`User ${user.email} connected with socket ${client.id}`);
      
      // Join user to their personal notification room
      client.join(`user-${user.id}`);
      
      // Emit connection success
      client.emit('connection:success', {
        userId: user.id,
        socketId: client.id,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      await this.presenceService.userDisconnected(client.user.id, client.id);
      this.logger.log(`User ${client.user.email} disconnected`);
    }
  }

  // Task collaboration events
  @SubscribeMessage('task:join')
  async handleJoinTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string }
  ) {
    if (!client.user) return;

    await client.join(`task-${data.taskId}`);
    await this.presenceService.joinTask(client.user.id, data.taskId, client.id);
    
    // Notify others in the task room about new presence
    client.to(`task-${data.taskId}`).emit('presence:joined', {
      userId: client.user.id,
      userName: client.user.firstName + ' ' + client.user.lastName,
      userEmail: client.user.email,
      taskId: data.taskId,
      timestamp: new Date(),
    });

    // Send current presence to the joining user
    const currentPresence = await this.presenceService.getTaskPresence(data.taskId);
    client.emit('presence:current', {
      taskId: data.taskId,
      users: currentPresence,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('task:leave')
  async handleLeaveTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string }
  ) {
    if (!client.user) return;

    await client.leave(`task-${data.taskId}`);
    await this.presenceService.leaveTask(client.user.id, data.taskId, client.id);
    
    // Notify others about presence leave
    client.to(`task-${data.taskId}`).emit('presence:left', {
      userId: client.user.id,
      taskId: data.taskId,
      timestamp: new Date(),
    });
  }

  // Real-time task editing
  @SubscribeMessage('task:edit:start')
  async handleTaskEditStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string; field: string }
  ) {
    if (!client.user) return;

    await this.collaborationService.startEditing(client.user.id, data.taskId, data.field);
    
    // Broadcast to other users in the task
    client.to(`task-${data.taskId}`).emit('task:edit:started', {
      userId: client.user.id,
      userName: client.user.firstName + ' ' + client.user.lastName,
      taskId: data.taskId,
      field: data.field,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('task:edit:stop')
  async handleTaskEditStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string; field: string }
  ) {
    if (!client.user) return;

    await this.collaborationService.stopEditing(client.user.id, data.taskId, data.field);
    
    client.to(`task-${data.taskId}`).emit('task:edit:stopped', {
      userId: client.user.id,
      taskId: data.taskId,
      field: data.field,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('task:edit:typing')
  async handleTaskEditTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string; field: string; content: string }
  ) {
    if (!client.user) return;

    // Broadcast typing indicator with debouncing
    client.to(`task-${data.taskId}`).emit('task:edit:typing', {
      userId: client.user.id,
      userName: client.user.firstName + ' ' + client.user.lastName,
      taskId: data.taskId,
      field: data.field,
      content: data.content.substring(0, 100), // Limit content preview
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('task:edit:operation')
  async handleTaskEditOperation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      taskId: string;
      operation: {
        type: 'insert' | 'delete' | 'retain';
        position: number;
        content?: string;
        length?: number;
      };
      version: number;
    }
  ) {
    if (!client.user) return;

    try {
      const transformedOperation = await this.collaborationService.applyOperation(
        data.taskId,
        data.operation,
        data.version,
        client.user.id
      );

      // Broadcast the transformed operation to other clients
      client.to(`task-${data.taskId}`).emit('task:edit:operation:applied', {
        operation: transformedOperation,
        userId: client.user.id,
        taskId: data.taskId,
        newVersion: transformedOperation.version,
        timestamp: new Date(),
      });

      // Confirm to the sender
      client.emit('task:edit:operation:confirmed', {
        operation: transformedOperation,
        taskId: data.taskId,
        newVersion: transformedOperation.version,
      });

    } catch (error) {
      client.emit('task:edit:operation:error', {
        error: error.message,
        taskId: data.taskId,
        operation: data.operation,
      });
    }
  }

  // Real-time notifications
  @SubscribeMessage('notification:subscribe')
  async handleNotificationSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { types: string[] }
  ) {
    if (!client.user) return;

    await this.notificationService.subscribe(client.user.id, data.types, client.id);
    
    client.emit('notification:subscribed', {
      types: data.types,
      timestamp: new Date(),
    });
  }

  // Utility methods for broadcasting
  async broadcastToTask(taskId: string, event: string, data: any) {
    this.server.to(`task-${taskId}`).emit(event, data);
  }

  async broadcastToUser(userId: string, event: string, data: any) {
    this.server.to(`user-${userId}`).emit(event, data);
  }

  async broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  private async extractUserFromSocket(socket: AuthenticatedSocket): Promise<User | null> {
    try {
      // Extract JWT token from handshake auth or query
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return null;

      // Here you would validate the JWT token and extract user
      // This is a simplified version - implement proper JWT validation
      const decoded = this.validateJwtToken(token);
      if (!decoded) return null;

      // Fetch user from database
      return await this.getUserById(decoded.userId);
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      return null;
    }
  }

  private validateJwtToken(token: string): { userId: string } | null {
    // Implement JWT validation logic here
    // Return decoded token with userId
    return null; // Placeholder
  }

  private async getUserById(userId: string): Promise<User | null> {
    // Implement user fetching logic here
    return null; // Placeholder
  }
}