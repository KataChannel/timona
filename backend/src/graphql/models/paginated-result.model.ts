import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Task } from './task.model';

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}

@ObjectType()
export class TasksPaginatedResult {
  @Field(() => [Task])
  data: Task[];

  @Field(() => PaginationInfo)
  meta: PaginationInfo;
}