import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsNotEmpty()
  postId: string;

  @Field({ nullable: true })
  @IsOptional()
  parentId?: string;
}

@InputType()
export class UpdateCommentInput {
  @Field({ nullable: true })
  @IsOptional()
  content?: string;
}
