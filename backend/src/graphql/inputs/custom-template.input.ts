import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TemplateCategory } from '@prisma/client';

@InputType()
export class CreateCustomTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TemplateCategory)
  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @Field(() => GraphQLJSON)
  blocks: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

@InputType()
export class UpdateCustomTemplateInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TemplateCategory, { nullable: true })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  blocks?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

@InputType()
export class ShareTemplateInput {
  @Field()
  @IsString()
  templateId: string;

  @Field(() => [String])
  userIds: string[];
}

@InputType()
export class UpdateTemplatePublicityInput {
  @Field()
  @IsString()
  templateId: string;

  @Field()
  @IsBoolean()
  isPublic: boolean;
}
