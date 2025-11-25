import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class Tag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => Number, { defaultValue: 0 })
  postsCount?: number;
}
