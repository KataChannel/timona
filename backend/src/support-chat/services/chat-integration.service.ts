import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IntegrationPlatform } from '@prisma/client';

@Injectable()
export class ChatIntegrationService {
  constructor(private prisma: PrismaService) {}

  async getIntegration(platform: IntegrationPlatform) {
    return this.prisma.chatIntegration.findUnique({
      where: { platform },
    });
  }

  async getAllIntegrations() {
    return this.prisma.chatIntegration.findMany();
  }

  async createOrUpdate(data: {
    platform: IntegrationPlatform;
    isEnabled: boolean;
    appId?: string;
    appSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookSecret?: string;
    config?: any;
  }) {
    return this.prisma.chatIntegration.upsert({
      where: { platform: data.platform },
      create: data,
      update: data,
    });
  }

  async verifyWebhook(platform: IntegrationPlatform) {
    return this.prisma.chatIntegration.update({
      where: { platform },
      data: { webhookVerified: true },
    });
  }

  async updateSyncStatus(
    platform: IntegrationPlatform,
    status: string,
    error?: string,
  ) {
    return this.prisma.chatIntegration.update({
      where: { platform },
      data: {
        lastSyncAt: new Date(),
        syncStatus: status,
        errorLog: error,
      },
    });
  }

  // Zalo OA specific methods
  async sendZaloMessage(userId: string, message: string) {
    const integration = await this.getIntegration(IntegrationPlatform.ZALO);
    
    if (!integration?.isEnabled || !integration.accessToken) {
      throw new Error('Zalo integration not configured');
    }

    try {
      const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': integration.accessToken,
        },
        body: JSON.stringify({
          recipient: {
            user_id: userId,
          },
          message: {
            text: message,
          },
        }),
      });

      return await response.json();
    } catch (error) {
      await this.updateSyncStatus(IntegrationPlatform.ZALO, 'failed', error.message);
      throw error;
    }
  }

  // Facebook Messenger specific methods
  async sendFacebookMessage(recipientId: string, message: string) {
    const integration = await this.getIntegration(IntegrationPlatform.FACEBOOK);
    
    if (!integration?.isEnabled || !integration.accessToken) {
      throw new Error('Facebook integration not configured');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${integration.accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: {
              id: recipientId,
            },
            message: {
              text: message,
            },
          }),
        },
      );

      return await response.json();
    } catch (error) {
      await this.updateSyncStatus(IntegrationPlatform.FACEBOOK, 'failed', error.message);
      throw error;
    }
  }
}
