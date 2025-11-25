import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { 
  SupportTicketStatus, 
  SupportTicketPriority, 
  SupportTicketCategory 
} from '@prisma/client';

registerEnumType(SupportTicketStatus, { name: 'SupportTicketStatus' });
registerEnumType(SupportTicketPriority, { name: 'SupportTicketPriority' });
registerEnumType(SupportTicketCategory, { name: 'SupportTicketCategory' });

@ObjectType()
export class TechnicalSupportTicket {
  @Field(() => ID)
  id: string;

  @Field()
  ticketNumber: string;

  @Field()
  subject: string;

  @Field()
  description: string;

  @Field(() => SupportTicketCategory)
  category: SupportTicketCategory;

  @Field(() => SupportTicketPriority)
  priority: SupportTicketPriority;

  @Field(() => SupportTicketStatus)
  status: SupportTicketStatus;

  @Field({ nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  assignedToId?: string;

  @Field({ nullable: true })
  assignedAt?: Date;

  @Field({ nullable: true })
  environment?: string;

  @Field({ nullable: true })
  browserInfo?: string;

  @Field({ nullable: true })
  osInfo?: string;

  @Field({ nullable: true })
  deviceInfo?: string;

  @Field({ nullable: true })
  errorLogs?: string;

  @Field(() => [String])
  attachmentUrls: string[];

  @Field(() => [String])
  screenshotUrls: string[];

  @Field({ nullable: true })
  relatedUrl?: string;

  @Field({ nullable: true })
  relatedOrderId?: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  resolvedById?: string;

  @Field(() => Int, { nullable: true })
  customerRating?: number;

  @Field({ nullable: true })
  customerFeedback?: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field({ nullable: true })
  firstResponseAt?: Date;

  @Field({ nullable: true })
  lastResponseAt?: Date;
}

@ObjectType()
export class TechnicalSupportMessage {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  isInternal: boolean;

  @Field(() => [String])
  attachmentUrls: string[];

  @Field()
  ticketId: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  authorName?: string;

  @Field({ nullable: true })
  authorEmail?: string;

  @Field()
  isRead: boolean;

  @Field({ nullable: true })
  readAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
