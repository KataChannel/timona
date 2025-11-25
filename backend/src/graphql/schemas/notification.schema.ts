import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Define MentionerType first before NotificationType references it
@ObjectType()
export class MentionerType {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class NotificationType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  type: string;

  @Field()
  isRead: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;

  @Field({ nullable: true })
  taskId?: string;

  @Field({ nullable: true })
  mentionedBy?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MentionerType, { nullable: true })
  mentioner?: MentionerType;
}

@ObjectType()
export class NotificationListResponse {
  @Field(() => [NotificationType])
  notifications: NotificationType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  unreadCount: number;

  @Field()
  hasMore: boolean;
}

@InputType()
export class MarkNotificationAsReadInput {
  @Field()
  notificationId: string;
}

@InputType()
export class DeleteNotificationInput {
  @Field()
  notificationId: string;
}
