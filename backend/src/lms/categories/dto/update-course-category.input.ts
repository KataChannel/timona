import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateCourseCategoryInput } from './create-course-category.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateCourseCategoryInput extends PartialType(CreateCourseCategoryInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
