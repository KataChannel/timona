import { SupportTicketStatus, SupportTicketPriority, SupportTicketCategory } from '@prisma/client';
export declare class CreateTechnicalSupportTicketInput {
    subject: string;
    description: string;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    environment?: string;
    browserInfo?: string;
    osInfo?: string;
    deviceInfo?: string;
    errorLogs?: string;
    attachmentUrls?: string[];
    screenshotUrls?: string[];
    relatedUrl?: string;
    relatedOrderId?: string;
    tags?: string[];
}
export declare class UpdateTechnicalSupportTicketInput {
    subject?: string;
    description?: string;
    category?: SupportTicketCategory;
    priority?: SupportTicketPriority;
    status?: SupportTicketStatus;
    assignedToId?: string;
    resolution?: string;
    tags?: string[];
}
export declare class CreateTechnicalSupportMessageInput {
    ticketId: string;
    content: string;
    isInternal: boolean;
    attachmentUrls?: string[];
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
}
export declare class RateTicketInput {
    ticketId: string;
    rating: number;
    feedback?: string;
}
export declare class TechnicalSupportTicketWhereInput {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: SupportTicketCategory;
    customerId?: string;
    assignedToId?: string;
    search?: string;
}
