import { IntegrationPlatform } from '@prisma/client';
export declare class CreateSupportConversationInput {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerIp?: string;
    platform?: IntegrationPlatform;
    platformUserId?: string;
    platformUserName?: string;
    subject?: string;
}
export declare class SupportConversationWhereInput {
    status?: string;
    customerId?: string;
    assignedAgentId?: string;
    platform?: string;
}
