import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { GuideType } from '../entities/system-guide.entity';

@InputType()
export class CreateSystemGuideInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => String)
  @IsEnum(GuideType)
  type: GuideType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

@InputType()
export class UpdateSystemGuideInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(GuideType)
  type?: GuideType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
