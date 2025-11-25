import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { SupportSender, SupportMessageType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateSupportMessageInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => String)
  @IsEnum(SupportSender)
  senderType: SupportSender;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  senderName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  senderId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SupportMessageType)
  messageType?: SupportMessageType;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class MarkMessagesAsReadInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
