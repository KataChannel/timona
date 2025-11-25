import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { FileType, FileVisibility } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, Min } from 'class-validator';

@InputType()
export class CreateFolderInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;
}

@InputType()
export class UpdateFolderInput {
  @Field(() => ID)
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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;
}

@InputType()
export class UpdateFileInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  alt?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  folderId?: string;

  @Field(() => FileVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class FileFiltersInput {
  @Field(() => FileType, { nullable: true })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  folderId?: string;

  @Field(() => FileVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

@InputType()
export class CreateFileShareInput {
  @Field(() => ID)
  @IsString()
  fileId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sharedWith?: string;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  canDownload?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  canView?: boolean;
}

@InputType()
export class MoveFilesInput {
  @Field(() => [ID])
  @IsArray()
  fileIds: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  targetFolderId?: string;
}

@InputType()
export class BulkDeleteFilesInput {
  @Field(() => [ID])
  @IsArray()
  fileIds: string[];
}

@InputType()
export class BulkUpdateFilesInput {
  @Field(() => [ID])
  @IsArray()
  fileIds: string[];

  @Field(() => FileVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  folderId?: string;
}

@InputType()
export class GetFilesInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => FileFiltersInput, { nullable: true })
  @IsOptional()
  filters?: FileFiltersInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  allUsers?: boolean;
}
