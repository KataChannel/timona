import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from './post.model';
import { PaginationMeta } from './pagination.model';

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
