import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { 
  SupportConversationStatus, 
  IntegrationPlatform, 
  TicketPriority,
  SupportSender,
  SupportMessageType 
} from '@prisma/client';
import { User } from '../../graphql/models/user.model';

// Register enums for GraphQL
registerEnumType(SupportConversationStatus, {
  name: 'SupportConversationStatus',
});

registerEnumType(IntegrationPlatform, {
  name: 'IntegrationPlatform',
});

registerEnumType(TicketPriority, {
  name: 'TicketPriority',
});

registerEnumType(SupportSender, {
  name: 'SupportSender',
});

registerEnumType(SupportMessageType, {
  name: 'SupportMessageType',
});

@ObjectType()
export class SupportMessage {
  @Field(() => ID)
  id: string;

  @Field()
  conversationId: string;

  @Field()
  content: string;

  @Field()
  senderType: string;

  @Field({ nullable: true })
  senderName?: string;

  @Field()
  isAIGenerated: boolean;

  @Field({ nullable: true })
  aiConfidence?: number;

  @Field()
  isRead: boolean;

  @Field()
  sentAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  sender?: User;
}

@ObjectType()
export class SupportConversation {
  @Field(() => ID)
  id: string;

  @Field()
  conversationCode: string;

  @Field({ nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  customerIp?: string;

  @Field({ nullable: true })
  customerLocation?: string;

  @Field({ nullable: true })
  assignedAgentId?: string;

  @Field({ nullable: true })
  assignedAt?: Date;

  @Field(() => SupportConversationStatus)
  status: SupportConversationStatus;

  @Field(() => TicketPriority)
  priority: TicketPriority;

  @Field(() => IntegrationPlatform)
  platform: IntegrationPlatform;

  @Field({ nullable: true })
  platformUserId?: string;

  @Field({ nullable: true })
  platformUserName?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lastMessageAt?: Date;

  @Field({ nullable: true })
  lastMessagePreview?: string;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  feedback?: string;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  customer?: User;

  @Field(() => User, { nullable: true })
  assignedAgent?: User;

  @Field(() => [SupportMessage], { nullable: true })
  messages?: SupportMessage[];
}
