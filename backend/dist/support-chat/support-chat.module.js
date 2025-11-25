"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportChatModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const redis_module_1 = require("../redis/redis.module");
const auth_module_1 = require("../auth/auth.module");
const user_module_1 = require("../user/user.module");
const support_conversation_service_1 = require("./services/support-conversation.service");
const support_message_service_1 = require("./services/support-message.service");
const support_ticket_service_1 = require("./services/support-ticket.service");
const chat_integration_service_1 = require("./services/chat-integration.service");
const chat_quick_reply_service_1 = require("./services/chat-quick-reply.service");
const chat_bot_rule_service_1 = require("./services/chat-bot-rule.service");
const support_analytics_service_1 = require("./services/support-analytics.service");
const ai_assistant_service_1 = require("./services/ai-assistant.service");
const ai_provider_service_1 = require("./services/ai-provider.service");
const ai_response_service_1 = require("./services/ai-response.service");
const support_conversation_resolver_1 = require("./resolvers/support-conversation.resolver");
const support_message_resolver_1 = require("./resolvers/support-message.resolver");
const support_analytics_resolver_1 = require("./resolvers/support-analytics.resolver");
const ai_provider_resolver_1 = require("./resolvers/ai-provider.resolver");
const zalo_webhook_controller_1 = require("./controllers/zalo-webhook.controller");
const facebook_webhook_controller_1 = require("./controllers/facebook-webhook.controller");
const support_chat_gateway_1 = require("./gateways/support-chat.gateway");
let SupportChatModule = class SupportChatModule {
};
exports.SupportChatModule = SupportChatModule;
exports.SupportChatModule = SupportChatModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, auth_module_1.AuthModule, user_module_1.UserModule],
        controllers: [zalo_webhook_controller_1.ZaloWebhookController, facebook_webhook_controller_1.FacebookWebhookController],
        providers: [
            support_conversation_service_1.SupportConversationService,
            support_message_service_1.SupportMessageService,
            support_ticket_service_1.SupportTicketService,
            chat_integration_service_1.ChatIntegrationService,
            chat_quick_reply_service_1.ChatQuickReplyService,
            chat_bot_rule_service_1.ChatBotRuleService,
            support_analytics_service_1.SupportAnalyticsService,
            ai_assistant_service_1.AIAssistantService,
            ai_provider_service_1.AIProviderService,
            ai_response_service_1.AIResponseService,
            support_conversation_resolver_1.SupportConversationResolver,
            support_message_resolver_1.SupportMessageResolver,
            support_analytics_resolver_1.SupportAnalyticsResolver,
            ai_provider_resolver_1.AIProviderResolver,
            support_chat_gateway_1.SupportChatGateway,
        ],
        exports: [
            support_conversation_service_1.SupportConversationService,
            support_message_service_1.SupportMessageService,
            support_ticket_service_1.SupportTicketService,
            chat_integration_service_1.ChatIntegrationService,
            ai_assistant_service_1.AIAssistantService,
            ai_provider_service_1.AIProviderService,
            ai_response_service_1.AIResponseService,
        ],
    })
], SupportChatModule);
//# sourceMappingURL=support-chat.module.js.map