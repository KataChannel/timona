import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PostStatus } from '@prisma/client';
import { Tag } from './tag.model';

// Register the PostStatus enum
registerEnumType(PostStatus, {
  name: 'PostStatus',
  description: 'Post status types',
});

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field(() => PostStatus)
  status: PostStatus;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  authorId: string;

  // Relations - handled by field resolvers to avoid circular dependencies
  author: any;
  comments?: any[];

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => Number, { defaultValue: 0 })
  likesCount?: number;

  @Field(() => Number, { defaultValue: 0 })
  commentsCount?: number;
}
