import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateCourseInput } from './create-course.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
