import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsArray, IsObject, Length, Min, Max } from 'class-validator';
import { MenuType, MenuTarget } from '@prisma/client';
import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Transform } from 'class-transformer';

@InputType('CreateMenuInput')
export class CreateMenuDto {
  @Field()
  @IsString()
  @Length(1, 100)
  title!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  slug!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(MenuType)
  @Transform(({ value }) => value === '' ? undefined : value)
  type?: MenuType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  route?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  externalUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(MenuTarget)
  @Transform(({ value }) => value === '' ? undefined : value)
  target?: MenuTarget;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  iconType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  badge?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  badgeColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  image?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPermissions?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredRoles?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  // Dynamic linking fields
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  linkType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  blogPostId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pageId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  blogCategoryId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  queryConditions?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  cssClass?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;
}
