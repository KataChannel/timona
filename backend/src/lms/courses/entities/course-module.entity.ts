import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Lesson } from './lesson.entity';

@ObjectType()
export class CourseModule {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field(() => ID)
  courseId: string;

  @Field(() => [Lesson], { nullable: true })
  lessons?: Lesson[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
