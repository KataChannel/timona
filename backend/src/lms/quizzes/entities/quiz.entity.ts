import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { QuestionType } from '@prisma/client';

@ObjectType()
export class Answer {
  @Field(() => ID)
  id: string;

  @Field()
  questionId: string;

  @Field()
  text: string;

  @Field()
  isCorrect: boolean;

  @Field(() => Int)
  order: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Question {
  @Field(() => ID)
  id: string;

  @Field()
  quizId: string;

  @Field(() => String)
  type: QuestionType;

  @Field()
  question: string;

  @Field(() => Int)
  points: number;

  @Field(() => Int)
  order: number;

  @Field({ nullable: true })
  explanation?: string;

  @Field(() => [Answer])
  answers: Answer[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Quiz {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  lessonId: string;

  @Field(() => Int)
  passingScore: number;

  @Field(() => Int, { nullable: true })
  timeLimit?: number;

  @Field(() => [Question])
  questions: Question[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class QuizAttempt {
  @Field(() => ID)
  id: string;

  @Field()
  quizId: string;

  @Field()
  userId: string;

  @Field()
  enrollmentId: string;

  @Field(() => Float, { nullable: true })
  score?: number;

  @Field()
  passed: boolean;

  @Field({ nullable: true })
  answers?: string; // JSON string

  @Field(() => Int, { nullable: true })
  timeSpent?: number;

  @Field(() => Quiz)
  quiz: Quiz;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
