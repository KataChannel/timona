import { InputType, Field, Int } from '@nestjs/graphql';
import { QuestionType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray, ArrayNotEmpty } from 'class-validator';

@InputType()
export class CreateAnswerInput {
  @Field()
  @IsNotEmpty()
  text: string;

  @Field()
  isCorrect: boolean;

  @Field(() => Int)
  @IsNumber()
  order: number;
}

@InputType()
export class CreateQuestionInput {
  @Field(() => String)
  @IsNotEmpty()
  type: QuestionType;

  @Field()
  @IsNotEmpty()
  question: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  points: number;

  @Field(() => Int)
  @IsNumber()
  order: number;

  @Field({ nullable: true })
  @IsOptional()
  explanation?: string;

  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];
}

@InputType()
export class CreateQuizInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field()
  @IsNotEmpty()
  lessonId: string;

  @Field(() => Int, { defaultValue: 70 })
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimit?: number;

  @Field(() => [CreateQuestionInput])
  questions: CreateQuestionInput[];
}

@InputType()
export class UpdateQuizInput {
  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  timeLimit?: number;
}

@InputType()
export class QuizAnswerInput {
  @Field()
  @IsNotEmpty()
  questionId: string;

  @Field(() => [String])
  selectedAnswerIds: string[];
}

@InputType()
export class SubmitQuizInput {
  @Field()
  @IsNotEmpty()
  quizId: string;

  @Field()
  @IsNotEmpty()
  enrollmentId: string;

  @Field(() => [QuizAnswerInput])
  @IsArray()
  @ArrayNotEmpty()
  answers: QuizAnswerInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}
