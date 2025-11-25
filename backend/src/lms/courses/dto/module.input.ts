import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class CreateModuleInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class UpdateModuleInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Module ID is required' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class ReorderModulesInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;

  @Field(() => [ID])
  @IsNotEmpty({ message: 'Module order is required' })
  moduleIds: string[];
}
