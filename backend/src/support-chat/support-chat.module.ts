import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { SupportConversationService } from './services/support-conversation.service';
import { SupportMessageService } from './services/support-message.service';
import { SupportTicketService } from './services/support-ticket.service';
import { ChatIntegrationService } from './services/chat-integration.service';
import { ChatQuickReplyService } from './services/chat-quick-reply.service';
import { ChatBotRuleService } from './services/chat-bot-rule.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { AIAssistantService } from './services/ai-assistant.service';
import { AIProviderService } from './services/ai-provider.service';
import { AIResponseService } from './services/ai-response.service';
import { SupportConversationResolver } from './resolvers/support-conversation.resolver';
import { SupportMessageResolver } from './resolvers/support-message.resolver';
import { SupportTicketResolver } from './resolvers/support-ticket.resolver';
import { ChatIntegrationResolver } from './resolvers/chat-integration.resolver';
import { ChatQuickReplyResolver } from './resolvers/chat-quick-reply.resolver';
import { ChatBotRuleResolver } from './resolvers/chat-bot-rule.resolver';
import { SupportAnalyticsResolver } from './resolvers/support-analytics.resolver';
import { AIProviderResolver } from './resolvers/ai-provider.resolver';
import { ZaloWebhookController } from './controllers/zalo-webhook.controller';
import { FacebookWebhookController } from './controllers/facebook-webhook.controller';
import { SupportChatGateway } from './gateways/support-chat.gateway';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, UserModule],
  controllers: [ZaloWebhookController, FacebookWebhookController],
  providers: [
    // Services
    SupportConversationService,
    SupportMessageService,
    SupportTicketService,
    ChatIntegrationService,
    ChatQuickReplyService,
    ChatBotRuleService,
    SupportAnalyticsService,
    AIAssistantService,
    AIProviderService,
    AIResponseService,
    // Resolvers
    SupportConversationResolver,
    SupportMessageResolver,
    SupportAnalyticsResolver,
    AIProviderResolver,
    // SupportTicketResolver, // TODO: Implement
    // ChatIntegrationResolver, // TODO: Implement
    // ChatQuickReplyResolver, // TODO: Implement
    // ChatBotRuleResolver, // TODO: Implement
    // Gateway
    SupportChatGateway,
  ],
  exports: [
    SupportConversationService,
    SupportMessageService,
    SupportTicketService,
    ChatIntegrationService,
    AIAssistantService,
    AIProviderService,
    AIResponseService,
  ],
})
export class SupportChatModule {}

