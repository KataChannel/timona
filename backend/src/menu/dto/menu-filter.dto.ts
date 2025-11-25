import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { MenuType } from '@prisma/client';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MenuFilterDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
