import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateTaskCommentInput {
  @Field()
  @IsString()
  taskId: string;

  @Field()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;
}

@InputType()
export class UpdateTaskCommentInput {
  @Field()
  @IsString()
  commentId: string;

  @Field()
  @IsString()
  content: string;
}
