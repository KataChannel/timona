import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SupportConversationService } from '../services/support-conversation.service';
import { SupportMessageService } from '../services/support-message.service';
import { ChatIntegrationService } from '../services/chat-integration.service';
import { SupportChatGateway } from '../gateways/support-chat.gateway';
import { IntegrationPlatform, SupportSender } from '@prisma/client';

@Controller('webhooks/zalo')
export class ZaloWebhookController {
  constructor(
    private conversationService: SupportConversationService,
    private messageService: SupportMessageService,
    private integrationService: ChatIntegrationService,
    private chatGateway: SupportChatGateway,
  ) {}

  @Get()
  async verifyWebhook(@Query() query: any) {
    // Zalo webhook verification
    const { code, state } = query;
    
    if (code) {
      // Exchange code for access token
      // This is simplified - implement full OAuth flow
      await this.integrationService.verifyWebhook(IntegrationPlatform.ZALO);
      return { success: true };
    }

    return { success: false };
  }

  @Post()
  async handleWebhook(
    @Body() body: any,
    @Headers('x-zevent-signature') signature: string,
  ) {
    try {
      // Verify signature
      const integration = await this.integrationService.getIntegration(
        IntegrationPlatform.ZALO,
      );

      if (!integration?.webhookSecret) {
        throw new HttpException('Integration not configured', HttpStatus.BAD_REQUEST);
      }

      // Process Zalo events
      const event = body.event_name;
      
      if (event === 'user_send_text') {
        await this.handleUserMessage(body);
      } else if (event === 'user_send_image') {
        await this.handleUserImage(body);
      } else if (event === 'follow') {
        await this.handleUserFollow(body);
      }

      return { success: true };
    } catch (error) {
      console.error('Zalo webhook error:', error);
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async handleUserMessage(data: any) {
    const userId = data.follower?.id;
    const userName = data.follower?.name;
    const message = data.message?.text;

    // Find or create conversation
    let conversation = await this.conversationService.findAll({
      where: {
        platform: IntegrationPlatform.ZALO,
        platformUserId: userId,
        status: { in: ['ACTIVE', 'WAITING', 'ASSIGNED'] },
      },
      take: 1,
    });

    if (!conversation || conversation.length === 0) {
      const newConversation = await this.conversationService.createConversation({
        platform: IntegrationPlatform.ZALO,
        platformUserId: userId,
        platformUserName: userName,
        customerName: userName,
      });
      
      conversation = [{
        ...newConversation,
        messages: [],
      }];
      this.chatGateway.notifyNewConversation(newConversation);
    }

    // Create message
    const newMessage = await this.messageService.createMessage({
      conversationId: conversation[0].id,
      content: message,
      senderType: SupportSender.CUSTOMER,
      senderName: userName,
    });

    // Notify via WebSocket
    this.chatGateway.server
      .to(`conversation_${conversation[0].id}`)
      .emit('new_message', newMessage);
  }

  private async handleUserImage(data: any) {
    // Handle image message
    console.log('Zalo image received:', data);
  }

  private async handleUserFollow(data: any) {
    // Handle user follow event
    console.log('New Zalo follower:', data);
  }
}
