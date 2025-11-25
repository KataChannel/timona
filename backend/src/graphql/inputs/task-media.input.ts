import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { MediaType } from '@prisma/client';

@InputType()
export class UploadTaskMediaInput {
  @Field()
  @IsString()
  taskId: string;

  @Field()
  @IsString()
  filename: string;

  @Field()
  @IsString()
  mimeType: string;

  @Field()
  @IsNumber()
  size: number;

  @Field(() => String)
  @IsEnum(MediaType)
  type: MediaType;

  @Field()
  @IsString()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;
}