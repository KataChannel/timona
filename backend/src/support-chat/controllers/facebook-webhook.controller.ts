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

@Controller('webhooks/facebook')
export class FacebookWebhookController {
  constructor(
    private conversationService: SupportConversationService,
    private messageService: SupportMessageService,
    private integrationService: ChatIntegrationService,
    private chatGateway: SupportChatGateway,
  ) {}

  @Get()
  async verifyWebhook(@Query() query: any) {
    // Facebook webhook verification
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const integration = await this.integrationService.getIntegration(
      IntegrationPlatform.FACEBOOK,
    );

    if (mode === 'subscribe' && token === integration?.webhookSecret) {
      console.log('Facebook webhook verified');
      await this.integrationService.verifyWebhook(IntegrationPlatform.FACEBOOK);
      return challenge;
    }

    throw new HttpException('Verification failed', HttpStatus.FORBIDDEN);
  }

  @Post()
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    try {
      // Verify signature
      const integration = await this.integrationService.getIntegration(
        IntegrationPlatform.FACEBOOK,
      );

      if (!integration?.webhookSecret) {
        throw new HttpException('Integration not configured', HttpStatus.BAD_REQUEST);
      }

      // Process Facebook events
      if (body.object === 'page') {
        for (const entry of body.entry) {
          const webhookEvent = entry.messaging[0];

          if (webhookEvent.message) {
            await this.handleMessage(webhookEvent);
          } else if (webhookEvent.postback) {
            await this.handlePostback(webhookEvent);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Facebook webhook error:', error);
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async handleMessage(event: any) {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id;
    const message = event.message;

    // Get sender info from Facebook API
    const integration = await this.integrationService.getIntegration(
      IntegrationPlatform.FACEBOOK,
    );

    let senderName = 'Facebook User';
    
    try {
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/${senderId}?fields=first_name,last_name&access_token=${integration.accessToken}`,
      );
      const userInfo = await userInfoResponse.json();
      senderName = `${userInfo.first_name} ${userInfo.last_name}`;
    } catch (error) {
      console.error('Error fetching Facebook user info:', error);
    }

    // Find or create conversation
    let conversation = await this.conversationService.findAll({
      where: {
        platform: IntegrationPlatform.FACEBOOK,
        platformUserId: senderId,
        status: { in: ['ACTIVE', 'WAITING', 'ASSIGNED'] },
      },
      take: 1,
    });

    if (!conversation || conversation.length === 0) {
      const newConversation = await this.conversationService.createConversation({
        platform: IntegrationPlatform.FACEBOOK,
        platformUserId: senderId,
        platformUserName: senderName,
        customerName: senderName,
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
      content: message.text || '[Attachment]',
      senderType: SupportSender.CUSTOMER,
      senderName,
      metadata: {
        attachments: message.attachments,
        mid: message.mid,
      },
    });

    // Notify via WebSocket
    this.chatGateway.server
      .to(`conversation_${conversation[0].id}`)
      .emit('new_message', newMessage);
  }

  private async handlePostback(event: any) {
    // Handle Facebook postback (button clicks, etc.)
    console.log('Facebook postback received:', event.postback);
  }
}
