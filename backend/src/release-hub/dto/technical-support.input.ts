import { InputType, Field, Int } from '@nestjs/graphql';
import { 
  SupportTicketStatus, 
  SupportTicketPriority, 
  SupportTicketCategory 
} from '@prisma/client';

@InputType()
export class CreateTechnicalSupportTicketInput {
  @Field()
  subject: string;

  @Field()
  description: string;

  @Field(() => SupportTicketCategory)
  category: SupportTicketCategory;

  @Field(() => SupportTicketPriority, { defaultValue: 'MEDIUM' })
  priority: SupportTicketPriority;

  @Field({ nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  customerPhone?: string;

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

  @Field(() => [String], { nullable: true })
  attachmentUrls?: string[];

  @Field(() => [String], { nullable: true })
  screenshotUrls?: string[];

  @Field({ nullable: true })
  relatedUrl?: string;

  @Field({ nullable: true })
  relatedOrderId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class UpdateTechnicalSupportTicketInput {
  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SupportTicketCategory, { nullable: true })
  category?: SupportTicketCategory;

  @Field(() => SupportTicketPriority, { nullable: true })
  priority?: SupportTicketPriority;

  @Field(() => SupportTicketStatus, { nullable: true })
  status?: SupportTicketStatus;

  @Field({ nullable: true })
  assignedToId?: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class CreateTechnicalSupportMessageInput {
  @Field()
  ticketId: string;

  @Field()
  content: string;

  @Field({ defaultValue: false })
  isInternal: boolean;

  @Field(() => [String], { nullable: true })
  attachmentUrls?: string[];

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  authorName?: string;

  @Field({ nullable: true })
  authorEmail?: string;
}

@InputType()
export class RateTicketInput {
  @Field()
  ticketId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  feedback?: string;
}

@InputType()
export class TechnicalSupportTicketWhereInput {
  @Field(() => SupportTicketStatus, { nullable: true })
  status?: SupportTicketStatus;

  @Field(() => SupportTicketPriority, { nullable: true })
  priority?: SupportTicketPriority;

  @Field(() => SupportTicketCategory, { nullable: true })
  category?: SupportTicketCategory;

  @Field({ nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  assignedToId?: string;

  @Field({ nullable: true })
  search?: string;
}
