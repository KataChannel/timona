import { Field, ObjectType, InputType, ID, Int, registerEnumType } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';

// Register MediaType enum for GraphQL
registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'Type of uploaded media',
});

// Simple User type for media uploader
@ObjectType('MediaUploader')
export class MediaUploaderType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType('ProjectMedia')
export class ProjectMediaType {
  @Field(() => ID)
  id: string;

  @Field(() => MediaType)
  type: MediaType;

  @Field()
  url: string;

  @Field()
  filename: string;

  @Field(() => Int)
  size: number;

  @Field()
  mimeType: string;

  @Field({ nullable: true })
  caption?: string;

  @Field()
  projectId: string;

  @Field()
  uploadedBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MediaUploaderType, { nullable: true })
  uploader?: MediaUploaderType;
}

@ObjectType('ChatMedia')
export class ChatMediaType {
  @Field(() => ID)
  id: string;

  @Field(() => MediaType)
  type: MediaType;

  @Field()
  url: string;

  @Field()
  filename: string;

  @Field(() => Int)
  size: number;

  @Field()
  mimeType: string;

  @Field({ nullable: true })
  caption?: string;

  @Field()
  messageId: string;

  @Field()
  uploadedBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MediaUploaderType, { nullable: true })
  uploader?: MediaUploaderType;
}

@InputType()
export class UploadFileInput {
  @Field()
  projectId?: string;

  @Field({ nullable: true })
  taskId?: string;

  @Field({ nullable: true })
  messageId?: string;

  @Field({ nullable: true })
  caption?: string;
}

@InputType()
export class DeleteFileInput {
  @Field(() => ID)
  fileId: string;

  @Field()
  type: 'task' | 'project' | 'chat';
}
