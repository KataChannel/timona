import { Field, Float, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AIProviderType {
  CHATGPT = 'CHATGPT',
  GROK = 'GROK',
  GEMINI = 'GEMINI',
}

registerEnumType(AIProviderType, {
  name: 'AIProviderType',
  description: 'AI Provider types: ChatGPT, Grok, Gemini',
});

@InputType()
export class CreateAIProviderInput {
  @Field()
  @IsEnum(AIProviderType)
  @IsNotEmpty()
  provider: AIProviderType;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  model: string;

  @Field(() => Float, { nullable: true, defaultValue: 0.7 })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;

  @Field(() => Int, { nullable: true, defaultValue: 2000 })
  @IsInt()
  @Min(1)
  @Max(8000)
  @IsOptional()
  maxTokens?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class UpdateAIProviderInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  model?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(8000)
  @IsOptional()
  maxTokens?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class TestAIProviderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @Field({ nullable: true, defaultValue: 'Hello, how are you?' })
  @IsString()
  @IsOptional()
  testMessage?: string;
}
