import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

export enum SettingCategory {
  GENERAL = 'GENERAL',
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  SEO = 'SEO',
  SOCIAL = 'SOCIAL',
  CONTACT = 'CONTACT',
  APPEARANCE = 'APPEARANCE',
  ANALYTICS = 'ANALYTICS',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  SUPPORT_CHAT = 'SUPPORT_CHAT',
  AUTH = 'AUTH',
}

export enum SettingType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  JSON = 'JSON',
  COLOR = 'COLOR',
  IMAGE = 'IMAGE',
  URL = 'URL',
}

@InputType()
export class CreateWebsiteSettingInput {
  @Field()
  @IsString()
  key: string;

  @Field()
  @IsString()
  label: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsEnum(SettingType)
  type: SettingType;

  @Field()
  @IsEnum(SettingCategory)
  category: SettingCategory;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  group?: string;

  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  options?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  validation?: any;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}

@InputType()
export class UpdateWebsiteSettingInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  label?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  value?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsEnum(SettingType)
  @IsOptional()
  type?: SettingType;

  @Field({ nullable: true })
  @IsEnum(SettingCategory)
  @IsOptional()
  category?: SettingCategory;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  group?: string;

  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  order?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  options?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  validation?: any;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
