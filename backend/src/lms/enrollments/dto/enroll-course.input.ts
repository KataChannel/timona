import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class EnrollCourseInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;
}
