import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

/**
 * WebSocket Gateway cho Project Management Real-time Chat
 * Namespace: /project-chat
 * Features:
 * - Real-time messaging trong projects
 * - Typing indicators
 * - Online/offline status
 * - @Mention notifications
 * - Message reactions
 * - Thread replies
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/project-chat',
})
export class ProjectChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active connections: socketId -> { userId, projectId }
  private activeConnections: Map<
    string,
    { userId: string; projectId: string }
  > = new Map();

  // Track online users per project: projectId -> Set<userId>
  private onlineUsers: Map<string, Set<string>> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    console.log(`[ProjectChat] Client connected: ${client.id}`);
    
    // Extract token from handshake auth or headers
    let token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    
    // Strip "Bearer " prefix if present
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        client.userId = payload.sub || payload.id;
        console.log(`[ProjectChat] Authenticated user: ${client.userId}`);
      } catch (error) {
        console.error('[ProjectChat] Auth error:', error.message);
      }
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    console.log(`[ProjectChat] Client disconnected: ${client.id}`);
    
    const connection = this.activeConnections.get(client.id);
    if (connection) {
      const { userId, projectId } = connection;
      
      // Remove from online users
      const onlineSet = this.onlineUsers.get(projectId);
      if (onlineSet) {
        onlineSet.delete(userId);
        
        // Notify others about offline status
        this.server.to(`project_${projectId}`).emit('user_offline', {
          userId,
          projectId,
          timestamp: new Date(),
        });
      }
      
      this.activeConnections.delete(client.id);
    }
  }

  @SubscribeMessage('join_project')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { projectId } = data;
    const userId = client.userId;

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify project membership
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      return { success: false, error: 'Not a project member' };
    }

    // Join room
    client.join(`project_${projectId}`);
    
    // Track connection
    this.activeConnections.set(client.id, { userId, projectId });
    
    // Track online user
    if (!this.onlineUsers.has(projectId)) {
      this.onlineUsers.set(projectId, new Set());
    }
    this.onlineUsers.get(projectId).add(userId);

    // Notify others about online status
    client.broadcast.to(`project_${projectId}`).emit('user_online', {
      userId,
      projectId,
      timestamp: new Date(),
    });

    // Get online users list
    const onlineUsersList = Array.from(this.onlineUsers.get(projectId) || []);

    return {
      success: true,
      projectId,
      onlineUsers: onlineUsersList,
    };
  }

  @SubscribeMessage('leave_project')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { projectId } = data;
    const userId = client.userId;

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    client.leave(`project_${projectId}`);
    
    // Remove from online users
    const onlineSet = this.onlineUsers.get(projectId);
    if (onlineSet) {
      onlineSet.delete(userId);
    }

    // Notify others
    client.broadcast.to(`project_${projectId}`).emit('user_offline', {
      userId,
      projectId,
      timestamp: new Date(),
    });

    this.activeConnections.delete(client.id);

    return { success: true };
  }

  @SubscribeMessage('load_messages')
  async handleLoadMessages(
    @MessageBody()
    data: {
      projectId: string;
      take?: number;
      skip?: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;

    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const take = data.take || 50;
      const skip = data.skip || 0;

      console.log('[load_messages] Checking membership:', {
        projectId: data.projectId,
        userId,
        userIdType: typeof userId,
      });

      // Verify project membership - try finding any member first
      const allMembers = await this.prisma.projectMember.findMany({
        where: { projectId: data.projectId },
        select: { userId: true, role: true },
      });

      console.log('[load_messages] Project members:', allMembers);

      const member = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: data.projectId,
            userId: String(userId), // Ensure string type
          },
        },
      });

      console.log('[load_messages] Found member:', member);

      if (!member) {
        client.emit('error', { message: 'Not a project member' });
        return;
      }

      // Load messages from database
      const messages = await this.prisma.chatMessagePM.findMany({
        where: {
          projectId: data.projectId,
        },
        take,
        skip,
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // Format messages for frontend
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        userId: msg.senderId,
        userName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.email,
        userAvatar: msg.sender.avatar,
        content: msg.content,
        createdAt: msg.createdAt,
        isEdited: msg.isEdited,
        reactions: msg.reactions || {},
        replyTo: msg.replyTo ? {
          id: msg.replyTo.id,
          content: msg.replyTo.content,
          userName: `${msg.replyTo.sender.firstName || ''} ${msg.replyTo.sender.lastName || ''}`.trim(),
        } : undefined,
      }));

      // Send messages to client
      client.emit('messages_loaded', formattedMessages);

      console.log(`📨 Loaded ${formattedMessages.length} messages for project ${data.projectId}`);
    } catch (error) {
      console.error('Error loading messages:', error);
      client.emit('error', { message: 'Failed to load messages' });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: {
      projectId: string;
      content: string;
      replyToId?: string;
      mentions?: string[];
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Create message in database
      const message = await this.prisma.chatMessagePM.create({
        data: {
          content: data.content,
          projectId: data.projectId,
          senderId: userId,
          mentions: data.mentions || [],
          replyToId: data.replyToId,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // Format message for frontend (match messages_loaded format)
      const formattedMessage = {
        id: message.id,
        userId: message.senderId,
        userName: `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || message.sender.email,
        userAvatar: message.sender.avatar,
        content: message.content,
        createdAt: message.createdAt,
        isEdited: message.isEdited || false,
        reactions: message.reactions || {},
        replyTo: message.replyTo ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          userName: `${message.replyTo.sender.firstName || ''} ${message.replyTo.sender.lastName || ''}`.trim(),
        } : undefined,
      };

      // Broadcast to all clients in the project
      this.server.to(`project_${data.projectId}`).emit('new_message', formattedMessage);

      // Create notifications for @mentions
      if (data.mentions && data.mentions.length > 0) {
        const senderName = `${message.sender.firstName} ${message.sender.lastName}`.trim();
        const notifications = data.mentions.map((mentionedUserId) => ({
          userId: mentionedUserId,
          type: 'PROJECT_MENTION',
          title: 'You were mentioned in a project chat',
          message: `${senderName} mentioned you: ${data.content.substring(0, 100)}`,
          projectId: data.projectId,
          mentionedBy: userId,
          isRead: false,
        }));

        await this.prisma.notification.createMany({
          data: notifications,
        });

        // Emit notification event for mentioned users
        data.mentions.forEach((mentionedUserId) => {
          this.server.to(`user_${mentionedUserId}`).emit('new_notification', {
            type: 'PROJECT_MENTION',
            projectId: data.projectId,
            message: message.content,
            sender: message.sender,
          });
        });
      }

      return { success: true, message };
    } catch (error) {
      console.error('[ProjectChat] Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) return;

    client.broadcast.to(`project_${data.projectId}`).emit('user_typing', {
      userId,
      projectId: data.projectId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) return;

    client.broadcast.to(`project_${data.projectId}`).emit('user_stopped_typing', {
      userId,
      projectId: data.projectId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @MessageBody()
    data: {
      messageId: string;
      emoji: string;
      projectId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const message = await this.prisma.chatMessagePM.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      // Update reactions JSON
      const reactions = (message.reactions as any) || {};
      if (!reactions[data.emoji]) {
        reactions[data.emoji] = [];
      }

      if (!reactions[data.emoji].includes(userId)) {
        reactions[data.emoji].push(userId);
      }

      const updatedMessage = await this.prisma.chatMessagePM.update({
        where: { id: data.messageId },
        data: { reactions },
      });

      // Broadcast reaction update
      this.server.to(`project_${data.projectId}`).emit('reaction_added', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId,
        reactions: updatedMessage.reactions,
      });

      return { success: true, reactions: updatedMessage.reactions };
    } catch (error) {
      console.error('[ProjectChat] Add reaction error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('remove_reaction')
  async handleRemoveReaction(
    @MessageBody()
    data: {
      messageId: string;
      emoji: string;
      projectId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const message = await this.prisma.chatMessagePM.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      const reactions = (message.reactions as any) || {};
      if (reactions[data.emoji]) {
        reactions[data.emoji] = reactions[data.emoji].filter(
          (id: string) => id !== userId,
        );
        if (reactions[data.emoji].length === 0) {
          delete reactions[data.emoji];
        }
      }

      const updatedMessage = await this.prisma.chatMessagePM.update({
        where: { id: data.messageId },
        data: { reactions },
      });

      // Broadcast reaction update
      this.server.to(`project_${data.projectId}`).emit('reaction_removed', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId,
        reactions: updatedMessage.reactions,
      });

      return { success: true, reactions: updatedMessage.reactions };
    } catch (error) {
      console.error('[ProjectChat] Remove reaction error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @MessageBody()
    data: {
      messageId: string;
      content: string;
      projectId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Verify message ownership
      const message = await this.prisma.chatMessagePM.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      if (message.senderId !== userId) {
        return { success: false, error: 'Not authorized to edit this message' };
      }

      // Update message
      const updatedMessage = await this.prisma.chatMessagePM.update({
        where: { id: data.messageId },
        data: {
          content: data.content,
          isEdited: true,
          editedAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Broadcast edit
      this.server.to(`project_${data.projectId}`).emit('message_edited', updatedMessage);

      return { success: true, message: updatedMessage };
    } catch (error) {
      console.error('[ProjectChat] Edit message error:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody()
    data: {
      messageId: string;
      projectId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.userId;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const message = await this.prisma.chatMessagePM.findUnique({
        where: { id: data.messageId },
      });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      // Check if user is sender or project owner/admin
      const member = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: data.projectId,
            userId,
          },
        },
      });

      const canDelete =
        message.senderId === userId ||
        member?.role === 'owner' ||
        member?.role === 'admin';

      if (!canDelete) {
        return { success: false, error: 'Not authorized to delete this message' };
      }

      await this.prisma.chatMessagePM.delete({
        where: { id: data.messageId },
      });

      // Broadcast deletion
      this.server.to(`project_${data.projectId}`).emit('message_deleted', {
        messageId: data.messageId,
        projectId: data.projectId,
      });

      return { success: true };
    } catch (error) {
      console.error('[ProjectChat] Delete message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Server-side method to send system messages
  async sendSystemMessage(projectId: string, content: string) {
    const message = await this.prisma.chatMessagePM.create({
      data: {
        content,
        projectId,
        senderId: 'system', // Use special system user ID
        mentions: [],
      },
    });

    this.server.to(`project_${projectId}`).emit('system_message', message);
  }

  // Get online users for a project
  getOnlineUsers(projectId: string): string[] {
    return Array.from(this.onlineUsers.get(projectId) || []);
  }
}
