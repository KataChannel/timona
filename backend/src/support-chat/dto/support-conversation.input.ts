import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { IntegrationPlatform } from '@prisma/client';

@InputType()
export class CreateSupportConversationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerIp?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(IntegrationPlatform)
  platform?: IntegrationPlatform;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  platformUserId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  platformUserName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;
}

@InputType()
export class SupportConversationWhereInput {
  @Field({ nullable: true })
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  customerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  assignedAgentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  platform?: string;
}
