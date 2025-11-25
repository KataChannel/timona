import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LessonProgress {
  @Field(() => ID)
  id: string;

  @Field()
  enrollmentId: string;

  @Field()
  lessonId: string;

  @Field()
  completed: boolean;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
