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
import { SupportMessageService } from '../services/support-message.service';
import { SupportConversationService } from '../services/support-conversation.service';
import { AIAssistantService } from '../services/ai-assistant.service';
import { SupportSender } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/support-chat',
})
export class SupportChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeConnections: Map<string, string> = new Map(); // socketId -> conversationId

  constructor(
    private supportMessageService: SupportMessageService,
    private supportConversationService: SupportConversationService,
    private aiAssistantService: AIAssistantService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeConnections.delete(client.id);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, userId } = data;
    
    client.join(`conversation_${conversationId}`);
    this.activeConnections.set(client.id, conversationId);

    // Mark messages as read
    if (userId) {
      await this.supportMessageService.markConversationMessagesAsRead(
        conversationId,
        userId,
      );
    }

    return { event: 'joined', conversationId };
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId } = data;
    client.leave(`conversation_${conversationId}`);
    this.activeConnections.delete(client.id);

    return { event: 'left', conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      senderId?: string;
      senderType: SupportSender;
      senderName?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.supportMessageService.createMessage(data);

    // Broadcast to all clients in the conversation
    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('new_message', message);

    // If customer message, generate AI suggestion for agent
    if (data.senderType === 'CUSTOMER') {
      try {
        const aiResponse = await this.aiAssistantService.generateResponse(
          data.content,
          { conversationHistory: [] }, // Load from DB if needed
        );

        // Send AI suggestion to agents only
        this.server
          .to(`conversation_${data.conversationId}`)
          .emit('ai_suggestion', {
            conversationId: data.conversationId,
            suggestion: aiResponse.response,
            confidence: aiResponse.confidence,
            suggestions: aiResponse.suggestions,
          });
      } catch (error) {
        console.error('AI suggestion error:', error);
      }
    }

    return { success: true, message };
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast
      .to(`conversation_${data.conversationId}`)
      .emit('user_typing', data);
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast
      .to(`conversation_${data.conversationId}`)
      .emit('user_stopped_typing', data);
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
  ) {
    await this.supportMessageService.markAsRead(data.messageId);
    return { success: true };
  }

  // Server-side method to notify about new conversations
  notifyNewConversation(conversation: any) {
    this.server.emit('new_conversation', conversation);
  }

  // Server-side method to notify about conversation status change
  notifyConversationStatusChange(conversationId: string, status: string) {
    this.server
      .to(`conversation_${conversationId}`)
      .emit('conversation_status_changed', { conversationId, status });
  }

  // Server-side method to notify about agent assignment
  notifyAgentAssignment(conversationId: string, agent: any) {
    this.server
      .to(`conversation_${conversationId}`)
      .emit('agent_assigned', { conversationId, agent });
  }
}
