import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { FileType, FileVisibility } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register enums for GraphQL
registerEnumType(FileType, {
  name: 'FileType',
  description: 'Type of file',
});

registerEnumType(FileVisibility, {
  name: 'FileVisibility',
  description: 'Visibility level of the file',
});

@ObjectType()
export class FileFolder {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => FileFolder, { nullable: true })
  parent?: FileFolder;

  @Field(() => [FileFolder], { defaultValue: [] })
  children: FileFolder[];

  @Field()
  path: string;

  @Field(() => ID)
  userId: string;

  @Field(() => [File], { defaultValue: [] })
  files: File[];

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field()
  isSystem: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class File {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field(() => Int)
  size: number;

  @Field(() => FileType)
  fileType: FileType;

  @Field()
  url: string;

  @Field()
  bucket: string;

  @Field()
  path: string;

  @Field({ nullable: true })
  etag?: string;

  @Field(() => ID, { nullable: true })
  folderId?: string;

  @Field(() => FileFolder, { nullable: true })
  folder?: FileFolder;

  @Field(() => ID)
  userId: string;

  @Field(() => FileVisibility)
  visibility: FileVisibility;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => [String], { defaultValue: [] })
  tags: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int)
  downloadCount: number;

  @Field(() => Int)
  viewCount: number;

  @Field(() => [FileShare], { defaultValue: [] })
  shares: FileShare[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FileShare {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  fileId: string;

  @Field(() => File)
  file: File;

  @Field()
  sharedBy: string;

  @Field({ nullable: true })
  sharedWith?: string;

  @Field()
  token: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  password?: string;

  @Field()
  canDownload: boolean;

  @Field()
  canView: boolean;

  @Field(() => Int)
  accessCount: number;

  @Field({ nullable: true })
  lastAccess?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedFiles {
  @Field(() => [File])
  items: File[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedFolders {
  @Field(() => [FileFolder])
  items: FileFolder[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class FileUploadResponse {
  @Field(() => File)
  file: File;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class FileStorageStats {
  @Field(() => Int)
  totalFiles: number;

  @Field(() => Int)
  totalSize: number;

  @Field(() => Int)
  totalFolders: number;

  @Field(() => [FileTypeCount])
  filesByType: FileTypeCount[];

  @Field(() => [VisibilityCount])
  filesByVisibility: VisibilityCount[];
}

@ObjectType()
export class FileTypeCount {
  @Field(() => FileType)
  type: FileType;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  totalSize: number;
}

@ObjectType()
export class VisibilityCount {
  @Field(() => FileVisibility)
  visibility: FileVisibility;

  @Field(() => Int)
  count: number;
}
