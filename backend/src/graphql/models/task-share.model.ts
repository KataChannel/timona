import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.model';
import { SharePermission } from '@prisma/client';

registerEnumType(SharePermission, {
  name: 'SharePermission',
  description: 'The permission level for shared tasks',
});

@ObjectType()
export class TaskShare {
  @Field(() => ID)
  id: string;

  @Field(() => SharePermission)
  permission: SharePermission;

  @Field()
  shareToken: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  taskId: string;

  @Field(() => User)
  sharedByUser: User;

  @Field()
  sharedBy: string;

  @Field(() => User, { nullable: true })
  sharedWithUser?: User;

  @Field({ nullable: true })
  sharedWith?: string;
}
