import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { LessonType } from '@prisma/client';
import { Quiz } from '../../quizzes/entities/quiz.entity';

// Register enum for GraphQL
registerEnumType(LessonType, {
  name: 'LessonType',
  description: 'Type of lesson content',
});

@ObjectType()
export class Lesson {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => LessonType)
  type: LessonType;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int)
  order: number;

  @Field(() => ID)
  moduleId: string;

  @Field({ defaultValue: false })
  isFree: boolean;

  @Field(() => [Quiz], { nullable: true })
  quizzes?: Quiz[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
