import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  postId: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  parentId?: string;

  // Relations - using field resolvers to avoid circular dependency
  post: any;

  @Field(() => User)
  user: User;

  @Field(() => Comment, { nullable: true })
  parent?: Comment;

  @Field(() => [Comment], { defaultValue: [] })
  replies: Comment[];
}
