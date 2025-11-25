import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Course } from './course.entity';

@ObjectType()
export class PaginatedCourses {
  @Field(() => [Course])
  data: Course[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}
